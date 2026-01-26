from pydantic import BaseModel
from typing import List, Optional


class Example(BaseModel):
    sentence: str
    meaning: str


class Hanja(BaseModel):
    id: str
    character: str
    sound: str
    meaning: str
    strokeOrder: List[str]
    examples: List[Example]
    chapter: int
    difficulty: int

    class Config:
        json_schema_extra = {
            "example": {
                "id": "1",
                "character": "一",
                "sound": "일",
                "meaning": "하나",
                "strokeOrder": [],
                "examples": [
                    {"sentence": "一石二鳥", "meaning": "한 가지 일로 두 가지 이득을 얻음"},
                    {"sentence": "一見", "meaning": "한 번 봄"}
                ],
                "chapter": 1,
                "difficulty": 1
            }
        }


class HanjaListResponse(BaseModel):
    hanja: List[Hanja]


class HanjaCreate(BaseModel):
    """한자 생성용 스키마 (ID 제외)"""
    character: str
    sound: str
    meaning: str
    strokeOrder: List[str] = []
    examples: List[Example] = []
    chapter: int
    difficulty: int = 2


class HanjaUpdate(BaseModel):
    """한자 수정용 스키마 (모든 필드 선택적)"""
    character: Optional[str] = None
    sound: Optional[str] = None
    meaning: Optional[str] = None
    strokeOrder: Optional[List[str]] = None
    examples: Optional[List[Example]] = None
    chapter: Optional[int] = None
    difficulty: Optional[int] = None


class StudyProgress(BaseModel):
    """학습 진행 상태 스키마"""
    user_id: str = "default"
    hanja_id: str
    chapter: int
    is_known: bool


class StudyProgressCreate(BaseModel):
    """학습 진행 상태 생성용 스키마"""
    user_id: str = "default"
    hanja_id: str
    chapter: int
    is_known: bool


class StudyProgressResponse(BaseModel):
    """학습 진행 상태 응답 스키마"""
    user_id: str
    hanja_id: str
    chapter: int
    is_known: bool


class StudyProgressListResponse(BaseModel):
    """학습 진행 상태 리스트 응답 스키마"""
    progress: List[StudyProgressResponse]
