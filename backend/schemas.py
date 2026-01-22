from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from models import UserRole

# User Schemas
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    username: Optional[str] = None
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: Optional[str]
    username: Optional[str]
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    is_verified: bool
    organization_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

# Guest Session
class GuestSessionCreate(BaseModel):
    session_id: str

class GuestSessionResponse(BaseModel):
    guest_id: str
    session_id: str
    access_token: str
    token_type: str

# Consent Schemas
class ConsentCreate(BaseModel):
    terms_accepted: bool
    privacy_accepted: bool
    data_collection_accepted: bool
    cookie_accepted: Optional[bool] = None

class ConsentResponse(BaseModel):
    id: int
    user_id: Optional[int]
    guest_session_id: Optional[str]
    terms_accepted: bool
    privacy_accepted: bool
    data_collection_accepted: bool
    cookie_accepted: Optional[bool]
    consented_at: datetime
    
    class Config:
        from_attributes = True

# Organization Schemas
class OrganizationBase(BaseModel):
    name: str
    domain: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    consent_text: Optional[str] = None
    privacy_policy: Optional[str] = None
    
class OrganizationResponse(BaseModel):
    id: int
    name: str
    domain: Optional[str]
    is_active: bool
    data_collection_enabled: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Class Schemas
class ClassCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ClassResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    join_code: str
    teacher_id: int
    organization_id: Optional[int]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ClassWithStats(ClassResponse):
    student_count: int = 0
    guest_count: int = 0
    total_sessions: int = 0
    module_count: int = 0

class JoinCodeValidate(BaseModel):
    join_code: str

class StudentProgress(BaseModel):
    user_id: Optional[int]
    guest_id: Optional[str]
    name: str
    email: Optional[str]
    total_sessions: int
    total_events: int
    last_active: Optional[datetime]

# Telemetry Schemas
class TelemetrySessionCreate(BaseModel):
    module_id: int
    
class TelemetryEventCreate(BaseModel):
    session_id: str
    user_id: Optional[int] = None
    guest_id: Optional[str] = None
    module_id: int
    event_type: str
    payload: dict
    timestamp: str
    client_timestamp: int

class TelemetryEventBatch(BaseModel):
    session_id: str
    events: List[TelemetryEventCreate]

# Behavior Data Schemas (legacy - being replaced by Telemetry)
class BehaviorDataCreate(BaseModel):
    module_id: str
    session_id: str
    event_type: str
    event_data: Optional[str] = None

class BehaviorDataResponse(BaseModel):
    id: int
    user_id: Optional[int]
    guest_session_id: Optional[str]
    module_id: str
    session_id: str
    event_type: str
    event_data: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True
