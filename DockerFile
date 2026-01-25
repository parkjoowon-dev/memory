# --- 1단계: 리액트 빌드 스테이지 ---
    FROM node:18 AS build-stage
    WORKDIR /frontend
    COPY frontend/package*.json ./
    RUN npm install
    COPY frontend/ ./
    RUN npm run build
    
    # --- 2단계: 파이썬 실행 스테이지 ---
    FROM python:3.11-slim
    WORKDIR /app
    
    # 파이썬 의존성 설치 (psycopg2-binary 포함)
    COPY backend/requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    
    # 백엔드 코드 복사
    COPY backend/ .
    
    # 1단계에서 빌드된 리액트 파일(dist/build)을 파이썬 폴더 내 static으로 복사
    COPY --from=build-stage /frontend/dist ./static
    
    # 실행 (FastAPI 예시: 8080 포트 사용)
    CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]