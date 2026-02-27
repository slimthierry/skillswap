import enum

from sqlalchemy import Enum, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TransactionType(str, enum.Enum):
    EARNED = "earned"
    SPENT = "spent"
    BONUS = "bonus"
    STARTER = "starter"


class TimeTransaction(Base):
    __tablename__ = "time_transactions"

    from_user_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    to_user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    session_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=True
    )
    hours: Mapped[float] = mapped_column(Float, nullable=False)
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    from_user = relationship(
        "User", foreign_keys=[from_user_id], back_populates="transactions_sent", lazy="selectin"
    )
    to_user = relationship(
        "User", foreign_keys=[to_user_id], back_populates="transactions_received", lazy="selectin"
    )
    session = relationship("Session", back_populates="transaction", lazy="selectin")
