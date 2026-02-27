"""Skill API routes."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import get_current_user
from app.models.user_models import User
from app.schemas.skill_schemas import (
    SkillBrowseResponse,
    SkillCategoryResponse,
    SkillResponse,
    UserSkillOfferedCreate,
    UserSkillOfferedResponse,
    UserSkillWantedCreate,
    UserSkillWantedResponse,
)
from app.services import skill_service

router = APIRouter()


@router.get("/categories", response_model=list[SkillCategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db),
):
    """Get all skill categories."""
    return await skill_service.get_categories(db)


@router.get("/skills", response_model=list[SkillResponse])
async def get_skills(
    category_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get all skills, optionally filtered by category."""
    return await skill_service.get_skills(db, category_id)


@router.post("/offer", response_model=UserSkillOfferedResponse, status_code=201)
async def add_offered_skill(
    data: UserSkillOfferedCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a skill to the current user's offered skills."""
    return await skill_service.add_offered_skill(db, current_user.id, data)


@router.post("/want", response_model=UserSkillWantedResponse, status_code=201)
async def add_wanted_skill(
    data: UserSkillWantedCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a skill to the current user's wanted skills."""
    return await skill_service.add_wanted_skill(db, current_user.id, data)


@router.delete("/offer/{offered_id}", status_code=204)
async def remove_offered_skill(
    offered_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a skill from the current user's offered skills."""
    await skill_service.remove_offered_skill(db, current_user.id, offered_id)


@router.delete("/want/{wanted_id}", status_code=204)
async def remove_wanted_skill(
    wanted_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a skill from the current user's wanted skills."""
    await skill_service.remove_wanted_skill(db, current_user.id, wanted_id)


@router.get("/browse", response_model=list[SkillBrowseResponse])
async def browse_skills(
    db: AsyncSession = Depends(get_db),
):
    """Browse all skills with counts of users offering and wanting them."""
    return await skill_service.browse_skills(db)
