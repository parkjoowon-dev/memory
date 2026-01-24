"""
데이터베이스 초기화 및 샘플 데이터 삽입 스크립트
sampleHanja.ts의 데이터를 PostgreSQL에 삽입합니다.
ORM을 사용하여 데이터를 관리합니다.
"""
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from database import SessionLocal, engine, Base
from models import HanjaModel
from config import settings

# 샘플 데이터 (sampleHanja.ts에서 가져온 데이터)
SAMPLE_DATA = [
    {
        "id": "1",
        "character": "一",
        "sound": "일",
        "meaning": "하나",
        "strokeOrder": [],
        "examples": [
            {"sentence": "一石二鳥", "meaning": "한 가지 일로 두 가지 이득을 얻음"},
            {"sentence": "一見", "meaning": "한 번 봄"},
        ],
        "chapter": 1,
        "difficulty": 1,
    },
    {
        "id": "2",
        "character": "二",
        "sound": "이",
        "meaning": "둘",
        "strokeOrder": [],
        "examples": [
            {"sentence": "二重", "meaning": "이중"},
            {"sentence": "二月", "meaning": "이월"},
        ],
        "chapter": 1,
        "difficulty": 1,
    },
    {
        "id": "3",
        "character": "三",
        "sound": "삼",
        "meaning": "셋",
        "strokeOrder": [],
        "examples": [
            {"sentence": "三角", "meaning": "삼각"},
            {"sentence": "三月", "meaning": "삼월"},
        ],
        "chapter": 1,
        "difficulty": 1,
    },
    {
        "id": "4",
        "character": "人",
        "sound": "인",
        "meaning": "사람",
        "strokeOrder": [],
        "examples": [
            {"sentence": "人間", "meaning": "인간"},
            {"sentence": "人口", "meaning": "인구"},
        ],
        "chapter": 1,
        "difficulty": 2,
    },
    {
        "id": "5",
        "character": "大",
        "sound": "대",
        "meaning": "큰",
        "strokeOrder": [],
        "examples": [
            {"sentence": "大學", "meaning": "대학"},
            {"sentence": "大小", "meaning": "크고 작음"},
        ],
        "chapter": 1,
        "difficulty": 2,
    },
    {
        "id": "6",
        "character": "小",
        "sound": "소",
        "meaning": "작은",
        "strokeOrder": [],
        "examples": [
            {"sentence": "小學", "meaning": "소학"},
            {"sentence": "大小", "meaning": "크고 작음"},
        ],
        "chapter": 1,
        "difficulty": 2,
    },
    {
        "id": "7",
        "character": "山",
        "sound": "산",
        "meaning": "뫼",
        "strokeOrder": [],
        "examples": [
            {"sentence": "山頂", "meaning": "산꼭대기"},
            {"sentence": "火山", "meaning": "화산"},
        ],
        "chapter": 2,
        "difficulty": 2,
    },
    {
        "id": "8",
        "character": "水",
        "sound": "수",
        "meaning": "물",
        "strokeOrder": [],
        "examples": [
            {"sentence": "水準", "meaning": "수준"},
            {"sentence": "海水", "meaning": "바닷물"},
        ],
        "chapter": 2,
        "difficulty": 2,
    },
    {
        "id": "9",
        "character": "火",
        "sound": "화",
        "meaning": "불",
        "strokeOrder": [],
        "examples": [
            {"sentence": "火災", "meaning": "화재"},
            {"sentence": "火山", "meaning": "화산"},
        ],
        "chapter": 2,
        "difficulty": 2,
    },
    {
        "id": "10",
        "character": "木",
        "sound": "목",
        "meaning": "나무",
        "strokeOrder": [],
        "examples": [
            {"sentence": "木造", "meaning": "목조"},
            {"sentence": "樹木", "meaning": "수목"},
        ],
        "chapter": 2,
        "difficulty": 2,
    },
    {
        "id": "11",
        "character": "歌",
        "sound": "가",
        "meaning": "노래",
        "strokeOrder": [],
        "examples": [
            {"sentence": "歌手", "meaning": "가수"},
            {"sentence": "詩歌", "meaning": "시가"},
        ],
        "chapter": 3,
        "difficulty": 2,
    },
    {
        "id": "12",
        "character": "家",
        "sound": "가",
        "meaning": "집",
        "strokeOrder": [],
        "examples": [
            {"sentence": "家長", "meaning": "가장"},
            {"sentence": "國家", "meaning": "국가"},
        ],
        "chapter": 3,
        "difficulty": 2,
    },
]


def init_db():
    """데이터베이스 테이블 생성 및 샘플 데이터 삽입 (ORM 사용)"""
    db = SessionLocal()
    try:
        # 스키마가 없으면 생성 (DDL 작업이므로 text 사용)
        schema_name = settings.database_schema
        if schema_name != "public":
            try:
                # 스키마 존재 여부 확인
                inspector = inspect(engine)
                schemas = inspector.get_schema_names()
                if schema_name not in schemas:
                    # Supabase나 일부 클라우드 DB에서는 스키마 생성 권한이 없을 수 있음
                    try:
                        db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
                        db.commit()
                        print(f"스키마 '{schema_name}'를 생성했습니다.")
                    except Exception as schema_error:
                        print(f"⚠️  스키마 생성 실패: {schema_error}")
                        print(f"💡 Supabase를 사용하는 경우 SQL Editor에서 다음 명령을 실행하세요:")
                        print(f"   CREATE SCHEMA IF NOT EXISTS {schema_name};")
                        print(f"   또는 public 스키마를 사용하세요 (DATABASE_SCHEMA=public)")
                        raise
                else:
                    print(f"스키마 '{schema_name}'가 이미 존재합니다.")
            except Exception as inspect_error:
                print(f"⚠️  스키마 확인 실패: {inspect_error}")
                print(f"💡 public 스키마를 사용하거나 Supabase SQL Editor에서 스키마를 생성하세요.")
                raise
        
        # ORM을 사용하여 테이블 생성
        Base.metadata.create_all(bind=engine)
        print("테이블을 생성/확인했습니다.")
        
        # ORM을 사용하여 기존 데이터 확인
        from sqlalchemy import select, func
        stmt = select(func.count(HanjaModel.id))
        existing = db.execute(stmt).scalar()
        
        if existing > 0:
            print(f"데이터베이스에 이미 {existing}개의 한자 데이터가 있습니다.")
            return
        
        # ORM을 사용하여 샘플 데이터 삽입
        hanja_models = []
        for data in SAMPLE_DATA:
            hanja = HanjaModel(
                id=data["id"],
                character=data["character"],
                sound=data["sound"],
                meaning=data["meaning"],
                stroke_order=data["strokeOrder"],
                examples=data["examples"],
                chapter=data["chapter"],
                difficulty=data["difficulty"]
            )
            hanja_models.append(hanja)
        
        # bulk insert (ORM 방식)
        db.add_all(hanja_models)
        db.commit()
        print(f"성공적으로 {len(SAMPLE_DATA)}개의 한자 데이터를 삽입했습니다.")
    except Exception as e:
        db.rollback()
        print(f"오류 발생: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
