from sqlalchemy import Column, String, Integer, JSON, Index, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from database import Base
from config import settings
from typing import List, Dict


class HanjaModel(Base):
    """한자 데이터 모델 (ORM)"""
    __tablename__ = "hanja"
    __table_args__ = (
        Index("idx_chapter", "chapter"),
        Index("idx_difficulty", "difficulty"),
        {"schema": settings.database_schema},
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    character: Mapped[str] = mapped_column(String, nullable=False)
    sound: Mapped[str] = mapped_column(String, nullable=False)
    meaning: Mapped[str] = mapped_column(String, nullable=False)
    stroke_order: Mapped[List[str]] = mapped_column(JSON, default=list)
    examples: Mapped[List[Dict[str, str]]] = mapped_column(JSON, default=list)
    chapter: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    difficulty: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    def __repr__(self) -> str:
        return f"<HanjaModel(id={self.id}, character={self.character}, meaning={self.meaning})>"


class StudyProgressModel(Base):
    """학습 진행 상태 모델 (ORM)"""
    __tablename__ = "study_progress"
    __table_args__ = (
        Index("idx_user_hanja", "user_id", "hanja_id"),
        Index("idx_user_chapter", "user_id", "chapter"),
        {"schema": settings.database_schema},
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True, default="default")
    hanja_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    chapter: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    is_known: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<StudyProgressModel(user_id={self.user_id}, hanja_id={self.hanja_id}, is_known={self.is_known})>"
