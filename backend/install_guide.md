# 설치 가이드 - Windows에서 발생하는 빌드 오류 해결

## pydantic-core 빌드 오류 해결

Windows에서 `pydantic-core` 빌드 오류가 발생하는 경우 다음 방법을 시도하세요:

### 방법 1: 미리 컴파일된 wheel 파일 사용 (권장)

```bash
# pip 업그레이드
pip install --upgrade pip setuptools wheel

# pydantic-core를 먼저 설치 (미리 컴파일된 버전)
pip install --only-binary :all: pydantic-core

# 나머지 패키지 설치
pip install -r requirements.txt
```

### 방법 2: Python 버전 확인 및 업그레이드

```bash
# Python 버전 확인 (3.9 이상 권장)
python --version

# Python 3.9 미만인 경우 업그레이드 필요
```

### 방법 3: pydantic 버전 조정

```bash
# 더 안정적인 버전으로 설치
pip install "pydantic>=2.5.0,<2.9.0"
pip install "pydantic-settings>=2.1.0,<2.2.0"

# 나머지 패키지 설치
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv
```

### 방법 4: Visual C++ Build Tools 설치

Rust 컴파일이 필요한 경우:

1. Visual Studio Build Tools 다운로드: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. "C++ 빌드 도구" 워크로드 설치
3. 재부팅 후 다시 시도

### 방법 5: 순차적 설치

```bash
# 1. 기본 도구 업그레이드
pip install --upgrade pip setuptools wheel

# 2. pydantic 관련 패키지 먼저 설치
pip install pydantic pydantic-settings

# 3. 나머지 패키지 설치
pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary python-dotenv
```

## psycopg2-binary 설치 오류 해결

```bash
# 방법 1: 최신 버전으로 설치
pip install psycopg2-binary --upgrade

# 방법 2: 특정 버전 설치
pip install psycopg2-binary==2.9.9

# 방법 3: 미리 컴파일된 wheel만 사용
pip install --only-binary :all: psycopg2-binary
```

## 전체 설치 스크립트 (Windows)

```bash
# 가상 환경 생성 및 활성화
python -m venv venv
venv\Scripts\activate

# pip 업그레이드
python -m pip install --upgrade pip setuptools wheel

# 패키지 순차 설치
pip install pydantic pydantic-settings
pip install fastapi uvicorn[standard]
pip install sqlalchemy
pip install psycopg2-binary
pip install python-dotenv

# 또는 requirements.txt 사용 (오류 시 위 방법 사용)
pip install -r requirements.txt
```

## Python 3.13 호환성 문제 해결

Python 3.13을 사용하는 경우 SQLAlchemy를 최신 버전으로 업그레이드해야 합니다:

```bash
# SQLAlchemy 최신 버전으로 업그레이드
pip install --upgrade sqlalchemy

# 또는 특정 최신 버전 설치
pip install "sqlalchemy>=2.0.30"
```

**참고:** Python 3.13은 매우 최신 버전이라 일부 패키지가 아직 완전히 지원하지 않을 수 있습니다. 
안정성을 위해 Python 3.11 또는 3.12 사용을 권장합니다.
