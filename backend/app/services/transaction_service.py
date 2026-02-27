"""Transaction service for managing time credits."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.models.transaction_models import TimeTransaction, TransactionType
from app.models.user_models import User
from app.schemas.transaction_schemas import TimeBalance, TransactionResponse


async def credit_hours(
    db: AsyncSession,
    user_id: uuid.UUID,
    hours: float,
    tx_type: TransactionType,
    description: str,
    from_user_id: uuid.UUID | None = None,
    session_id: uuid.UUID | None = None,
) -> TimeTransaction:
    """Credit hours to a user's balance."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()

    user.time_balance_hours += hours

    tx = TimeTransaction(
        from_user_id=from_user_id,
        to_user_id=user_id,
        session_id=session_id,
        hours=hours,
        type=tx_type,
        description=description,
    )
    db.add(tx)
    await db.flush()
    await db.refresh(tx)
    return tx


async def debit_hours(
    db: AsyncSession,
    user_id: uuid.UUID,
    hours: float,
    tx_type: TransactionType,
    description: str,
    to_user_id: uuid.UUID | None = None,
    session_id: uuid.UUID | None = None,
) -> TimeTransaction:
    """Debit hours from a user's balance."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()

    user.time_balance_hours -= hours

    tx = TimeTransaction(
        from_user_id=user_id,
        to_user_id=to_user_id or user_id,
        session_id=session_id,
        hours=hours,
        type=tx_type,
        description=description,
    )
    db.add(tx)
    await db.flush()
    await db.refresh(tx)
    return tx


async def get_balance(db: AsyncSession, user_id: uuid.UUID) -> TimeBalance:
    """Get the user's current time balance breakdown."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()

    # Calculate total earned
    earned_result = await db.execute(
        select(func.coalesce(func.sum(TimeTransaction.hours), 0.0)).where(
            TimeTransaction.to_user_id == user_id,
            TimeTransaction.type.in_([TransactionType.EARNED, TransactionType.STARTER, TransactionType.BONUS]),
        )
    )
    total_earned = float(earned_result.scalar())

    # Calculate total spent
    spent_result = await db.execute(
        select(func.coalesce(func.sum(TimeTransaction.hours), 0.0)).where(
            TimeTransaction.from_user_id == user_id,
            TimeTransaction.type == TransactionType.SPENT,
        )
    )
    total_spent = float(spent_result.scalar())

    return TimeBalance(
        available=user.time_balance_hours,
        total_earned=total_earned,
        total_spent=total_spent,
    )


async def get_history(
    db: AsyncSession, user_id: uuid.UUID, limit: int = 50
) -> list[TimeTransaction]:
    """Get the user's transaction history."""
    result = await db.execute(
        select(TimeTransaction)
        .where(
            (TimeTransaction.from_user_id == user_id)
            | (TimeTransaction.to_user_id == user_id)
        )
        .order_by(TimeTransaction.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def create_starter_transaction(
    db: AsyncSession, user_id: uuid.UUID
) -> TimeTransaction:
    """Create the initial starter credits transaction for a new user."""
    return await credit_hours(
        db=db,
        user_id=user_id,
        hours=settings.STARTER_CREDITS_HOURS,
        tx_type=TransactionType.STARTER,
        description=f"Welcome bonus: {settings.STARTER_CREDITS_HOURS} starter credit hours",
    )
