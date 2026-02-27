"""Matching service for finding compatible skill exchange partners."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user_models import User
from app.models.skill_models import UserSkillOffered, UserSkillWanted
from app.schemas.matching_schemas import MatchedUser, SkillMatch
from app.schemas.skill_schemas import UserSkillOfferedResponse, UserSkillWantedResponse
from app.utils.matching_algorithm import (
    compute_compatibility_score,
    find_skill_overlaps,
    is_mutual_match,
)


async def find_matches(db: AsyncSession, user_id: uuid.UUID) -> list[SkillMatch]:
    """
    Find users who offer skills the current user wants AND want skills
    the current user offers. Score and sort by compatibility.

    Score = (mutual_match_count * 40) + (rating_avg * 10) + (proficiency_bonus * 10)
    """
    # Get current user's offered and wanted skills
    result = await db.execute(
        select(UserSkillOffered)
        .options(selectinload(UserSkillOffered.skill))
        .where(
            UserSkillOffered.user_id == user_id,
            UserSkillOffered.is_active == True,
        )
    )
    user_offered = result.scalars().all()
    user_offered_skill_ids = {str(o.skill_id) for o in user_offered}

    result = await db.execute(
        select(UserSkillWanted)
        .options(selectinload(UserSkillWanted.skill))
        .where(UserSkillWanted.user_id == user_id)
    )
    user_wanted = result.scalars().all()
    user_wanted_skill_ids = {str(w.skill_id) for w in user_wanted}

    if not user_offered_skill_ids or not user_wanted_skill_ids:
        return []

    # Get all other active users
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.skills_offered).selectinload(UserSkillOffered.skill),
            selectinload(User.skills_wanted).selectinload(UserSkillWanted.skill),
        )
        .where(User.id != user_id, User.is_active == True)
    )
    other_users = result.scalars().all()

    matches: list[SkillMatch] = []

    for other_user in other_users:
        other_offered_skill_ids = {
            str(o.skill_id) for o in other_user.skills_offered if o.is_active
        }
        other_wanted_skill_ids = {
            str(w.skill_id) for w in other_user.skills_wanted
        }

        they_offer_you_want, you_offer_they_want = find_skill_overlaps(
            user_offered_skill_ids,
            user_wanted_skill_ids,
            other_offered_skill_ids,
            other_wanted_skill_ids,
        )

        if not they_offer_you_want and not you_offer_they_want:
            continue

        # Gather the actual offered skill objects that match
        matched_offered = [
            o for o in other_user.skills_offered
            if str(o.skill_id) in they_offer_you_want and o.is_active
        ]
        matched_wanted = [
            w for w in other_user.skills_wanted
            if str(w.skill_id) in you_offer_they_want
        ]

        # Count mutual matches (bidirectional)
        mutual_count = min(len(they_offer_you_want), len(you_offer_they_want))
        total_overlap = len(they_offer_you_want) + len(you_offer_they_want)

        # Proficiency levels of what they offer
        proficiency_levels = [o.proficiency_level for o in matched_offered]

        score = compute_compatibility_score(
            mutual_match_count=mutual_count if mutual_count > 0 else total_overlap,
            rating_avg=other_user.rating_avg,
            proficiency_levels=proficiency_levels,
        )

        match = SkillMatch(
            user=MatchedUser(
                id=other_user.id,
                username=other_user.username,
                bio=other_user.bio,
                avatar_url=other_user.avatar_url,
                rating_avg=other_user.rating_avg,
                rating_count=other_user.rating_count,
            ),
            skills_they_offer_you_want=[
                UserSkillOfferedResponse.model_validate(o) for o in matched_offered
            ],
            skills_you_offer_they_want=[
                UserSkillWantedResponse.model_validate(w) for w in matched_wanted
            ],
            compatibility_score=score,
            rating=other_user.rating_avg,
        )
        matches.append(match)

    # Sort by compatibility score descending
    matches.sort(key=lambda m: m.compatibility_score, reverse=True)
    return matches


async def find_mutual_matches(
    db: AsyncSession, user_id: uuid.UUID
) -> list[SkillMatch]:
    """
    Find only mutual matches where both users can teach each other something.
    A strict subset of find_matches.
    """
    all_matches = await find_matches(db, user_id)
    return [
        m for m in all_matches
        if len(m.skills_they_offer_you_want) > 0
        and len(m.skills_you_offer_they_want) > 0
    ]
