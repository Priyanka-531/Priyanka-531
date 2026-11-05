import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import GUID

class Skill(Base):
    """
    Skill Database Model.
    Represents predefined technical skills cataloged in the system.
    """
    __tablename__ = "skills"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user_skills = relationship("UserSkill", back_populates="skill", cascade="all, delete-orphan")
