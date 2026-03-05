"""Validation utilities for SkillSwap."""

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.auth.exceptions import InsufficientCreditsError, SessionConflictError


def validate_session_time(scheduled_at: datetime) -> None:
    """
    Validate that a session is scheduled in the future and during reasonable hours.

    Raises:
        HTTPException: If the time is in the past or unreasonable.
    """
    now = datetime.now(timezone.utc)
    if scheduled_at <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session must be scheduled in the future.",
        )

    # Sessions should be at least 30 minutes from now
    min_advance = (scheduled_at - now).total_seconds()
    if min_advance < 1800:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sessions must be booked at least 30 minutes in advance.",
        )


def validate_balance_sufficient(available_hours: float, required_hours: float) -> None:
    """
    Validate that the user has enough time balance for the transaction.

    Raises:
        InsufficientCreditsError: If balance is insufficient.
    """
    if available_hours < required_hours:
        raise InsufficientCreditsError(
            available=available_hours,
            required=required_hours,
        )


def validate_no_self_booking(
    teacher_id: uuid.UUID, learner_id: uuid.UUID
) -> None:
    """
    Validate that a user is not booking a session with themselves.

    Raises:
        HTTPException: If teacher and learner are the same user.
    """
    if teacher_id == learner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot book a session with yourself.",
        )
