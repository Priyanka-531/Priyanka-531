import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import GUID

class CareerGoal(Base):
    """
    CareerGoal Database Model.
    Represents professional target goals defined by a user.
    """
    __tablename__ = "career_goals"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    target_role = Column(String(100), nullable=False)
    target_company_type = Column(String(100), nullable=True) # Product Based, Startup, FAANG, Service Based
    target_domain = Column(String(100), nullable=True) # Full Stack, AI/ML, Cloud, DevOps, Mobile
    target_date = Column(String(50), nullable=True) # e.g. "2027", "Q3 2026", "2026-12-31"
    priority = Column(String(50), default="Medium", nullable=False) # Low, Medium, High
    is_primary = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="career_goals")
