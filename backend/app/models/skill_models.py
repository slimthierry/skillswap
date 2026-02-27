import enum

from sqlalchemy import Boolean, Enum, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ProficiencyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class SkillCategory(Base):
    __tablename__ = "skill_categories"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    icon: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    skills = relationship("Skill", back_populates="category", lazy="selectin")


class Skill(Base):
    __tablename__ = "skills"

    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    category_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skill_categories.id"), nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    category = relationship("SkillCategory", back_populates="skills", lazy="selectin")
    offered_by = relationship("UserSkillOffered", back_populates="skill", lazy="selectin")
    wanted_by = relationship("UserSkillWanted", back_populates="skill", lazy="selectin")


class UserSkillOffered(Base):
    __tablename__ = "user_skills_offered"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False
    )
    proficiency_level: Mapped[ProficiencyLevel] = mapped_column(
        Enum(ProficiencyLevel), default=ProficiencyLevel.INTERMEDIATE, nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    hourly_rate_credits: Mapped[float] = mapped_column(
        Float, default=1.0, server_default="1.0"
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    user = relationship("User", back_populates="skills_offered", lazy="selectin")
    skill = relationship("Skill", back_populates="offered_by", lazy="selectin")


class UserSkillWanted(Base):
    __tablename__ = "user_skills_wanted"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False
    )
    desired_level: Mapped[ProficiencyLevel] = mapped_column(
        Enum(ProficiencyLevel), default=ProficiencyLevel.INTERMEDIATE, nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="skills_wanted", lazy="selectin")
    skill = relationship("Skill", back_populates="wanted_by", lazy="selectin")
