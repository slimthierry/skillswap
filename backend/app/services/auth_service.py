"""Authentication service for user registration and login."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.auth.security import create_access_token, hash_password, verify_password
from app.models.user_models import User
from app.models.transaction_models import TimeTransaction, TransactionType
from app.schemas.auth_schemas import LoginRequest, RegisterRequest, TokenResponse


async def register(db: AsyncSession, data: RegisterRequest) -> tuple[User, TokenResponse]:
    """
    Register a new user and give them starter credits.

    Returns:
        Tuple of (User, TokenResponse).
    """
    # Check for existing email
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    # Check for existing username
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists.",
        )

    # Create user
    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        bio=data.bio,
        time_balance_hours=settings.STARTER_CREDITS_HOURS,
    )
    db.add(user)
    await db.flush()

    # Create starter credits transaction
    starter_tx = TimeTransaction(
        from_user_id=None,
        to_user_id=user.id,
        session_id=None,
        hours=settings.STARTER_CREDITS_HOURS,
        type=TransactionType.STARTER,
        description=f"Welcome bonus: {settings.STARTER_CREDITS_HOURS} starter credit hours",
    )
    db.add(starter_tx)
    await db.flush()

    # Generate token
    token = create_access_token(data={"sub": str(user.id)})
    token_response = TokenResponse(access_token=token)

    return user, token_response


async def login(db: AsyncSession, data: LoginRequest) -> tuple[User, TokenResponse]:
    """
    Authenticate a user and return a JWT token.

    Returns:
        Tuple of (User, TokenResponse).
    """
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    token = create_access_token(data={"sub": str(user.id)})
    token_response = TokenResponse(access_token=token)

    return user, token_response
