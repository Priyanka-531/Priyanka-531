import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import GUID

class Roadmap(Base):
    """
    Personalized Learning Roadmap generated based on target role, missing skills, and study time.
    """
    __tablename__ = "roadmaps"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(150), nullable=False)
    target_role = Column(String(100), nullable=False)
    summary = Column(Text, nullable=True)
    total_weeks = Column(Integer, default=4, nullable=False)
    daily_hours = Column(Integer, default=2, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="roadmaps")
    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapTask.week_number, RoadmapTask.day_number")


class RoadmapTask(Base):
    """
    Individual learning task in a weekly roadmap.
    """
    __tablename__ = "roadmap_tasks"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    roadmap_id = Column(GUID(), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)

    week_number = Column(Integer, nullable=False)
    day_number = Column(Integer, default=1, nullable=False)
    title = Column(String(200), nullable=False)
    explanation = Column(Text, nullable=False)
    skill_category = Column(String(100), default="Technical", nullable=False)
    estimated_duration_minutes = Column(Integer, default=60, nullable=False)
    resource_name = Column(String(200), nullable=True)
    resource_url = Column(String(500), nullable=True)

    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    roadmap = relationship("Roadmap", back_populates="tasks")
