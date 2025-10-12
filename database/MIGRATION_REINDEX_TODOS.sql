-- Migration: 기존 todos의 order_index를 10000 간격으로 재정렬
-- 실행일: 2025-10-07
-- 목적: 큰 간격 방식(Fractional Indexing) 도입을 위한 기존 데이터 마이그레이션

-- Step 1: 임시 컬럼 추가하여 새로운 order_index 계산
-- (user별로 독립적으로 처리)

DO $$
DECLARE
  user_record RECORD;
  todo_record RECORD;
  counter INTEGER;
BEGIN
  -- 모든 사용자에 대해 반복
  FOR user_record IN
    SELECT DISTINCT user_id FROM todos
  LOOP
    counter := 1;

    -- 각 사용자의 todos를 order_index, created_at 순으로 정렬하여 처리
    FOR todo_record IN
      SELECT id
      FROM todos
      WHERE user_id = user_record.user_id
      ORDER BY order_index ASC, created_at DESC
    LOOP
      -- 10000 간격으로 order_index 업데이트
      UPDATE todos
      SET order_index = counter * 10000
      WHERE id = todo_record.id;

      counter := counter + 1;
    END LOOP;

    RAISE NOTICE 'User % - % todos 재정렬 완료', user_record.user_id, counter - 1;
  END LOOP;

  RAISE NOTICE '전체 마이그레이션 완료!';
END $$;

-- 결과 확인 쿼리 (선택사항)
-- SELECT user_id, id, title, order_index
-- FROM todos
-- ORDER BY user_id, order_index;
