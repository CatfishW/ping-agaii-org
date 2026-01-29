from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import json

from database import engine, get_db, SessionLocal
from models import Base, User, UserRole
from routers import auth_router
from routers import telemetry_router
from routers import class_router
from routers import invite_router
from routers import dashboard_router
from routers import sparc_router
from app_registry import ensure_default_apps
from routers.sparc_router import seed_wordgame_scores
from auth import get_password_hash
from sqlalchemy import text

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PING API", version="2.0.0")


@app.on_event("startup")
def seed_apps():
    db = SessionLocal()
    try:
        ensure_default_apps(db)
        ensure_admin_user(db)
        ensure_schema_updates()
        seed_wordgame_scores(db)
    finally:
        db.close()


def ensure_admin_user(db: Session):
    existing = db.query(User).filter(User.username == "admin").first()
    if existing:
        return

    admin_user = User(
        email="admin@ping.local",
        username="admin",
        full_name="Admin",
        hashed_password=get_password_hash("admin"),
        role=UserRole.PLATFORM_ADMIN,
        is_active=True,
        is_verified=True
    )
    db.add(admin_user)
    db.commit()


def ensure_schema_updates():
    with engine.connect() as conn:
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'classes' AND column_name = 'description'
                ) THEN
                    ALTER TABLE classes ADD COLUMN description TEXT;
                END IF;
            END $$;
        """))
        conn.commit()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router)
app.include_router(telemetry_router.router)
app.include_router(class_router.router)
app.include_router(invite_router.router)
app.include_router(dashboard_router.router)
app.include_router(sparc_router.router)

class Simulation(BaseModel):
    id: str
    title: str
    subject: str
    age: List[str]
    image: str
    badge: Optional[str] = ""
    tags: List[str]
    url: str
    description: str

# Simulation data
SIMULATIONS = [
    {
        "id": "forces-motion-basics",
        "title": "Forces and Motion: Basics",
        "subject": "physics",
        "age": ["k1-6", "k6-9"],
        "image": "/images/force_motion_cover.png",
        "badge": "Featured",
        "tags": ["Motion", "Force"],
        "url": "/game/forces-motion-basics",
        "description": "Explore the forces at work when pulling against a cart."
    },
    {
        "id": "bending-light",
        "title": "Bending Light",
        "subject": "physics",
        "age": ["k10-12", "beyond"],
        "image": "https://phet.colorado.edu/sims/html/bending-light/latest/bending-light-600.png",
        "badge": "Hot",
        "tags": ["Optics", "Refraction"],
        "url": "#",
        "description": "Explore bending of light between two media."
    },
    {
        "id": "circuit-construction-kit-dc",
        "title": "Circuit Construction Kit: DC",
        "subject": "physics",
        "age": ["k6-9", "k10-12"],
        "image": "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc-600.png",
        "badge": "New",
        "tags": ["Circuits", "Electricity"],
        "url": "#",
        "description": "Build circuits with batteries and resistors."
    },
    {
        "id": "balancing-act",
        "title": "Balancing Act",
        "subject": "physics",
        "age": ["k1-6", "k6-9"],
        "image": "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act-600.png",
        "badge": "",
        "tags": ["Balance", "Torque"],
        "url": "#",
        "description": "Learn about balance and equilibrium."
    },
    {
        "id": "fraction-matcher",
        "title": "Fraction Matcher",
        "subject": "math",
        "age": ["k1-6", "k6-9"],
        "image": "https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher-600.png",
        "badge": "Classic",
        "tags": ["Fractions", "Numbers"],
        "url": "#",
        "description": "Match shapes and numbers."
    },
    {
        "id": "molarity",
        "title": "Molarity",
        "subject": "chemistry",
        "age": ["k10-12", "beyond"],
        "image": "https://phet.colorado.edu/sims/html/molarity/latest/molarity-600.png",
        "badge": "",
        "tags": ["Solutions", "Concentration"],
        "url": "#",
        "description": "Learn about concentration by adding solute."
    },
    {
        "id": "natural-selection",
        "title": "Natural Selection",
        "subject": "biology",
        "age": ["k6-9", "k10-12"],
        "image": "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection-600.png",
        "badge": "Updated",
        "tags": ["Evolution", "Genetics"],
        "url": "#",
        "description": "Explore the bunny population over generations."
    }
]

@app.get("/")
async def root():
    return {"message": "Welcome to PING API"}

@app.get("/api/simulations", response_model=List[Simulation])
async def get_simulations(
    subject: Optional[str] = None,
    age: Optional[str] = None,
    search: Optional[str] = None
):
    """Get all simulations with optional filtering"""
    filtered_sims = SIMULATIONS
    
    # Filter by subject
    if subject and subject != "all":
        filtered_sims = [s for s in filtered_sims if s["subject"] == subject]
    
    # Filter by age
    if age:
        filtered_sims = [s for s in filtered_sims if age in s["age"]]
    
    # Filter by search query
    if search:
        search_lower = search.lower()
        filtered_sims = [
            s for s in filtered_sims 
            if search_lower in s["title"].lower() 
            or search_lower in s["description"].lower()
            or any(search_lower in tag.lower() for tag in s["tags"])
        ]
    
    return filtered_sims

@app.get("/api/simulations/{sim_id}", response_model=Simulation)
async def get_simulation(sim_id: str):
    """Get a specific simulation by ID"""
    sim = next((s for s in SIMULATIONS if s["id"] == sim_id), None)
    if sim:
        return sim
    return {"error": "Simulation not found"}

@app.get("/api/subjects")
async def get_subjects():
    """Get all unique subjects"""
    subjects = list(set(s["subject"] for s in SIMULATIONS))
    return {"subjects": subjects}

@app.get("/api/tags")
async def get_tags():
    """Get all unique tags"""
    all_tags = []
    for s in SIMULATIONS:
        all_tags.extend(s["tags"])
    unique_tags = list(set(all_tags))
    return {"tags": sorted(unique_tags)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
