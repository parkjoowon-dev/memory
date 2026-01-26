from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, func
from models import HanjaModel, StudyProgressModel, PracticeProgressModel
from schemas import Hanja, Example, StudyProgress, StudyProgressResponse, PracticeProgressResponse
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
    # ID가 없으면 자동 생성 (기존 최대 ID + 1)
    if "id" not in hanja_data or not hanja_data.get("id"):
        stmt = select(HanjaModel.id)
        existing_ids = db.execute(stmt).scalars().all()
        if existing_ids:
            # 숫자 ID만 추출하여 최대값 찾기
            numeric_ids = [int(id) for id in existing_ids if str(id).isdigit()]
            new_id = str(max(numeric_ids) + 1) if numeric_ids else "1"
        else:
            new_id = "1"
        hanja_data["id"] = new_id
    
    # examples를 dict 리스트로 변환
    examples_data = hanja_data.get("examples", [])
    if examples_data:
        # Example 객체인 경우 dict로 변환
        if isinstance(examples_data[0], Example):
            examples_dict = [{"sentence": ex.sentence, "meaning": ex.meaning} for ex in examples_data]
        else:
            # 이미 dict인 경우
            examples_dict = examples_data
    else:
        examples_dict = []
    
    hanja_model = HanjaModel(
        id=hanja_data["id"],
        character=hanja_data["character"],
        sound=hanja_data["sound"],
        meaning=hanja_data["meaning"],
        stroke_order=hanja_data.get("strokeOrder", []),
        examples=examples_dict,
        chapter=hanja_data["chapter"],
        difficulty=hanja_data.get("difficulty", 2)
    )
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
    
    # 업데이트할 필드만 적용
    if "character" in hanja_data:
        hanja_model.character = hanja_data["character"]
    if "sound" in hanja_data:
        hanja_model.sound = hanja_data["sound"]
    if "meaning" in hanja_data:
        hanja_model.meaning = hanja_data["meaning"]
    if "strokeOrder" in hanja_data:
        hanja_model.stroke_order = hanja_data["strokeOrder"]
    if "examples" in hanja_data:
        # Example 객체인 경우 dict로 변환
        examples = hanja_data["examples"]
        if examples and isinstance(examples[0], Example):
            hanja_model.examples = [{"sentence": ex.sentence, "meaning": ex.meaning} for ex in examples]
        else:
            hanja_model.examples = examples
    if "chapter" in hanja_data:
        hanja_model.chapter = hanja_data["chapter"]
    if "difficulty" in hanja_data:
        hanja_model.difficulty = hanja_data["difficulty"]
    
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


# 학습 진행 상태 CRUD 함수들
def get_study_progress(db: Session, user_id: str, hanja_id: str) -> Optional[StudyProgressResponse]:
    """특정 사용자의 특정 한자 학습 상태를 가져옵니다."""
    stmt = select(StudyProgressModel).where(
        StudyProgressModel.user_id == user_id,
        StudyProgressModel.hanja_id == hanja_id
    )
    progress_model = db.execute(stmt).scalar_one_or_none()
    
    if not progress_model:
        return None
    
    return StudyProgressResponse(
        user_id=progress_model.user_id,
        hanja_id=progress_model.hanja_id,
        chapter=progress_model.chapter,
        is_known=progress_model.is_known
    )


def get_study_progress_by_chapter(db: Session, user_id: str, chapter: int) -> List[StudyProgressResponse]:
    """특정 사용자의 특정 단원 학습 상태를 가져옵니다."""
    stmt = select(StudyProgressModel).where(
        StudyProgressModel.user_id == user_id,
        StudyProgressModel.chapter == chapter
    )
    progress_list = db.execute(stmt).scalars().all()
    
    return [
        StudyProgressResponse(
            user_id=p.user_id,
            hanja_id=p.hanja_id,
            chapter=p.chapter,
            is_known=p.is_known
        )
        for p in progress_list
    ]


def get_all_study_progress(db: Session, user_id: str) -> List[StudyProgressResponse]:
    """특정 사용자의 모든 학습 상태를 가져옵니다."""
    stmt = select(StudyProgressModel).where(StudyProgressModel.user_id == user_id)
    progress_list = db.execute(stmt).scalars().all()
    
    return [
        StudyProgressResponse(
            user_id=p.user_id,
            hanja_id=p.hanja_id,
            chapter=p.chapter,
            is_known=p.is_known
        )
        for p in progress_list
    ]


def upsert_study_progress(db: Session, progress_data: dict) -> StudyProgressResponse:
    """학습 진행 상태를 저장하거나 업데이트합니다 (upsert)."""
    stmt = select(StudyProgressModel).where(
        StudyProgressModel.user_id == progress_data["user_id"],
        StudyProgressModel.hanja_id == progress_data["hanja_id"]
    )
    progress_model = db.execute(stmt).scalar_one_or_none()
    
    if progress_model:
        # 기존 레코드 업데이트
        progress_model.is_known = progress_data["is_known"]
        progress_model.chapter = progress_data["chapter"]
    else:
        # 새 레코드 생성
        progress_model = StudyProgressModel(
            user_id=progress_data["user_id"],
            hanja_id=progress_data["hanja_id"],
            chapter=progress_data["chapter"],
            is_known=progress_data["is_known"]
        )
        db.add(progress_model)
    
    db.commit()
    db.refresh(progress_model)
    
    return StudyProgressResponse(
        user_id=progress_model.user_id,
        hanja_id=progress_model.hanja_id,
        chapter=progress_model.chapter,
        is_known=progress_model.is_known
    )


def delete_study_progress(db: Session, user_id: str, hanja_id: str) -> bool:
    """학습 진행 상태를 삭제합니다."""
    stmt = select(StudyProgressModel).where(
        StudyProgressModel.user_id == user_id,
        StudyProgressModel.hanja_id == hanja_id
    )
    progress_model = db.execute(stmt).scalar_one_or_none()
    
    if not progress_model:
        return False
    
    db.delete(progress_model)
    db.commit()
    return True


# 연습 진행 상태 CRUD 함수들
def get_practice_progress(db: Session, user_id: str, hanja_id: str) -> Optional[PracticeProgressResponse]:
    """특정 사용자의 특정 한자 연습 상태를 가져옵니다."""
    stmt = select(PracticeProgressModel).where(
        PracticeProgressModel.user_id == user_id,
        PracticeProgressModel.hanja_id == hanja_id
    )
    progress_model = db.execute(stmt).scalar_one_or_none()
    
    if not progress_model:
        return None
    
    return PracticeProgressResponse(
        user_id=progress_model.user_id,
        hanja_id=progress_model.hanja_id,
        chapter=progress_model.chapter,
        is_known=progress_model.is_known
    )


def get_practice_progress_by_chapter(db: Session, user_id: str, chapter: int) -> List[PracticeProgressResponse]:
    """특정 사용자의 특정 단원 연습 상태를 가져옵니다."""
    stmt = select(PracticeProgressModel).where(
        PracticeProgressModel.user_id == user_id,
        PracticeProgressModel.chapter == chapter
    )
    progress_list = db.execute(stmt).scalars().all()
    
    return [
        PracticeProgressResponse(
            user_id=p.user_id,
            hanja_id=p.hanja_id,
            chapter=p.chapter,
            is_known=p.is_known
        )
        for p in progress_list
    ]


def get_all_practice_progress(db: Session, user_id: str) -> List[PracticeProgressResponse]:
    """특정 사용자의 모든 연습 상태를 가져옵니다."""
    stmt = select(PracticeProgressModel).where(PracticeProgressModel.user_id == user_id)
    progress_list = db.execute(stmt).scalars().all()
    
    return [
        PracticeProgressResponse(
            user_id=p.user_id,
            hanja_id=p.hanja_id,
            chapter=p.chapter,
            is_known=p.is_known
        )
        for p in progress_list
    ]


def upsert_practice_progress(db: Session, progress_data: dict) -> PracticeProgressResponse:
    """연습 진행 상태를 저장하거나 업데이트합니다 (upsert)."""
    stmt = select(PracticeProgressModel).where(
        PracticeProgressModel.user_id == progress_data["user_id"],
        PracticeProgressModel.hanja_id == progress_data["hanja_id"]
    )
    progress_model = db.execute(stmt).scalar_one_or_none()
    
    if progress_model:
        # 기존 레코드 업데이트
        progress_model.is_known = progress_data["is_known"]
        progress_model.chapter = progress_data["chapter"]
    else:
        # 새 레코드 생성
        progress_model = PracticeProgressModel(
            user_id=progress_data["user_id"],
            hanja_id=progress_data["hanja_id"],
            chapter=progress_data["chapter"],
            is_known=progress_data["is_known"]
        )
        db.add(progress_model)
    
    db.commit()
    db.refresh(progress_model)
    
    return PracticeProgressResponse(
        user_id=progress_model.user_id,
        hanja_id=progress_model.hanja_id,
        chapter=progress_model.chapter,
        is_known=progress_model.is_known
    )


def delete_practice_progress(db: Session, user_id: str, hanja_id: str) -> bool:
    """연습 진행 상태를 삭제합니다."""
    stmt = select(PracticeProgressModel).where(
        PracticeProgressModel.user_id == user_id,
        PracticeProgressModel.hanja_id == hanja_id
    )
    progress_model = db.execute(stmt).scalar_one_or_none()
    
    if not progress_model:
        return False
    
    db.delete(progress_model)
    db.commit()
    return True
