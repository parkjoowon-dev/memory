from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from config import settings

# SQLAlchemy 2.0 스타일
Base = declarative_base()

# 엔진 생성 (pool_pre_ping으로 연결 안정성 향상)
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=False  # SQL 쿼리 로깅 (개발 시 True로 변경 가능)
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session
)


def get_db() -> Session:
    """데이터베이스 세션 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
