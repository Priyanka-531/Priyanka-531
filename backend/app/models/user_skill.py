import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import GUID

class UserSkill(Base):
    """
    UserSkill Database Model.
    Junction table representing skills claimed/possessed by a user with proficiency ratings.
    """
    __tablename__ = "user_skills"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(GUID(), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)

    proficiency_level = Column(String(50), nullable=False, default="Beginner") # Beginner, Intermediate, Advanced
    years_of_experience = Column(Float, default=0.0, nullable=False)
    is_learning = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
    )

    user = relationship("User", back_populates="user_skills")
    skill = relationship("Skill", back_populates="user_skills")
