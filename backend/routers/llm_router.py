from collections import defaultdict, deque
from threading import Lock
from time import monotonic
from typing import Any, Deque, Dict, List, Literal, Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel, ConfigDict, Field

from services.llm_primary_service import (
    LlmPrimaryService,
    LlmPrimaryTimeout,
    LlmPrimaryUnavailable,
)


router = APIRouter(prefix="/api/llm/primary/v1", tags=["LLM relay"])

ALLOWED_ORIGINS = {
    "https://ping.agaii.org",
    "https://game.agaii.org",
    "http://localhost:3000",
    "http://localhost:3001",
}
RATE_LIMIT_REQUESTS = 60
RATE_LIMIT_WINDOW_SECONDS = 60.0
_request_times: Dict[str, Deque[float]] = defaultdict(deque)
_rate_limit_lock = Lock()


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1, max_length=12000)


class ChatCompletionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    model: Literal["gpt-5.5"]
    messages: List[ChatMessage] = Field(min_length=1, max_length=32)
    temperature: Optional[float] = Field(default=None, ge=0.0, le=2.0)
    top_p: Optional[float] = Field(default=None, gt=0.0, le=1.0)
    max_tokens: Optional[int] = Field(default=None, ge=1, le=2000)
    chat_template_kwargs: Optional[Dict[str, Any]] = None


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("x-real-ip") or request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def _enforce_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin and origin not in ALLOWED_ORIGINS:
        raise HTTPException(status_code=403, detail="Origin is not allowed.")


def _enforce_rate_limit(request: Request) -> None:
    key = _client_key(request)
    now = monotonic()
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS
    with _rate_limit_lock:
        timestamps = _request_times[key]
        while timestamps and timestamps[0] < cutoff:
            timestamps.popleft()
        if len(timestamps) >= RATE_LIMIT_REQUESTS:
            raise HTTPException(status_code=429, detail="Too many LLM requests.")
        timestamps.append(now)


def _get_service(request: Request) -> LlmPrimaryService:
    service = getattr(request.app.state, "llm_primary_service", None)
    if service is None or not service.configured:
        raise HTTPException(status_code=503, detail="Primary LLM relay is unavailable.")
    return service


@router.get("/models")
async def list_models():
    return {
        "object": "list",
        "data": [{"id": "gpt-5.5", "object": "model", "owned_by": "ping-relay"}],
    }


@router.post("/chat/completions")
async def create_chat_completion(payload: ChatCompletionRequest, request: Request):
    _enforce_origin(request)
    _enforce_rate_limit(request)
    service = _get_service(request)

    try:
        upstream_response = await service.chat_completions(
            payload.model_dump(exclude_none=True)
        )
    except LlmPrimaryTimeout as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except LlmPrimaryUnavailable as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        media_type="application/json",
        headers={"Cache-Control": "no-store"},
    )
