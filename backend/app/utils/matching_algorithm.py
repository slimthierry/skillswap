"""
Matching algorithm for SkillSwap.

Finds users who offer skills that the current user wants, AND want skills the
current user offers. Produces a weighted compatibility score.

Score formula:
    score = (mutual_match_count * 40) + (rating_avg * 10) + (proficiency_bonus * 10)

Where:
    - mutual_match_count: number of bidirectional skill overlaps
    - rating_avg: the other user's average rating (0-5)
    - proficiency_bonus: average proficiency level of skills offered that match
      (beginner=1, intermediate=2, advanced=3, expert=4), normalized to 0-1 range
"""

from app.models.skill_models import ProficiencyLevel

PROFICIENCY_WEIGHTS: dict[ProficiencyLevel, float] = {
    ProficiencyLevel.BEGINNER: 1.0,
    ProficiencyLevel.INTERMEDIATE: 2.0,
    ProficiencyLevel.ADVANCED: 3.0,
    ProficiencyLevel.EXPERT: 4.0,
}


def compute_proficiency_bonus(proficiency_levels: list[ProficiencyLevel]) -> float:
    """
    Compute a normalized proficiency bonus from a list of proficiency levels.
    Returns a value between 0.0 and 1.0.
    """
    if not proficiency_levels:
        return 0.0
    total = sum(PROFICIENCY_WEIGHTS.get(level, 2.0) for level in proficiency_levels)
    avg = total / len(proficiency_levels)
    # Normalize: max is 4.0 (expert), so divide by 4
    return min(avg / 4.0, 1.0)


def compute_compatibility_score(
    mutual_match_count: int,
    rating_avg: float,
    proficiency_levels: list[ProficiencyLevel],
) -> float:
    """
    Compute the overall compatibility score for a potential match.

    Args:
        mutual_match_count: Number of bidirectional skill overlaps.
        rating_avg: The matched user's average rating (0-5).
        proficiency_levels: List of proficiency levels of matched offered skills.

    Returns:
        A float compatibility score. Higher is better.
    """
    proficiency_bonus = compute_proficiency_bonus(proficiency_levels)

    score = (
        (mutual_match_count * 40.0)
        + (rating_avg * 10.0)
        + (proficiency_bonus * 10.0)
    )

    return round(score, 2)


def find_skill_overlaps(
    user_offered_skill_ids: set[str],
    user_wanted_skill_ids: set[str],
    other_offered_skill_ids: set[str],
    other_wanted_skill_ids: set[str],
) -> tuple[set[str], set[str]]:
    """
    Find bidirectional skill overlaps between two users.

    Returns:
        Tuple of (they_offer_you_want, you_offer_they_want) skill ID sets.
    """
    # Skills the other user offers that the current user wants
    they_offer_you_want = other_offered_skill_ids & user_wanted_skill_ids

    # Skills the current user offers that the other user wants
    you_offer_they_want = user_offered_skill_ids & other_wanted_skill_ids

    return they_offer_you_want, you_offer_they_want


def is_mutual_match(
    they_offer_you_want: set[str],
    you_offer_they_want: set[str],
) -> bool:
    """
    Determine if two users have a mutual match (both directions have at least
    one skill overlap).
    """
    return len(they_offer_you_want) > 0 and len(you_offer_they_want) > 0
