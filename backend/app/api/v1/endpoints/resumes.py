import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume, ResumeAnalysis
from app.schemas.resume import ResumeResponse
from app.services.pdf_service import sanitize_and_save_pdf, extract_text_from_pdf
from app.services.ai_service import parse_resume_with_ai

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a PDF resume, validate format and size, extract text with PyPDF,
    analyze content using AI (or deterministic fallback), and persist.
    """
    # 1. Validate and save file securely
    saved_path, safe_filename, file_size = sanitize_and_save_pdf(file, str(current_user.id))

    # 2. Extract readable text using PyPDF
    extracted_text, is_scanned = extract_text_from_pdf(saved_path)

    # 3. Create Resume database record
    resume = Resume(
        user_id=current_user.id,
        filename=safe_filename,
        original_filename=file.filename or "resume.pdf",
        file_size=file_size,
        extracted_text=extracted_text,
        is_scanned=is_scanned
    )
    db.add(resume)
    db.flush()

    # 4. Perform structured AI analysis (with deterministic fallback)
    parsed_data = parse_resume_with_ai(extracted_text)

    # 5. Persist ResumeAnalysis
    analysis = ResumeAnalysis(
        resume_id=resume.id,
        user_id=current_user.id,
        candidate_name=parsed_data.get("candidate_name"),
        professional_summary=parsed_data.get("professional_summary"),
        technical_skills=parsed_data.get("technical_skills", []),
        soft_skills=parsed_data.get("soft_skills", []),
        education=parsed_data.get("education", []),
        experience_projects=parsed_data.get("experience_projects", []),
        strengths=parsed_data.get("strengths", []),
        missing_sections=parsed_data.get("missing_sections", []),
        improvement_suggestions=parsed_data.get("improvement_suggestions", []),
        is_ai_generated=parsed_data.get("is_ai_generated", False)
    )
    db.add(analysis)
    db.commit()
    db.refresh(resume)

    return resume


@router.get("", response_model=List[ResumeResponse])
def get_user_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all uploaded resumes for the current authenticated user.
    """
    return db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume_by_id(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific resume and analysis, verifying user ownership.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied."
        )
    return resume


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a resume, its analysis, and the physical PDF file.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied."
        )

    # Attempt to delete physical file if it exists
    try:
        from app.core.config import settings
        target_path = os.path.join(settings.UPLOAD_DIR, str(current_user.id), resume.filename)
        if os.path.exists(target_path):
            os.remove(target_path)
    except Exception:
        pass

    db.delete(resume)
    db.commit()
    return None
