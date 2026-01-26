from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from crud import (
    get_all_hanja, get_hanja_by_id, get_hanja_by_chapter,
    create_hanja, update_hanja, delete_hanja,
    get_study_progress, get_study_progress_by_chapter, get_all_study_progress,
    upsert_study_progress, delete_study_progress
)
from schemas import (
    HanjaListResponse, Hanja, HanjaCreate, HanjaUpdate,
    StudyProgress, StudyProgressCreate, StudyProgressResponse, StudyProgressListResponse
)
from typing import List, Optional
import os

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

# API 엔드포인트 (정적 파일 서빙보다 먼저 정의)
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


@app.post("/api/hanja", response_model=Hanja, status_code=201)
async def create_hanja_endpoint(hanja: HanjaCreate, db: Session = Depends(get_db)):
    """새 한자 데이터를 생성합니다."""
    hanja_data = {
        "character": hanja.character,
        "sound": hanja.sound,
        "meaning": hanja.meaning,
        "strokeOrder": hanja.strokeOrder,
        "examples": hanja.examples,
        "chapter": hanja.chapter,
        "difficulty": hanja.difficulty,
    }
    created = create_hanja(db, hanja_data)
    return created


@app.put("/api/hanja/{hanja_id}", response_model=Hanja)
async def update_hanja_endpoint(
    hanja_id: str, 
    hanja: HanjaUpdate, 
    db: Session = Depends(get_db)
):
    """한자 데이터를 수정합니다."""
    hanja_data = {}
    if hanja.character is not None:
        hanja_data["character"] = hanja.character
    if hanja.sound is not None:
        hanja_data["sound"] = hanja.sound
    if hanja.meaning is not None:
        hanja_data["meaning"] = hanja.meaning
    if hanja.strokeOrder is not None:
        hanja_data["strokeOrder"] = hanja.strokeOrder
    if hanja.examples is not None:
        hanja_data["examples"] = hanja.examples
    if hanja.chapter is not None:
        hanja_data["chapter"] = hanja.chapter
    if hanja.difficulty is not None:
        hanja_data["difficulty"] = hanja.difficulty
    
    updated = update_hanja(db, hanja_id, hanja_data)
    if not updated:
        raise HTTPException(status_code=404, detail="한자를 찾을 수 없습니다.")
    return updated


@app.delete("/api/hanja/{hanja_id}", status_code=204)
async def delete_hanja_endpoint(hanja_id: str, db: Session = Depends(get_db)):
    """한자 데이터를 삭제합니다."""
    success = delete_hanja(db, hanja_id)
    if not success:
        raise HTTPException(status_code=404, detail="한자를 찾을 수 없습니다.")
    return None


# 학습 진행 상태 API 엔드포인트
@app.get("/api/study-progress/{user_id}", response_model=StudyProgressListResponse)
async def get_all_study_progress_endpoint(user_id: str, db: Session = Depends(get_db)):
    """특정 사용자의 모든 학습 진행 상태를 반환합니다."""
    progress_list = get_all_study_progress(db, user_id)
    return {"progress": progress_list}


@app.get("/api/study-progress/{user_id}/chapter/{chapter}", response_model=StudyProgressListResponse)
async def get_study_progress_by_chapter_endpoint(
    user_id: str, 
    chapter: int, 
    db: Session = Depends(get_db)
):
    """특정 사용자의 특정 단원 학습 진행 상태를 반환합니다."""
    progress_list = get_study_progress_by_chapter(db, user_id, chapter)
    return {"progress": progress_list}


@app.get("/api/study-progress/{user_id}/hanja/{hanja_id}", response_model=StudyProgressResponse)
async def get_study_progress_endpoint(
    user_id: str, 
    hanja_id: str, 
    db: Session = Depends(get_db)
):
    """특정 사용자의 특정 한자 학습 진행 상태를 반환합니다."""
    progress = get_study_progress(db, user_id, hanja_id)
    if not progress:
        raise HTTPException(status_code=404, detail="학습 진행 상태를 찾을 수 없습니다.")
    return progress


@app.post("/api/study-progress", response_model=StudyProgressResponse, status_code=201)
async def create_study_progress_endpoint(
    progress: StudyProgressCreate, 
    db: Session = Depends(get_db)
):
    """학습 진행 상태를 저장하거나 업데이트합니다."""
    progress_data = {
        "user_id": progress.user_id,
        "hanja_id": progress.hanja_id,
        "chapter": progress.chapter,
        "is_known": progress.is_known
    }
    created = upsert_study_progress(db, progress_data)
    return created


@app.put("/api/study-progress/{user_id}/hanja/{hanja_id}", response_model=StudyProgressResponse)
async def update_study_progress_endpoint(
    user_id: str,
    hanja_id: str,
    progress: StudyProgressCreate,
    db: Session = Depends(get_db)
):
    """학습 진행 상태를 업데이트합니다."""
    if progress.user_id != user_id or progress.hanja_id != hanja_id:
        raise HTTPException(status_code=400, detail="URL과 요청 본문의 user_id 또는 hanja_id가 일치하지 않습니다.")
    
    progress_data = {
        "user_id": progress.user_id,
        "hanja_id": progress.hanja_id,
        "chapter": progress.chapter,
        "is_known": progress.is_known
    }
    updated = upsert_study_progress(db, progress_data)
    return updated


@app.delete("/api/study-progress/{user_id}/hanja/{hanja_id}", status_code=204)
async def delete_study_progress_endpoint(
    user_id: str, 
    hanja_id: str, 
    db: Session = Depends(get_db)
):
    """학습 진행 상태를 삭제합니다."""
    success = delete_study_progress(db, user_id, hanja_id)
    if not success:
        raise HTTPException(status_code=404, detail="학습 진행 상태를 찾을 수 없습니다.")
    return None

# 정적 파일 서빙 설정 (Docker 빌드 시 static 폴더에 프론트엔드 빌드 결과가 있음)
static_dir = "static"
if os.path.exists(static_dir):
    # 정적 파일 (JS, CSS, 이미지 등) 서빙
    app.mount("/assets", StaticFiles(directory=f"{static_dir}/assets"), name="assets")
    
    # SPA 라우팅을 위한 fallback: 모든 경로를 index.html로 리다이렉트
    # API 경로는 위에서 이미 처리되므로 여기서는 제외됨
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str, request: Request):
        # 정적 파일 요청은 제외 (이미 /assets로 마운트됨)
        if full_path.startswith("assets/"):
            return None
        
        # index.html 반환 (React Router가 라우팅 처리)
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        return {"error": "Frontend not found"}
else:
    # 개발 환경: 정적 파일이 없으면 API만 제공
    @app.get("/")
    async def root():
        return {"message": "한자 5급 API 서버입니다. (프론트엔드가 빌드되지 않았습니다.)"}
