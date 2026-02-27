"""Matching API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import get_current_user
from app.models.user_models import User
from app.schemas.matching_schemas import SkillMatch
from app.services import matching_service

router = APIRouter()


@router.get("/matches", response_model=list[SkillMatch])
async def get_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Find users who offer skills you want or want skills you offer.
    Results are ranked by compatibility score.
    """
    matches = await matching_service.find_matches(db, current_user.id)
    return matches


@router.get("/mutual-matches", response_model=list[SkillMatch])
async def get_mutual_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Find only mutual matches: users who offer something you want AND
    want something you offer. Best candidates for direct skill exchange.
    """
    matches = await matching_service.find_mutual_matches(db, current_user.id)
    return matches
