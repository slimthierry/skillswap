"""Skill service for managing skill categories and user skills."""

import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.exceptions import SkillNotFoundError
from app.models.skill_models import (
    Skill,
    SkillCategory,
    UserSkillOffered,
    UserSkillWanted,
)
from app.schemas.skill_schemas import (
    SkillBrowseResponse,
    SkillResponse,
    UserSkillOfferedCreate,
    UserSkillWantedCreate,
)


async def get_categories(db: AsyncSession) -> list[SkillCategory]:
    """Get all skill categories."""
    result = await db.execute(
        select(SkillCategory).order_by(SkillCategory.name)
    )
    return list(result.scalars().all())


async def get_skills(
    db: AsyncSession, category_id: Optional[uuid.UUID] = None
) -> list[Skill]:
    """Get all skills, optionally filtered by category."""
    query = select(Skill).options(selectinload(Skill.category))
    if category_id:
        query = query.where(Skill.category_id == category_id)
    query = query.order_by(Skill.name)
    result = await db.execute(query)
    return list(result.scalars().all())


async def add_offered_skill(
    db: AsyncSession, user_id: uuid.UUID, data: UserSkillOfferedCreate
) -> UserSkillOffered:
    """Add a skill to the user's offered skills."""
    # Verify skill exists
    result = await db.execute(select(Skill).where(Skill.id == data.skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise SkillNotFoundError(str(data.skill_id))

    # Check if already offering this skill
    result = await db.execute(
        select(UserSkillOffered).where(
            UserSkillOffered.user_id == user_id,
            UserSkillOffered.skill_id == data.skill_id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        # Update existing
        existing.proficiency_level = data.proficiency_level
        existing.description = data.description
        existing.hourly_rate_credits = data.hourly_rate_credits
        existing.is_active = True
        await db.flush()
        await db.refresh(existing)
        return existing

    offered = UserSkillOffered(
        user_id=user_id,
        skill_id=data.skill_id,
        proficiency_level=data.proficiency_level,
        description=data.description,
        hourly_rate_credits=data.hourly_rate_credits,
    )
    db.add(offered)
    await db.flush()
    await db.refresh(offered)
    return offered


async def add_wanted_skill(
    db: AsyncSession, user_id: uuid.UUID, data: UserSkillWantedCreate
) -> UserSkillWanted:
    """Add a skill to the user's wanted skills."""
    # Verify skill exists
    result = await db.execute(select(Skill).where(Skill.id == data.skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise SkillNotFoundError(str(data.skill_id))

    # Check if already wanting this skill
    result = await db.execute(
        select(UserSkillWanted).where(
            UserSkillWanted.user_id == user_id,
            UserSkillWanted.skill_id == data.skill_id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.desired_level = data.desired_level
        existing.notes = data.notes
        await db.flush()
        await db.refresh(existing)
        return existing

    wanted = UserSkillWanted(
        user_id=user_id,
        skill_id=data.skill_id,
        desired_level=data.desired_level,
        notes=data.notes,
    )
    db.add(wanted)
    await db.flush()
    await db.refresh(wanted)
    return wanted


async def remove_offered_skill(
    db: AsyncSession, user_id: uuid.UUID, offered_id: uuid.UUID
) -> None:
    """Remove a skill from the user's offered skills."""
    result = await db.execute(
        select(UserSkillOffered).where(
            UserSkillOffered.id == offered_id,
            UserSkillOffered.user_id == user_id,
        )
    )
    offered = result.scalar_one_or_none()
    if not offered:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offered skill not found.",
        )
    await db.delete(offered)
    await db.flush()


async def remove_wanted_skill(
    db: AsyncSession, user_id: uuid.UUID, wanted_id: uuid.UUID
) -> None:
    """Remove a skill from the user's wanted skills."""
    result = await db.execute(
        select(UserSkillWanted).where(
            UserSkillWanted.id == wanted_id,
            UserSkillWanted.user_id == user_id,
        )
    )
    wanted = result.scalar_one_or_none()
    if not wanted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wanted skill not found.",
        )
    await db.delete(wanted)
    await db.flush()


async def browse_skills(db: AsyncSession) -> list[SkillBrowseResponse]:
    """Browse all skills with counts of users offering and wanting them."""
    # Subquery for offered count
    offered_count_sq = (
        select(
            UserSkillOffered.skill_id,
            func.count(UserSkillOffered.id).label("offered_count"),
        )
        .where(UserSkillOffered.is_active == True)
        .group_by(UserSkillOffered.skill_id)
        .subquery()
    )

    # Subquery for wanted count
    wanted_count_sq = (
        select(
            UserSkillWanted.skill_id,
            func.count(UserSkillWanted.id).label("wanted_count"),
        )
        .group_by(UserSkillWanted.skill_id)
        .subquery()
    )

    result = await db.execute(
        select(
            Skill,
            func.coalesce(offered_count_sq.c.offered_count, 0).label("offered_count"),
            func.coalesce(wanted_count_sq.c.wanted_count, 0).label("wanted_count"),
        )
        .outerjoin(offered_count_sq, Skill.id == offered_count_sq.c.skill_id)
        .outerjoin(wanted_count_sq, Skill.id == wanted_count_sq.c.skill_id)
        .options(selectinload(Skill.category))
        .order_by(Skill.name)
    )

    rows = result.all()
    browse_list = []
    for row in rows:
        skill = row[0]
        offered = row[1]
        wanted = row[2]
        browse_list.append(
            SkillBrowseResponse(
                skill=SkillResponse.model_validate(skill),
                offered_count=offered,
                wanted_count=wanted,
            )
        )

    return browse_list
