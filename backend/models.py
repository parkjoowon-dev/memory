from sqlalchemy import Column, String, Integer, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column
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
