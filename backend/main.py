from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from crud import get_all_hanja, get_hanja_by_id, get_hanja_by_chapter
from schemas import HanjaListResponse, Hanja
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
