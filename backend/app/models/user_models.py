from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    time_balance_hours: Mapped[float] = mapped_column(Float, default=3.0, server_default="3.0")
    total_hours_taught: Mapped[float] = mapped_column(Float, default=0.0, server_default="0.0")
    total_hours_learned: Mapped[float] = mapped_column(Float, default=0.0, server_default="0.0")
    rating_avg: Mapped[float] = mapped_column(Float, default=0.0, server_default="0.0")
    rating_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    # Relationships
    skills_offered = relationship(
        "UserSkillOffered", back_populates="user", lazy="selectin"
    )
    skills_wanted = relationship(
        "UserSkillWanted", back_populates="user", lazy="selectin"
    )
    sessions_as_teacher = relationship(
        "Session",
        foreign_keys="Session.teacher_id",
        back_populates="teacher",
        lazy="selectin",
    )
    sessions_as_learner = relationship(
        "Session",
        foreign_keys="Session.learner_id",
        back_populates="learner",
        lazy="selectin",
    )
    transactions_sent = relationship(
        "TimeTransaction",
        foreign_keys="TimeTransaction.from_user_id",
        back_populates="from_user",
        lazy="selectin",
    )
    transactions_received = relationship(
        "TimeTransaction",
        foreign_keys="TimeTransaction.to_user_id",
        back_populates="to_user",
        lazy="selectin",
    )
