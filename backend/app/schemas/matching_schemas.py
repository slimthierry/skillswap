import uuid
from typing import Optional

from pydantic import BaseModel

from app.schemas.skill_schemas import UserSkillOfferedResponse, UserSkillWantedResponse


class MatchedUser(BaseModel):
    id: uuid.UUID
    username: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    rating_avg: float
    rating_count: int


class SkillMatch(BaseModel):
    user: MatchedUser
    skills_they_offer_you_want: list[UserSkillOfferedResponse]
    skills_you_offer_they_want: list[UserSkillWantedResponse]
    compatibility_score: float
    rating: float

    model_config = {"from_attributes": True}
