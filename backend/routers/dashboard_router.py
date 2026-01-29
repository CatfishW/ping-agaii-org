from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, text, create_engine
from datetime import datetime, timedelta, date
import os
import sqlite3

from database import get_read_db, get_db
from models import User, UserRole, BehaviorData, App, ExternalAccount
from schemas import DashboardOverview, DashboardTotals, DashboardTrendPoint, DashboardAppSummary
from routers.auth_router import get_current_user
from app_registry import DEFAULT_APPS

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def verify_admin_access(current_user: User):
    if current_user.role not in [UserRole.ORG_ADMIN, UserRole.PLATFORM_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )


def get_ping_metrics(db: Session):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_sessions = db.query(func.count(distinct(BehaviorData.session_id))).scalar() or 0
    total_events = db.query(func.count(BehaviorData.id)).scalar() or 0
    last_event_at = db.query(func.max(BehaviorData.timestamp)).scalar()

    return {
        "users": total_users,
        "sessions": total_sessions,
        "events": total_events,
        "last_event_at": last_event_at,
        "connected": True
    }


def build_ping_trend(db: Session, range_days: int):
    range_days = max(1, min(range_days, 90))
    start_date = datetime.utcnow().date() - timedelta(days=range_days - 1)
    start_dt = datetime.combine(start_date, datetime.min.time())

    rows = db.query(
        func.date(BehaviorData.timestamp).label("day"),
        func.count(BehaviorData.id).label("events"),
        func.count(distinct(BehaviorData.session_id)).label("sessions")
    ).filter(
        BehaviorData.timestamp.isnot(None),
        BehaviorData.timestamp >= start_dt
    ).group_by("day").all()

    row_map = {}
    for row in rows:
        day_value = row.day
        if isinstance(day_value, str):
            try:
                day_value = datetime.fromisoformat(day_value).date()
            except ValueError:
                continue
        row_map[day_value] = row
    trend = []
    for i in range(range_days):
        day = start_date + timedelta(days=i)
        row = row_map.get(day)
        trend.append(DashboardTrendPoint(
            date=day,
            events=row.events if row else 0,
            sessions=row.sessions if row else 0
        ))

    return trend


def get_lammp_metrics():
    db_path = os.getenv("LAMMP_DB_PATH", "/mnt/data/Yanlai/LAMMP/backend/app.db")
    if not os.path.exists(db_path):
        return {
            "users": 0,
            "sessions": 0,
            "events": 0,
            "last_event_at": None,
            "connected": False
        }

    try:
        conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0] or 0

        cursor.execute("SELECT COUNT(*) FROM chat_sessions")
        total_sessions = cursor.fetchone()[0] or 0

        cursor.execute("SELECT COUNT(*) FROM chat_messages")
        total_events = cursor.fetchone()[0] or 0

        cursor.execute("SELECT MAX(created_at) FROM chat_messages")
        last_event_at = cursor.fetchone()[0]
        if isinstance(last_event_at, str):
            try:
                last_event_at = datetime.fromisoformat(last_event_at)
            except ValueError:
                last_event_at = None

        conn.close()

        return {
            "users": total_users,
            "sessions": total_sessions,
            "events": total_events,
            "last_event_at": last_event_at,
            "connected": True
        }
    except Exception:
        return {
            "users": 0,
            "sessions": 0,
            "events": 0,
            "last_event_at": None,
            "connected": False
        }


@router.post("/sync/lammp")
async def sync_lammp_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_admin_access(current_user)

    db_path = os.getenv("LAMMP_DB_PATH", "/mnt/data/Yanlai/LAMMP/backend/app.db")
    if not os.path.exists(db_path):
        raise HTTPException(status_code=404, detail="LAMMP database not found")

    created = 0
    linked = 0

    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email FROM users")

    for external_id, email in cursor.fetchall():
        if not email:
            continue
        user = db.query(User).filter(User.email == email).first()
        if not user:
            continue

        linked += 1
        existing = db.query(ExternalAccount).filter(
            ExternalAccount.provider == "lammp",
            ExternalAccount.external_email == email
        ).first()
        if existing:
            continue

        db.add(ExternalAccount(
            user_id=user.id,
            provider="lammp",
            external_user_id=str(external_id),
            external_email=email
        ))
        created += 1

    db.commit()
    conn.close()

    return {
        "success": True,
        "linked_users": linked,
        "new_links": created
    }


def get_game_metrics():
    db_url = os.getenv("GAME_DB_URL")
    if not db_url:
        return {
            "users": 0,
            "sessions": 0,
            "events": 0,
            "last_event_at": None,
            "connected": False
        }

    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            total_users = conn.execute(text("SELECT COUNT(*) FROM users")).scalar() or 0
            last_event_at = conn.execute(text("SELECT MAX(created_at) FROM users")).scalar()

        return {
            "users": total_users,
            "sessions": 0,
            "events": 0,
            "last_event_at": last_event_at,
            "connected": True
        }
    except Exception:
        return {
            "users": 0,
            "sessions": 0,
            "events": 0,
            "last_event_at": None,
            "connected": False
        }


@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview(
    range_days: int = 14,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_read_db)
):
    verify_admin_access(current_user)

    app_rows = {app.slug: app for app in db.query(App).all()}
    ping_metrics = get_ping_metrics(db)
    lammp_metrics = get_lammp_metrics()
    game_metrics = get_game_metrics()

    app_metrics_map = {
        "ping": ping_metrics,
        "lammp": lammp_metrics,
        "game": game_metrics
    }

    apps_summary = []
    total_users = 0
    total_sessions = 0
    total_events = 0

    for app_meta in DEFAULT_APPS:
        slug = app_meta["slug"]
        metrics = app_metrics_map.get(slug, {
            "users": 0,
            "sessions": 0,
            "events": 0,
            "last_event_at": None,
            "connected": False
        })

        app_row = app_rows.get(slug)
        apps_summary.append(DashboardAppSummary(
            slug=slug,
            name=app_row.name if app_row else app_meta["name"],
            status=(app_row.status.value if app_row else "active"),
            base_url=app_row.base_url if app_row else app_meta.get("base_url"),
            connected=metrics["connected"],
            users=metrics["users"],
            sessions=metrics["sessions"],
            events=metrics["events"],
            last_event_at=metrics["last_event_at"]
        ))

        total_users += metrics["users"]
        total_sessions += metrics["sessions"]
        total_events += metrics["events"]

    overview = DashboardOverview(
        totals=DashboardTotals(
            apps=len(DEFAULT_APPS),
            users=total_users,
            sessions=total_sessions,
            events=total_events
        ),
        apps=apps_summary,
        trend=build_ping_trend(db, range_days),
        read_replica=bool(os.getenv("READ_DATABASE_URL")),
        generated_at=datetime.utcnow()
    )

    return overview
