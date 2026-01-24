# 한자 5급 API 서버

FastAPI와 PostgreSQL을 사용한 한자 데이터 API 서버입니다.

## 설치 및 설정

### 1. 가상 환경 생성 및 활성화

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. 의존성 설치

**Windows 사용자:**
```bash
# 먼저 pip 업그레이드
pip install --upgrade pip setuptools wheel

# psycopg2-binary 설치 (버전 고정 없이 최신 버전)
pip install psycopg2-binary

# 나머지 패키지 설치
pip install -r requirements.txt
```

**Linux/Mac 사용자:**
```bash
pip install -r requirements.txt
```

**참고:** Windows에서 `psycopg2-binary` 설치가 실패하는 경우:
1. Visual C++ Build Tools가 필요할 수 있습니다: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. 또는 미리 컴파일된 wheel 파일 사용:
   ```bash
   pip install --only-binary :all: psycopg2-binary
   ```

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고, PostgreSQL 데이터베이스 정보를 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일 내용 예시:
```
DATABASE_URL=postgresql://username:password@localhost:5432/hanja_db
DATABASE_SCHEMA=hanja_schema
HOST=0.0.0.0
PORT=8000
```

**중요: DATABASE_URL 형식**
- 올바른 형식: `postgresql://username:password@host:port/database`
- 예시: `postgresql://postgres:mypassword@localhost:5432/hanja_db`
- 잘못된 예시: `postgresql://...?pgbouncer=...` (pgbouncer는 별도 연결 풀러입니다)

**pgbouncer를 사용하는 경우:**
- pgbouncer는 별도 서버로 실행되며, DATABASE_URL은 pgbouncer의 주소를 가리켜야 합니다
- 예: `postgresql://username:password@pgbouncer-host:6432/hanja_db`

**스키마 설정:**
- `DATABASE_SCHEMA`: 사용할 PostgreSQL 스키마 이름 (기본값: `public`)
- 지정한 스키마가 없으면 `init_db.py` 실행 시 자동으로 생성됩니다.
- 예: `DATABASE_SCHEMA=hanja_schema`로 설정하면 `hanja_schema` 스키마를 사용합니다.

### 4. 데이터베이스 설정

#### 로컬 PostgreSQL 사용 시

PostgreSQL에 데이터베이스를 생성하세요:

```sql
CREATE DATABASE hanja_db;
```

스키마는 `init_db.py` 실행 시 자동으로 생성됩니다.

#### Supabase 사용 시

**방법 1: public 스키마 사용 (권장, 가장 간단)**

`.env` 파일에서:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres
DATABASE_SCHEMA=public
```

**방법 2: 커스텀 스키마 사용**

1. Supabase Dashboard → SQL Editor로 이동
2. `supabase_setup.sql` 파일의 내용을 실행하거나, 다음 SQL 실행:

```sql
CREATE SCHEMA IF NOT EXISTS hanja_schema;
GRANT USAGE ON SCHEMA hanja_schema TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA hanja_schema TO postgres;
```

3. `.env` 파일에서:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres
DATABASE_SCHEMA=hanja_schema
```

**Supabase 연결 정보 찾기:**
- Supabase Dashboard → Project Settings → Database
- Connection string (URI) 또는 Connection pooling에서 확인

### 5. 데이터베이스 초기화

샘플 데이터를 데이터베이스에 삽입합니다:

```bash
python init_db.py
```

### 6. 서버 실행

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

또는 환경 변수에서 설정한 값으로 실행:

```bash
uvicorn main:app --reload
```

## API 엔드포인트

### 모든 한자 데이터 조회
```
GET /api/hanja
```

응답 형식:
```json
{
  "hanja": [
    {
      "id": "1",
      "character": "一",
      "sound": "일",
      "meaning": "하나",
      "strokeOrder": [],
      "examples": [
        {"sentence": "一石二鳥", "meaning": "한 가지 일로 두 가지 이득을 얻음"}
      ],
      "chapter": 1,
      "difficulty": 1
    }
  ]
}
```

### 특정 한자 조회
```
GET /api/hanja/{hanja_id}
```

### 단원별 한자 조회
```
GET /api/hanja/chapter/{chapter}
```

## API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
