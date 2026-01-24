from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from crud import get_all_hanja, get_hanja_by_id, get_hanja_by_chapter
from schemas import HanjaListResponse, Hanja
from typing import List, Optional

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="한자 5급 API",
    description="한자능력검정시험 5급 데이터를 제공하는 API",
    version="1.0.0"
)

# CORS 설정 (프론트엔드에서 접근 가능하도록)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한하세요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "한자 5급 API 서버입니다."}


@app.get("/api/hanja", response_model=HanjaListResponse)
async def get_hanja_list(db: Session = Depends(get_db)):
    """
    모든 한자 데이터를 반환합니다.
    sampleHanja.ts의 JSON 구조와 동일한 형식으로 반환됩니다.
    """
    hanja_list = get_all_hanja(db)
    return {"hanja": hanja_list}


@app.get("/api/hanja/{hanja_id}", response_model=Hanja)
async def get_hanja(hanja_id: str, db: Session = Depends(get_db)):
    """특정 ID의 한자 데이터를 반환합니다."""
    hanja = get_hanja_by_id(db, hanja_id)
    if not hanja:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="한자를 찾을 수 없습니다.")
    return hanja


@app.get("/api/hanja/chapter/{chapter}", response_model=HanjaListResponse)
async def get_hanja_by_chapter_endpoint(chapter: int, db: Session = Depends(get_db)):
    """특정 단원의 한자 데이터를 반환합니다."""
    hanja_list = get_hanja_by_chapter(db, chapter)
    return {"hanja": hanja_list}
