-- =====================================================
-- 중복된 order_index 수정 마이그레이션
-- =====================================================
-- 목적: 중복된 order_index 값을 가진 todos를 10000 간격으로 재정렬
-- 실행: Supabase Dashboard > SQL Editor에서 실행
-- =====================================================

-- 1단계: 현재 중복 상태 확인 (선택사항)
-- 이 쿼리로 중복이 있는지 먼저 확인할 수 있습니다
/*
SELECT
  user_id,
  order_index,
  COUNT(*) as duplicate_count
FROM todos
GROUP BY user_id, order_index
HAVING COUNT(*) > 1
ORDER BY user_id, order_index;
*/

-- 2단계: 각 사용자별로 todos를 10000 간격으로 재정렬
DO $$
DECLARE
  user_record RECORD;
  todo_record RECORD;
  new_order_index INTEGER;
BEGIN
  -- 모든 사용자를 순회
  FOR user_record IN
    SELECT DISTINCT user_id FROM todos ORDER BY user_id
  LOOP
    RAISE NOTICE '사용자 % 처리 중...', user_record.user_id;

    new_order_index := 10000;

    -- 해당 사용자의 todos를 order_index, created_at 순으로 순회
    FOR todo_record IN
      SELECT id
      FROM todos
      WHERE user_id = user_record.user_id
      ORDER BY order_index ASC, created_at DESC
    LOOP
      -- 새로운 order_index 할당
      UPDATE todos
      SET order_index = new_order_index
      WHERE id = todo_record.id;

      -- 다음 항목을 위해 10000 증가
      new_order_index := new_order_index + 10000;
    END LOOP;

    RAISE NOTICE '사용자 % 완료: todos 재정렬됨', user_record.user_id;
  END LOOP;

  RAISE NOTICE '모든 사용자의 order_index 재정렬 완료!';
END $$;

-- 3단계: 결과 확인
-- 사용자별 order_index 범위 확인
SELECT
  user_id,
  COUNT(*) as todo_count,
  MIN(order_index) as min_order,
  MAX(order_index) as max_order,
  MAX(order_index) - MIN(order_index) as range_span
FROM todos
GROUP BY user_id
ORDER BY user_id;

-- 중복 확인 (중복이 없어야 함)
SELECT
  user_id,
  order_index,
  COUNT(*) as duplicate_count
FROM todos
GROUP BY user_id, order_index
HAVING COUNT(*) > 1;

-- 메시지: 위 쿼리 결과가 비어있으면 성공!
