-- todos 테이블에 order_index 컬럼 추가
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. order_index 컬럼 추가 (기본값 0)
ALTER TABLE todos ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

-- 2. 기존 데이터에 order_index 값 설정 (created_at 순서대로)
UPDATE todos
SET order_index = subquery.row_number - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as row_number
  FROM todos
) AS subquery
WHERE todos.id = subquery.id;

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS todos_order_idx ON todos(user_id, order_index);

-- 4. 확인: 업데이트된 데이터 조회
SELECT id, title, order_index, created_at FROM todos ORDER BY user_id, order_index;