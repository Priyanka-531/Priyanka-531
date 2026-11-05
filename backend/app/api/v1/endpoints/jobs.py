import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.job import JobDescription
from app.schemas.job import JobAnalyzeRequest, JobResponse
from app.services.ai_service import extract_job_requirements_with_ai

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/analyze", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def analyze_and_save_job(
    payload: JobAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Extract requirements from raw job description and save to database.
    """
    # 1. Run AI / deterministic extraction
    title = payload.title or "Software Developer"
    extracted = extract_job_requirements_with_ai(payload.raw_text, title=title, company=payload.company_name)

    # 2. Persist job description
    job = JobDescription(
        user_id=current_user.id,
        title=title,
        company_name=payload.company_name,
        raw_text=payload.raw_text,
        required_skills=extracted.get("required_skills", []),
        preferred_skills=extracted.get("preferred_skills", []),
        tools_frameworks=extracted.get("tools_frameworks", []),
        experience_expectations=extracted.get("experience_expectations"),
        education_requirements=extracted.get("education_requirements"),
        responsibilities=extracted.get("responsibilities", []),
        teamwork_communication=extracted.get("teamwork_communication", [])
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return job


@router.get("", response_model=List[JobResponse])
def get_user_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all target job descriptions saved by the user.
    """
    return db.query(JobDescription).filter(JobDescription.user_id == current_user.id).order_by(JobDescription.created_at.desc()).all()


@router.get("/{job_id}", response_model=JobResponse)
def get_job_by_id(
    job_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a single job description, verifying user ownership.
    """
    job = db.query(JobDescription).filter(JobDescription.id == job_id, JobDescription.user_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found or access denied."
        )
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a saved job description.
    """
    job = db.query(JobDescription).filter(JobDescription.id == job_id, JobDescription.user_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found or access denied."
        )
    db.delete(job)
    db.commit()
    return None
