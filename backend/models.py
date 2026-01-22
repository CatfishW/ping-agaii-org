from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    GUEST = "guest"
    STUDENT = "student"
    TEACHER = "teacher"
    ORG_ADMIN = "org_admin"
    PLATFORM_ADMIN = "platform_admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)  # Nullable for guests
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth/Guest users
    full_name = Column(String, nullable=True)
    
    role = Column(Enum(UserRole), default=UserRole.GUEST)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # OAuth fields
    google_id = Column(String, unique=True, nullable=True, index=True)
    oauth_provider = Column(String, nullable=True)  # 'google', etc.
    
    # Guest tracking
    guest_id = Column(String, unique=True, nullable=True, index=True)  # For guest sessions
    
    # Organization
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    organization = relationship("Organization", back_populates="users")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    classes_teaching = relationship("Class", back_populates="teacher", foreign_keys="Class.teacher_id")
    consent_records = relationship("ConsentRecord", back_populates="user")
    behavior_data = relationship("BehaviorData", back_populates="user")

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    domain = Column(String, unique=True, nullable=True)  # e.g., "rowan.edu"
    
    # Settings
    is_active = Column(Boolean, default=True)
    consent_text = Column(Text, nullable=True)
    privacy_policy = Column(Text, nullable=True)
    cookie_policy = Column(Text, nullable=True)
    
    # Data collection settings
    data_collection_enabled = Column(Boolean, default=True)
    keyboard_tracking_enabled = Column(Boolean, default=True)
    
    # Data retention (days)
    data_retention_days = Column(Integer, default=365)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="organization")
    classes = relationship("Class", back_populates="organization")
    module_whitelist = relationship("ModuleWhitelist", back_populates="organization")

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    join_code = Column(String, unique=True, index=True, nullable=False)
    
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    teacher = relationship("User", back_populates="classes_teaching", foreign_keys=[teacher_id])
    
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="classes")
    
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(String, unique=True, index=True, nullable=False)  # e.g., "forces-motion-basics"
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=False)  # physics, math, etc.
    
    # Unity game metadata
    unity_version = Column(String, nullable=True)
    build_path = Column(String, nullable=True)
    
    # Publishing
    is_published = Column(Boolean, default=False)
    version = Column(String, default="1.0.0")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    whitelist_entries = relationship("ModuleWhitelist", back_populates="module")

class ModuleWhitelist(Base):
    __tablename__ = "module_whitelist"

    id = Column(Integer, primary_key=True, index=True)
    
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="module_whitelist")
    
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    module = relationship("Module", back_populates="whitelist_entries")
    
    is_enabled = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for guests
    user = relationship("User", back_populates="consent_records")
    
    guest_session_id = Column(String, nullable=True)  # For guest tracking
    
    # Consent types
    terms_accepted = Column(Boolean, default=False)
    privacy_accepted = Column(Boolean, default=False)
    data_collection_accepted = Column(Boolean, default=False)
    cookie_accepted = Column(Boolean, nullable=True)  # Nullable if not required
    
    # IP and metadata
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    # Timestamp
    consented_at = Column(DateTime(timezone=True), server_default=func.now())

class BehaviorData(Base):
    __tablename__ = "behavior_data"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="behavior_data")
    
    guest_session_id = Column(String, nullable=True)  # For guest tracking
    
    # Module info
    module_id = Column(String, nullable=False)
    session_id = Column(String, nullable=False, index=True)
    
    # Event data
    event_type = Column(String, nullable=False)  # 'keypress', 'click', 'objective_complete', etc.
    event_data = Column(Text, nullable=True)  # JSON string
    
    # Timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    action = Column(String, nullable=False)  # 'user_created', 'module_published', etc.
    entity_type = Column(String, nullable=True)  # 'user', 'module', 'organization', etc.
    entity_id = Column(Integer, nullable=True)
    
    details = Column(Text, nullable=True)  # JSON string with additional info
    ip_address = Column(String, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
