import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.transaction_models import TransactionType


class TransactionResponse(BaseModel):
    id: uuid.UUID
    from_user_id: Optional[uuid.UUID] = None
    to_user_id: uuid.UUID
    session_id: Optional[uuid.UUID] = None
    hours: float
    type: TransactionType
    description: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TimeBalance(BaseModel):
    available: float
    total_earned: float
    total_spent: float
