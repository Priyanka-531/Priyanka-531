import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import GUID

class SkillGapAnalysis(Base):
    """
    Skill Gap Analysis Model comparing user skills (from resume or profile) against a target job.
    """
    __tablename__ = "skill_gap_analyses"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(GUID(), ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(GUID(), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True, index=True)

    match_score = Column(Float, nullable=False) # Transparent weighted match score (0 - 100)
    matched_skills = Column(JSON, default=list, nullable=False)
    missing_skills = Column(JSON, default=list, nullable=False)
    partially_matched_skills = Column(JSON, default=list, nullable=False)
    unmet_requirements = Column(JSON, default=list, nullable=False)
    strengths_to_highlight = Column(JSON, default=list, nullable=False)
    recommended_actions = Column(JSON, default=list, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="skill_gap_analyses")
    job = relationship("JobDescription", back_populates="skill_gaps")
    resume = relationship("Resume")
