import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import GUID

class Resume(Base):
    """
    Resume Database Model representing uploaded user resumes.
    """
    __tablename__ = "resumes"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    extracted_text = Column(Text, nullable=True)
    is_scanned = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="resumes")
    analysis = relationship("ResumeAnalysis", back_populates="resume", uselist=False, cascade="all, delete-orphan")


class ResumeAnalysis(Base):
    """
    Resume Analysis Model storing structured parsed candidate data.
    """
    __tablename__ = "resume_analyses"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    resume_id = Column(GUID(), ForeignKey("resumes.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    candidate_name = Column(String(150), nullable=True)
    professional_summary = Column(Text, nullable=True)
    technical_skills = Column(JSON, default=list, nullable=False)
    soft_skills = Column(JSON, default=list, nullable=False)
    education = Column(JSON, default=list, nullable=False)
    experience_projects = Column(JSON, default=list, nullable=False)
    strengths = Column(JSON, default=list, nullable=False)
    missing_sections = Column(JSON, default=list, nullable=False)
    improvement_suggestions = Column(JSON, default=list, nullable=False)
    is_ai_generated = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    resume = relationship("Resume", back_populates="analysis")
    user = relationship("User")
