from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from models import HanjaModel
from schemas import Hanja, Example
from typing import List, Optional


def _model_to_schema(hanja_model: HanjaModel) -> Hanja:
    """ORM 모델을 Pydantic 스키마로 변환하는 헬퍼 함수"""
    examples = [
        Example(sentence=ex["sentence"], meaning=ex["meaning"])
        for ex in (hanja_model.examples or [])
    ]
    
    return Hanja(
        id=hanja_model.id,
        character=hanja_model.character,
        sound=hanja_model.sound,
        meaning=hanja_model.meaning,
        strokeOrder=hanja_model.stroke_order or [],
        examples=examples,
        chapter=hanja_model.chapter,
        difficulty=hanja_model.difficulty
    )


def get_all_hanja(db: Session) -> List[Hanja]:
    """모든 한자 데이터를 가져옵니다 (ORM 사용)."""
    # SQLAlchemy 2.0 스타일 쿼리
    stmt = select(HanjaModel).order_by(HanjaModel.chapter, HanjaModel.id)
    hanja_list = db.execute(stmt).scalars().all()
    
    return [_model_to_schema(h) for h in hanja_list]


def get_hanja_by_id(db: Session, hanja_id: str) -> Optional[Hanja]:
    """ID로 한자 데이터를 가져옵니다 (ORM 사용)."""
    stmt = select(HanjaModel).where(HanjaModel.id == hanja_id)
    hanja_model = db.execute(stmt).scalar_one_or_none()
    
    if not hanja_model:
        return None
    
    return _model_to_schema(hanja_model)


def get_hanja_by_chapter(db: Session, chapter: int) -> List[Hanja]:
    """단원별로 한자 데이터를 가져옵니다 (ORM 사용)."""
    stmt = select(HanjaModel).where(HanjaModel.chapter == chapter).order_by(HanjaModel.id)
    hanja_list = db.execute(stmt).scalars().all()
    
    return [_model_to_schema(h) for h in hanja_list]


def create_hanja(db: Session, hanja_data: dict) -> Hanja:
    """새 한자 데이터를 생성합니다 (ORM 사용)."""
    hanja_model = HanjaModel(**hanja_data)
    db.add(hanja_model)
    db.commit()
    db.refresh(hanja_model)
    return _model_to_schema(hanja_model)


def update_hanja(db: Session, hanja_id: str, hanja_data: dict) -> Optional[Hanja]:
    """한자 데이터를 업데이트합니다 (ORM 사용)."""
    stmt = select(HanjaModel).where(HanjaModel.id == hanja_id)
    hanja_model = db.execute(stmt).scalar_one_or_none()
    
    if not hanja_model:
        return None
    
    for key, value in hanja_data.items():
        setattr(hanja_model, key, value)
    
    db.commit()
    db.refresh(hanja_model)
    return _model_to_schema(hanja_model)


def delete_hanja(db: Session, hanja_id: str) -> bool:
    """한자 데이터를 삭제합니다 (ORM 사용)."""
    stmt = select(HanjaModel).where(HanjaModel.id == hanja_id)
    hanja_model = db.execute(stmt).scalar_one_or_none()
    
    if not hanja_model:
        return False
    
    db.delete(hanja_model)
    db.commit()
    return True
