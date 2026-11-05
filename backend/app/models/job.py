import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import GUID

class JobDescription(Base):
    """
    Target Job Description Model storing raw job postings and extracted requirements.
    """
    __tablename__ = "job_descriptions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(150), nullable=False)
    company_name = Column(String(150), nullable=True)
    raw_text = Column(Text, nullable=False)
    
    # Extracted structured requirements
    required_skills = Column(JSON, default=list, nullable=False)
    preferred_skills = Column(JSON, default=list, nullable=False)
    tools_frameworks = Column(JSON, default=list, nullable=False)
    experience_expectations = Column(Text, nullable=True)
    education_requirements = Column(Text, nullable=True)
    responsibilities = Column(JSON, default=list, nullable=False)
    teamwork_communication = Column(JSON, default=list, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="job_descriptions")
    skill_gaps = relationship("SkillGapAnalysis", back_populates="job", cascade="all, delete-orphan")
