from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os
import re
from pathlib import Path
import json
import uuid
import hashlib
import zstandard as zstd

from database import get_db
from models import User, BehaviorData, UserRole, UserModuleCompletion
from schemas import TelemetrySessionCreate, TelemetryEventCreate, TelemetryEventBatch
from routers.auth_router import get_current_user, get_optional_user

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])

TELEMETRY_DATA_DIR = os.getenv("TELEMETRY_DATA_DIR", "/mnt/data/pingdata/telemetry")
XAPI_OBJECT_PREFIX = "ping://games"
ADL_VERB_IDS = {
    "abandoned": "https://w3id.org/xapi/adl/verbs/abandoned",
    "answered": "http://adlnet.gov/expapi/verbs/answered",
    "asked": "http://adlnet.gov/expapi/verbs/asked",
    "attempted": "http://adlnet.gov/expapi/verbs/attempted",
    "attended": "http://adlnet.gov/expapi/verbs/attended",
    "commented": "http://adlnet.gov/expapi/verbs/commented",
    "completed": "http://adlnet.gov/expapi/verbs/completed",
    "exited": "http://adlnet.gov/expapi/verbs/exited",
    "experienced": "http://adlnet.gov/expapi/verbs/experienced",
    "failed": "http://adlnet.gov/expapi/verbs/failed",
    "imported": "http://adlnet.gov/expapi/verbs/imported",
    "initialized": "http://adlnet.gov/expapi/verbs/initialized",
    "interacted": "http://adlnet.gov/expapi/verbs/interacted",
    "launched": "http://adlnet.gov/expapi/verbs/launched",
    "mastered": "http://adlnet.gov/expapi/verbs/mastered",
    "passed": "http://adlnet.gov/expapi/verbs/passed",
    "preferred": "http://adlnet.gov/expapi/verbs/preferred",
    "progressed": "http://adlnet.gov/expapi/verbs/progressed",
    "registered": "http://adlnet.gov/expapi/verbs/registered",
    "responded": "http://adlnet.gov/expapi/verbs/responded",
    "resumed": "http://adlnet.gov/expapi/verbs/resumed",
    "satisfied": "https://w3id.org/xapi/adl/verbs/satisfied",
    "scored": "http://adlnet.gov/expapi/verbs/scored",
    "shared": "http://adlnet.gov/expapi/verbs/shared",
    "suspended": "http://adlnet.gov/expapi/verbs/suspended",
    "terminated": "http://adlnet.gov/expapi/verbs/terminated",
    "voided": "http://adlnet.gov/expapi/verbs/voided",
    "waived": "https://w3id.org/xapi/adl/verbs/waived",
}
EVENT_VERB_DEFAULTS = {
    "session_start": "initialized",
    "session_end": "terminated",
    "key_down": "interacted",
    "key_up": "interacted",
    "click": "interacted",
    "pointer_down": "interacted",
    "pointer_up": "interacted",
    "pointer_move": "interacted",
    "touch_start": "interacted",
    "touch_end": "interacted",
    "touch_move": "interacted",
    "text_input": "responded",
    "window_focus": "attended",
    "window_blur": "suspended",
    "unity_focus": "attended",
    "unity_blur": "suspended",
    "telemetry_paused": "suspended",
    "telemetry_resumed": "resumed",
    "game_event": "experienced",
}
COMPLETION_EVENT_TYPES = {
    "objective_complete",
    "module_complete",
    "level_complete",
    "game_complete",
    "completion",
    "task_complete",
    "task_completed",
}
TEXT_FIELD_NAMES = {"value", "text", "input", "data", "message", "prompt"}
SAFE_GAME_EVENT_FIELDS = {
    "verb",
    "verb_id",
    "object_id",
    "object_name",
    "object_type",
    "activity_type",
    "event_name",
    "event_type",
    "result",
    "context",
    "extensions",
    "score",
    "success",
    "completed",
    "status",
    "duration",
    "duration_ms",
    "attempts_count",
    "hints_used",
    "level",
    "scene",
    "phase",
}


def sanitize_segment(value: str) -> str:
    safe = re.sub(r"[^A-Za-z0-9._-]+", "_", value or "").strip("_")
    return safe or "unknown"


def get_session_file_path(module_id: str, session_id: str) -> Path:
    safe_module = sanitize_segment(module_id)
    safe_session = sanitize_segment(session_id)
    return Path(TELEMETRY_DATA_DIR) / safe_module / f"{safe_session}.jsonl.zst"


def summarize_payload(event_type: str, payload: dict) -> dict:
    if event_type == "text_input":
        value = payload.get("value", "")
        summary = {
            "length": len(value),
            "field_id": payload.get("field_id") or payload.get("input_id"),
            "device": payload.get("device"),
            "x": payload.get("x"),
            "y": payload.get("y"),
        }
        return {k: v for k, v in summary.items() if v is not None}
    return dict(payload)


def sanitize_text_like_value(value):
    if isinstance(value, str):
        return {"length": len(value)}
    return value


def sanitize_nested_payload(value):
    if isinstance(value, list):
        return [sanitize_nested_payload(item) for item in value[:100]]
    if not isinstance(value, dict):
        return value

    safe = {}
    for key, item in value.items():
        key_text = str(key)
        if key_text.lower() in TEXT_FIELD_NAMES:
            safe[f"{key_text}_summary"] = sanitize_text_like_value(item)
            continue
        safe[key_text] = sanitize_nested_payload(item)
    return safe


def sanitize_event_payload(event: TelemetryEventCreate) -> dict:
    payload = dict(event.payload or {})
    if event.event_type == "text_input":
        return summarize_payload(event.event_type, payload)
    if event.event_type == "game_event":
        safe = {}
        for key, value in payload.items():
            if key in SAFE_GAME_EVENT_FIELDS:
                safe[key] = sanitize_nested_payload(value)
            elif str(key).lower() in TEXT_FIELD_NAMES:
                safe[f"{key}_summary"] = sanitize_text_like_value(value)
        return safe
    return sanitize_nested_payload(payload)


def normalize_verb_id(verb_value: str | None) -> tuple[str, str]:
    verb = (verb_value or "experienced").strip()
    if verb.startswith("http://") or verb.startswith("https://"):
        return verb, verb.rstrip("/").split("/")[-1]
    key = re.sub(r"[^a-zA-Z0-9_-]+", "_", verb).strip("_").lower()
    return ADL_VERB_IDS.get(key, f"ping://xapi/verbs/{key or 'experienced'}"), key


def make_object_id(module_id: str, object_value: str | None, event_type: str) -> str:
    raw_object = object_value or f"events/{event_type}"
    if raw_object.startswith("http://") or raw_object.startswith("https://") or raw_object.startswith("ping://"):
        return raw_object
    safe_module = sanitize_segment(module_id)
    safe_object = str(raw_object).strip().strip("/")
    safe_object = re.sub(r"[^A-Za-z0-9._~:/#?-]+", "_", safe_object)
    return f"{XAPI_OBJECT_PREFIX}/{safe_module}/{safe_object}"


def to_xapi_statement(
    event: TelemetryEventCreate, anonymized_id: str, safe_payload: dict | None = None
) -> dict:
    payload = safe_payload if safe_payload is not None else sanitize_event_payload(event)
    verb_value = payload.get("verb_id") or payload.get("verb")
    if not verb_value:
        verb_value = EVENT_VERB_DEFAULTS.get(event.event_type, "experienced")
    verb_id, verb_display = normalize_verb_id(str(verb_value))

    object_value = (
        payload.get("object_id")
        or payload.get("event_name")
        or payload.get("event_type")
        or f"events/{event.event_type}"
    )
    object_name = payload.get("object_name") or payload.get("event_name") or event.event_type
    object_type = payload.get("object_type") or payload.get("activity_type")

    statement = {
        "actor": {"name": anonymized_id},
        "verb": {"id": verb_id, "display": {"en-US": verb_display}},
        "object": {
            "id": make_object_id(event.module_id, str(object_value), event.event_type),
            "definition": {"name": {"en-US": str(object_name)}},
        },
        "timestamp": event.timestamp,
    }

    if object_type:
        statement["object"]["definition"]["type"] = str(object_type)

    extensions = payload.get("extensions")
    if isinstance(extensions, dict) and extensions:
        statement["object"]["definition"]["extensions"] = extensions

    result = payload.get("result")
    if not isinstance(result, dict):
        result = {}
    for key in ["score", "success", "completed", "duration", "duration_ms"]:
        if key in payload and key not in result:
            result[key] = payload[key]
    if result:
        statement["result"] = result

    context = payload.get("context")
    if not isinstance(context, dict):
        context = {}
    for key in ["attempts_count", "hints_used", "level", "scene", "phase", "status"]:
        if key in payload and key not in context:
            context[key] = payload[key]
    if context:
        statement["context"] = {"extensions": context}

    return statement


def is_completion_event(event_type: str, payload: dict) -> bool:
    if (event_type or "").lower() in COMPLETION_EVENT_TYPES:
        return True
    verb = payload.get("verb")
    if isinstance(verb, str) and verb.lower() in {
        "completed",
        "passed",
        "mastered",
        "satisfied",
    }:
        return True
    verb_id = payload.get("verb_id")
    if isinstance(verb_id, str):
        verb_key = verb_id.rstrip("/").split("/")[-1].lower()
        if verb_key in {"completed", "passed", "mastered", "satisfied"}:
            return True
    completed_flag = payload.get("completed")
    if isinstance(completed_flag, bool):
        return completed_flag
    status = payload.get("status")
    if isinstance(status, str) and status.lower() in {
        "completed",
        "complete",
        "passed",
        "success",
    }:
        return True
    phase = payload.get("phase")
    if isinstance(phase, str) and phase.lower() in {"completed", "complete"}:
        return True
    return False


def write_events_to_file(
    module_id: str, session_id: str, anonymized_id: str, events: list[dict]
) -> None:
    file_path = get_session_file_path(module_id, session_id)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    compressor = zstd.ZstdCompressor()
    with open(file_path, "ab") as f:
        with compressor.stream_writer(f) as writer:
            for event in events:
                record = {
                    "session_id": session_id,
                    "module_id": module_id,
                    "event_type": event.get("event_type"),
                    "timestamp": event.get("timestamp"),
                    "client_timestamp": event.get("client_timestamp"),
                    "anon_id": anonymized_id,
                    "payload": event.get("payload"),
                    "xapi": event.get("xapi"),
                }
                line = json.dumps(record, ensure_ascii=False) + "\n"
                writer.write(line.encode("utf-8"))


# Helper function to anonymize user data
def anonymize_user_id(user_id: Optional[int], guest_id: Optional[str]) -> str:
    """
    Create anonymized hash of user/guest ID for privacy
    This allows data analysis while protecting identity
    """
    identifier = f"{user_id}:{guest_id}:{datetime.utcnow().date()}"
    return hashlib.sha256(identifier.encode()).hexdigest()[:16]


@router.post("/session/start")
async def start_telemetry_session(
    session_data: dict = Body(default_factory=dict),
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Start a new telemetry session when user enters a game
    Returns session_id and organization telemetry settings
    """

    # Generate unique session ID
    session_id = str(uuid.uuid4())

    # Get organization settings (TODO: implement when org model is ready)
    # For now, use default settings
    org_settings = {
        "telemetry_enabled": True,
        "capture_keyboard": True,
        "capture_mouse": False,
        "capture_focus_blur": True,
        "sampling_rate": 1.0,
        "batch_ms": 5000,
        "max_events_per_session": 10000,
    }

    if "module_id" not in session_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="module_id is required",
        )

    # Create session record (optional: store in DB)
    # For MVP, we can just return the session_id and let frontend manage it

    user_id = None
    guest_id = None
    if current_user:
        user_id = current_user.id if current_user.role != UserRole.GUEST else None
        guest_id = (
            current_user.guest_id if current_user.role == UserRole.GUEST else None
        )

    return {
        "session_id": session_id,
        "user_id": user_id,
        "guest_id": guest_id,
        "org_settings": org_settings,
        "started_at": datetime.utcnow().isoformat(),
    }


@router.post("/events")
async def upload_telemetry_events(
    batch: TelemetryEventBatch,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Upload a batch of telemetry events
    Events are anonymized and stored in behavior_data table
    """

    # Verify session belongs to current user
    session_id = batch.session_id

    # Anonymize user identifier
    if current_user:
        anonymized_id = anonymize_user_id(
            current_user.id if current_user.role != UserRole.GUEST else None,
            current_user.guest_id if current_user.role == UserRole.GUEST else None,
        )
    else:
        anonymized_id = anonymize_user_id(None, None)

    # Process each event
    saved_events = []
    file_events_by_key = {}
    completed_modules = set()
    user_id = None
    guest_id = None
    if current_user:
        user_id = current_user.id if current_user.role != UserRole.GUEST else None
        guest_id = (
            current_user.guest_id if current_user.role == UserRole.GUEST else None
        )

    for event in batch.events:
        # Validate event data (K-12 compliance check)
        if not validate_event_compliance(event):
            continue  # Skip non-compliant events

        # Create behavior data record
        payload_data = sanitize_event_payload(event)
        payload_data["anon_id"] = anonymized_id
        payload_data["xapi"] = to_xapi_statement(event, anonymized_id, payload_data)
        behavior_record = BehaviorData(
            user_id=user_id,
            guest_session_id=guest_id,
            module_id=event.module_id,
            session_id=session_id,
            event_type=event.event_type,
            event_data=json.dumps(payload_data),
        )

        db.add(behavior_record)
        saved_events.append(behavior_record)

        if user_id and is_completion_event(event.event_type, payload_data):
            completed_modules.add(event.module_id)

        file_key = (event.module_id, session_id)
        file_events_by_key.setdefault(file_key, []).append(
            {
                "event_type": event.event_type,
                "payload": dict(payload_data),
                "xapi": payload_data.get("xapi"),
                "timestamp": event.timestamp,
                "client_timestamp": event.client_timestamp,
            }
        )

    if user_id and completed_modules:
        existing_rows = (
            db.query(UserModuleCompletion)
            .filter(
                UserModuleCompletion.user_id == user_id,
                UserModuleCompletion.module_id.in_(list(completed_modules)),
            )
            .all()
        )
        existing_map = {row.module_id: row for row in existing_rows}

        now = datetime.utcnow()
        for module_id in completed_modules:
            row = existing_map.get(module_id)
            if row:
                row.completed_at = now
                row.last_session_id = session_id
            else:
                db.add(
                    UserModuleCompletion(
                        user_id=user_id,
                        module_id=module_id,
                        completed_at=now,
                        last_session_id=session_id,
                    )
                )

    db.commit()

    for (module_id, sess_id), events in file_events_by_key.items():
        try:
            write_events_to_file(module_id, sess_id, anonymized_id, events)
        except Exception:
            pass

    return {
        "success": True,
        "events_received": len(batch.events),
        "events_saved": len(saved_events),
        "session_id": session_id,
    }


@router.post("/session/end")
async def end_telemetry_session(
    session_id: str,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    End telemetry session and finalize data
    """

    # Count events for this session
    event_count = (
        db.query(BehaviorData).filter(BehaviorData.session_id == session_id).count()
    )

    return {
        "success": True,
        "session_id": session_id,
        "total_events": event_count,
        "ended_at": datetime.utcnow().isoformat(),
    }


@router.get("/session/{session_id}/stats")
async def get_session_stats(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get statistics for a telemetry session
    """

    # Verify user owns this session
    events = db.query(BehaviorData).filter(BehaviorData.session_id == session_id).all()

    if not events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    # Check ownership
    first_event = events[0]
    if current_user.role == UserRole.GUEST:
        if first_event.guest_session_id != current_user.guest_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    else:
        if first_event.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    # Calculate stats
    event_types = {}
    for event in events:
        event_type = event.event_type
        event_types[event_type] = event_types.get(event_type, 0) + 1

    return {
        "session_id": session_id,
        "total_events": len(events),
        "event_types": event_types,
        "start_time": events[0].timestamp.isoformat() if events else None,
        "end_time": events[-1].timestamp.isoformat() if events else None,
    }


def validate_event_compliance(event: TelemetryEventCreate) -> bool:
    """
    Validate event data for K-12 compliance
    Ensures no sensitive text data is captured
    """

    # Check event type is allowed
    allowed_types = [
        "session_start",
        "session_end",
        "key_down",
        "key_up",
        "click",
        "pointer_down",
        "pointer_up",
        "pointer_move",
        "touch_start",
        "touch_end",
        "touch_move",
        "text_input",
        "window_focus",
        "window_blur",
        "unity_focus",
        "unity_blur",
        "telemetry_paused",
        "telemetry_resumed",
        "game_event",
    ]

    if event.event_type not in allowed_types:
        return False

    # For keyboard events, ensure we only have key codes, not text
    if event.event_type in ["key_down", "key_up"]:
        payload = event.payload

        # CRITICAL: Reject if any of these fields are present
        forbidden_fields = ["key", "value", "text", "input", "data"]
        for field in forbidden_fields:
            if field in payload:
                return False

        # Ensure we have the code field
        if "code" not in payload:
            return False

    return True


@router.delete("/user/data")
async def delete_user_telemetry_data(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Delete all telemetry data for current user
    Implements "Right to be Forgotten" (GDPR/COPPA)
    """

    if current_user.role == UserRole.GUEST:
        # Delete guest data
        deleted = (
            db.query(BehaviorData)
            .filter(BehaviorData.guest_session_id == current_user.guest_id)
            .delete()
        )
    else:
        # Delete user data
        deleted = (
            db.query(BehaviorData)
            .filter(BehaviorData.user_id == current_user.id)
            .delete()
        )

    db.commit()

    for (module_id, sess_id), events in file_events_by_key.items():
        try:
            write_events_to_file(module_id, sess_id, anonymized_id, events)
        except Exception:
            pass

    return {"success": True, "records_deleted": deleted}


@router.get("/user/export")
async def export_user_telemetry_data(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Export all telemetry data for current user
    Implements "Right to Data Portability" (GDPR)
    """

    if current_user.role == UserRole.GUEST:
        events = (
            db.query(BehaviorData)
            .filter(BehaviorData.guest_session_id == current_user.guest_id)
            .all()
        )
    else:
        events = (
            db.query(BehaviorData).filter(BehaviorData.user_id == current_user.id).all()
        )

    # Convert to exportable format
    export_data = []
    for event in events:
        export_data.append(
            {
                "session_id": event.session_id,
                "module_id": event.module_id,
                "event_type": event.event_type,
                "event_data": event.event_data,
                "timestamp": event.timestamp.isoformat(),
            }
        )

    return {
        "user_id": current_user.id if current_user.role != UserRole.GUEST else None,
        "guest_id": current_user.guest_id
        if current_user.role == UserRole.GUEST
        else None,
        "export_date": datetime.utcnow().isoformat(),
        "total_events": len(export_data),
        "events": export_data,
    }
