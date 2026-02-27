"""Transaction API routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import get_current_user
from app.models.user_models import User
from app.schemas.transaction_schemas import TimeBalance, TransactionResponse
from app.services import transaction_service

router = APIRouter()


@router.get("/balance", response_model=TimeBalance)
async def get_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's time credit balance."""
    return await transaction_service.get_balance(db, current_user.id)


@router.get("/history", response_model=list[TransactionResponse])
async def get_history(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's transaction history."""
    return await transaction_service.get_history(db, current_user.id, limit)
