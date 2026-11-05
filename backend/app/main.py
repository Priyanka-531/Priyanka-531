from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
import app.models  # Ensure all models are loaded into Base.metadata
from app.services.seed_service import seed_initial_skills
from app.api.v1.router import api_router

# 1. Create database tables on startup if they do not exist
Base.metadata.create_all(bind=engine)

# Seed predefined skills into database
db = SessionLocal()
try:
    seed_initial_skills(db)
finally:
    db.close()

# 2. Instantiate FastAPI Application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for SkillForge AI Career Intelligence Platform",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# 3. Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Include API v1 Router
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "message": "Welcome to SkillForge AI Backend API!"
    }

@app.get("/health", tags=["Health Check"])
def health_check():
    db_status = "connected"
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = "unavailable"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "project": settings.PROJECT_NAME,
        "version": "1.0.0"
    }
