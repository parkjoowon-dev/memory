-- Supabase에서 스키마 생성 및 권한 설정
-- Supabase SQL Editor에서 이 스크립트를 실행하세요

-- 1. 스키마 생성 (원하는 스키마 이름으로 변경)
CREATE SCHEMA IF NOT EXISTS hanja_schema;

-- 2. 현재 사용자에게 스키마 사용 권한 부여
GRANT USAGE ON SCHEMA hanja_schema TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA hanja_schema TO postgres;

-- 3. 스키마의 모든 테이블에 대한 권한 부여
ALTER DEFAULT PRIVILEGES IN SCHEMA hanja_schema 
GRANT ALL ON TABLES TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA hanja_schema 
GRANT ALL ON SEQUENCES TO postgres;

-- 4. public 스키마를 사용하는 경우 (기본값)
-- 위의 스키마 생성 부분을 건너뛰고 바로 테이블 생성 가능

-- 참고: Supabase에서는 기본적으로 public 스키마를 사용합니다.
-- 다른 스키마를 사용하려면 위의 SQL을 실행한 후 .env 파일에서
-- DATABASE_SCHEMA=hanja_schema 로 설정하세요.
