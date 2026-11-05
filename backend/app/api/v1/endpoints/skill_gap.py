import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.job import JobDescription
from app.models.resume import Resume
from app.models.user_skill import UserSkill
from app.models.skill import Skill
from app.models.skill_gap import SkillGapAnalysis
from app.schemas.skill_gap import SkillGapAnalyzeRequest, SkillGapResponse
from app.services.skill_gap_service import calculate_skill_gap

router = APIRouter(prefix="/skill-gap", tags=["Skill Gap"])

@router.post("/analyze", response_model=SkillGapResponse, status_code=status.HTTP_201_CREATED)
def analyze_skill_gap(
    payload: SkillGapAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compare candidate skills against a target job description.
    Uses candidate skills from the specified resume, or falls back to profile user_skills if none provided.
    """
    # 1. Fetch job description and verify ownership
    job = db.query(JobDescription).filter(JobDescription.id == payload.job_id, JobDescription.user_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found or access denied."
        )

    # 2. Gather candidate skills
    candidate_skills = []
    if payload.resume_id:
        resume = db.query(Resume).filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id).first()
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found or access denied."
            )
        if resume.analysis and resume.analysis.technical_skills:
            candidate_skills = list(resume.analysis.technical_skills)

    # If no resume skills found or no resume provided, supplement with claimed profile skills
    user_skills = db.query(UserSkill).join(Skill).filter(UserSkill.user_id == current_user.id).all()
    for us in user_skills:
        if us.skill and us.skill.name not in candidate_skills:
            candidate_skills.append(us.skill.name)

    # 3. Calculate deterministic, transparent skill gap
    analysis_result = calculate_skill_gap(
        candidate_skills=candidate_skills,
        job_required_skills=job.required_skills or [],
        job_preferred_skills=job.preferred_skills or []
    )

    # 4. Persist analysis
    analysis = SkillGapAnalysis(
        user_id=current_user.id,
        job_id=job.id,
        resume_id=payload.resume_id,
        match_score=analysis_result["match_score"],
        matched_skills=analysis_result["matched_skills"],
        missing_skills=analysis_result["missing_skills"],
        partially_matched_skills=analysis_result["partially_matched_skills"],
        unmet_requirements=analysis_result["unmet_requirements"],
        strengths_to_highlight=analysis_result["strengths_to_highlight"],
        recommended_actions=analysis_result["recommended_actions"]
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis


@router.get("", response_model=List[SkillGapResponse])
def get_user_skill_gaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all skill-gap analyses for the authenticated user.
    """
    return db.query(SkillGapAnalysis).filter(SkillGapAnalysis.user_id == current_user.id).order_by(SkillGapAnalysis.created_at.desc()).all()


@router.get("/{analysis_id}", response_model=SkillGapResponse)
def get_skill_gap_by_id(
    analysis_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific skill-gap analysis, verifying user ownership.
    """
    analysis = db.query(SkillGapAnalysis).filter(SkillGapAnalysis.id == analysis_id, SkillGapAnalysis.user_id == current_user.id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill-gap analysis not found or access denied."
        )
    return analysis
