import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.session_models import SessionStatus
from app.schemas.user_schemas import UserResponse
from app.schemas.skill_schemas import SkillResponse


class SessionCreate(BaseModel):
    teacher_id: uuid.UUID
    skill_id: uuid.UUID
    scheduled_at: datetime
    duration_hours: float = Field(..., gt=0, le=8.0)
    notes: Optional[str] = None


class SessionResponse(BaseModel):
    id: uuid.UUID
    teacher_id: uuid.UUID
    learner_id: uuid.UUID
    skill_id: uuid.UUID
    scheduled_at: datetime
    duration_hours: float
    status: SessionStatus
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    teacher: Optional[UserResponse] = None
    learner: Optional[UserResponse] = None
    skill: Optional[SkillResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SessionReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class SessionReviewResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    reviewer_id: uuid.UUID
    reviewee_id: uuid.UUID
    rating: int
    comment: Optional[str] = None
    reviewer: Optional[UserResponse] = None
    reviewee: Optional[UserResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}
