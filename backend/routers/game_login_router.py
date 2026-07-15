import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session

from auth import create_access_token, verify_password, verify_token
from database import get_db
from models import User, UserRole


router = APIRouter(prefix="/api/game-login", tags=["game login"])


class GameLoginRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    username: str = Field(default="", max_length=254)
    password: str = Field(default="", max_length=256)
    displayName: str = Field(default="", max_length=120)
    moduleId: str = Field(default="race-game", min_length=1, max_length=100)
    deviceId: str = Field(default="", max_length=256)
    platform: str = Field(default="", max_length=100)
    appVersion: str = Field(default="", max_length=100)
    createIfMissing: bool = True


class GameWebSessionRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    moduleId: str = Field(default="race-game", min_length=1, max_length=100)
    deviceId: str = Field(default="", max_length=256)
    platform: str = Field(default="", max_length=100)
    appVersion: str = Field(default="", max_length=100)


def _authorization_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Game session token is missing.",
        )
    return authorization.split(" ", 1)[1].strip()


def _user_from_token(token: str, db: Session) -> User:
    payload = verify_token(token)
    user_id = payload.get("user_id") if payload else None
    user = db.query(User).filter(User.id == user_id).first() if user_id else None
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Game session has expired.",
        )
    return user


def _game_response(user: User, module_id: str, created: bool, username: str = "") -> dict:
    session_id = f"{module_id}-{uuid.uuid4().hex}"
    token_data = {
        "user_id": user.id,
        "guest_id": user.guest_id,
        "role": user.role.value,
    }
    if user.email:
        token_data["sub"] = user.email
    token = create_access_token(data=token_data)
    resolved_username = username or user.username or user.email or user.guest_id or f"user-{user.id}"
    return {
        "ok": True,
        "userId": str(user.id),
        "username": resolved_username,
        "displayName": user.full_name or resolved_username,
        "sessionToken": token,
        "sessionId": session_id,
        "moduleId": module_id,
        "created": created,
        "tokenType": "bearer",
        "message": "Guest session created." if user.role == UserRole.GUEST else "Signed in.",
    }


@router.post("/login")
async def game_login(payload: GameLoginRequest, db: Session = Depends(get_db)):
    username = payload.username.strip()
    is_guest = username.lower().startswith("guest-") and payload.password.startswith("guest-")
    if is_guest:
        guest = User(
            guest_id=f"guest_{uuid.uuid4().hex[:16]}",
            full_name=payload.displayName.strip() or "Guest Driver",
            role=UserRole.GUEST,
            is_active=True,
            is_verified=False,
        )
        db.add(guest)
        db.commit()
        db.refresh(guest)
        return _game_response(guest, payload.moduleId, True, username)

    if not username or not payload.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required.",
        )

    user = db.query(User).filter(or_(User.email == username, User.username == username)).first()
    if (
        user is None
        or not user.hashed_password
        or not verify_password(payload.password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive.")

    user.last_login = datetime.utcnow()
    if payload.displayName.strip() and not user.full_name:
        user.full_name = payload.displayName.strip()
    db.commit()
    return _game_response(user, payload.moduleId, False)


@router.post("/session/validate")
async def validate_game_session(
    payload: GameLoginRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    user = _user_from_token(_authorization_token(authorization), db)
    return _game_response(user, payload.moduleId, False)


@router.post("/web-session")
async def create_game_web_session(
    payload: GameWebSessionRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    user = _user_from_token(_authorization_token(authorization), db)
    return _game_response(user, payload.moduleId, False)
