import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.skill_models import ProficiencyLevel


class SkillCategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    icon: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class SkillResponse(BaseModel):
    id: uuid.UUID
    name: str
    category_id: uuid.UUID
    description: Optional[str] = None
    category: Optional[SkillCategoryResponse] = None

    model_config = {"from_attributes": True}


class UserSkillOfferedCreate(BaseModel):
    skill_id: uuid.UUID
    proficiency_level: ProficiencyLevel = ProficiencyLevel.INTERMEDIATE
    description: Optional[str] = None
    hourly_rate_credits: float = Field(default=1.0, ge=0.25, le=5.0)


class UserSkillOfferedResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    skill_id: uuid.UUID
    proficiency_level: ProficiencyLevel
    description: Optional[str] = None
    hourly_rate_credits: float
    is_active: bool
    skill: Optional[SkillResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserSkillWantedCreate(BaseModel):
    skill_id: uuid.UUID
    desired_level: ProficiencyLevel = ProficiencyLevel.INTERMEDIATE
    notes: Optional[str] = None


class UserSkillWantedResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    skill_id: uuid.UUID
    desired_level: ProficiencyLevel
    notes: Optional[str] = None
    skill: Optional[SkillResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SkillBrowseResponse(BaseModel):
    skill: SkillResponse
    offered_count: int
    wanted_count: int
