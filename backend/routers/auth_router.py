from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from database import get_db
from models import User, ConsentRecord, UserRole
from schemas import (
    UserCreate, UserLogin, UserResponse, Token, 
    GuestSessionCreate, GuestSessionResponse,
    ConsentCreate, ConsentResponse
)
from auth import (
    verify_password, get_password_hash, 
    create_access_token, verify_token
)

router = APIRouter(prefix="/api/auth", tags=["authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Dependency to get current user
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    user_id: int = payload.get("user_id")
    
    if email is None and user_id is None:
        raise credentials_exception
    
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    else:
        user = db.query(User).filter(User.email == email).first()
    
    if user is None:
        raise credentials_exception
    
    return user

# User Registration
@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account"""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username exists (if provided)
    if user_data.username:
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        username=user_data.username or user_data.email.split('@')[0],
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=UserRole.STUDENT,  # Default role
        is_verified=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

# User Login
@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login with email and password"""
    
    # Find user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Alternative login endpoint for JSON
@router.post("/login-json", response_model=Token)
async def login_json(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login with JSON body (email and password)"""
    
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Get current user info
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current logged in user information"""
    return current_user

# Guest Session Creation
@router.post("/guest", response_model=GuestSessionResponse)
async def create_guest_session(
    guest_data: GuestSessionCreate,
    db: Session = Depends(get_db)
):
    """Create a guest session for anonymous users"""
    
    # Generate unique guest ID
    guest_id = f"guest_{uuid.uuid4().hex[:12]}"
    
    # Create guest user
    guest_user = User(
        guest_id=guest_id,
        role=UserRole.GUEST,
        is_active=True
    )
    
    db.add(guest_user)
    db.commit()
    db.refresh(guest_user)
    
    # Create access token for guest
    access_token = create_access_token(
        data={"guest_id": guest_id, "user_id": guest_user.id, "role": "guest"}
    )
    
    return {
        "guest_id": guest_id,
        "session_id": guest_data.session_id,
        "access_token": access_token,
        "token_type": "bearer"
    }

# Submit Consent
@router.post("/consent", response_model=ConsentResponse)
async def submit_consent(
    consent_data: ConsentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit consent agreement (for both guests and registered users)"""
    
    # Validate required consents
    if not consent_data.terms_accepted or not consent_data.privacy_accepted or not consent_data.data_collection_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Terms, privacy, and data collection consent are required"
        )
    
    # Create consent record
    consent_record = ConsentRecord(
        user_id=current_user.id if current_user.role != UserRole.GUEST else None,
        guest_session_id=current_user.guest_id if current_user.role == UserRole.GUEST else None,
        terms_accepted=consent_data.terms_accepted,
        privacy_accepted=consent_data.privacy_accepted,
        data_collection_accepted=consent_data.data_collection_accepted,
        cookie_accepted=consent_data.cookie_accepted
    )
    
    db.add(consent_record)
    db.commit()
    db.refresh(consent_record)
    
    return consent_record

# Check if user has valid consent
@router.get("/consent/check")
async def check_consent(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if the current user has submitted required consents"""
    
    # Query consent records for the user
    if current_user.role == UserRole.GUEST:
        consent = db.query(ConsentRecord).filter(
            ConsentRecord.guest_session_id == current_user.guest_id
        ).order_by(ConsentRecord.consented_at.desc()).first()
    else:
        consent = db.query(ConsentRecord).filter(
            ConsentRecord.user_id == current_user.id
        ).order_by(ConsentRecord.consented_at.desc()).first()
    
    if not consent:
        return {
            "has_consent": False,
            "message": "No consent record found"
        }
    
    # Check if all required consents are accepted
    has_required_consents = (
        consent.terms_accepted and 
        consent.privacy_accepted and 
        consent.data_collection_accepted
    )
    
    return {
        "has_consent": has_required_consents,
        "consent_date": consent.consented_at,
        "terms_accepted": consent.terms_accepted,
        "privacy_accepted": consent.privacy_accepted,
        "data_collection_accepted": consent.data_collection_accepted,
        "cookie_accepted": consent.cookie_accepted
    }
