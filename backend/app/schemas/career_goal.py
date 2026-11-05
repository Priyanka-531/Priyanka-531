import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class CareerGoalBase(BaseModel):
    target_role: str
    target_company_type: Optional[str] = None
    target_domain: Optional[str] = None
    target_date: Optional[str] = None
    priority: str = "Medium" # Low, Medium, High
    is_primary: bool = False

class CareerGoalCreate(CareerGoalBase):
    pass

class CareerGoalUpdate(BaseModel):
    target_role: Optional[str] = None
    target_company_type: Optional[str] = None
    target_domain: Optional[str] = None
    target_date: Optional[str] = None
    priority: Optional[str] = None
    is_primary: Optional[bool] = None

class CareerGoalResponse(CareerGoalBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
