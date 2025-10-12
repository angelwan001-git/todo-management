-- Supabase에서 실행할 마이그레이션 SQL
-- todos 테이블에 새로운 필드 추가

-- 1. 우선순위 컬럼 추가
ALTER TABLE todos
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT '보통' CHECK (priority IN ('낮음', '보통', '높음', '긴급'));

-- 2. 상태 컬럼 추가
ALTER TABLE todos
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT '예정' CHECK (status IN ('예정', '진행 중', '완료', '보류', '취소'));

-- 3. 시작일 컬럼 추가
ALTER TABLE todos
ADD COLUMN IF NOT EXISTS start_date DATE;

-- 4. 완료 예정일 컬럼 추가
ALTER TABLE todos
ADD COLUMN IF NOT EXISTS due_date DATE;

-- 5. 기존 데이터에 기본값 적용
UPDATE todos
SET
  priority = '보통'
WHERE priority IS NULL;

UPDATE todos
SET
  status = '예정'
WHERE status IS NULL;
