from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    profile,
    skills,
    goals,
    resumes,
    jobs,
    skill_gap,
    roadmaps,
    dashboard
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(profile.router)
api_router.include_router(skills.router)
api_router.include_router(goals.router)
api_router.include_router(resumes.router)
api_router.include_router(jobs.router)
api_router.include_router(skill_gap.router)
api_router.include_router(roadmaps.router)
api_router.include_router(dashboard.router)
