import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import GUID

class CareerProfile(Base):
    """
    CareerProfile Database Model.
    Stores personal, academic, and initial career preferences for a user.
    One-to-One relationship with User.
    """
    __tablename__ = "career_profiles"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Personal Info
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    bio = Column(Text, nullable=True)

    # Education
    college = Column(String(255), nullable=True)
    degree = Column(String(100), nullable=True)
    branch = Column(String(100), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    current_year = Column(String(50), nullable=True)
    cgpa = Column(Float, nullable=True)

    # Career Preferences
    experience_level = Column(String(50), nullable=True)  # Beginner, Intermediate, Advanced
    preferred_work_mode = Column(String(50), nullable=True)  # Remote, Hybrid, On-site
    preferred_locations = Column(String(255), nullable=True)
    target_role = Column(String(100), nullable=True)
    target_domain = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="career_profile")
