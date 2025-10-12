import { supabase } from './supabase';

const ORDER_GAP = 10000; // 기본 간격
const MIN_GAP = 2; // 재정렬이 필요한 최소 간격
const REINDEX_RANGE = 20; // 재정렬 시 처리할 항목 수

/**
 * 사용자의 최대 order_index 값을 가져옵니다.
 * @param userId - 사용자 ID
 * @returns 최대 order_index 값 (할일이 없으면 0 반환)
 */
export async function getMaxOrderIndex(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('todos')
    .select('order_index')
    .eq('user_id', userId)
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // 데이터가 없는 경우 (첫 번째 할일)
    if (error.code === 'PGRST116') {
      return 0;
    }
    console.error('Error fetching max order_index:', error);
    return 0;
  }

  return data?.order_index || 0;
}

/**
 * 새로운 order_index 값을 생성합니다 (최대값 + 1).
 * 할일이 없으면 1부터 시작합니다.
 * @param userId - 사용자 ID
 * @returns 새 order_index 값
 */
export async function getNextOrderIndex(userId: string): Promise<number> {
  const maxOrderIndex = await getMaxOrderIndex(userId);
  return maxOrderIndex + 1;
}

/**
 * 특정 범위의 todos를 재정렬합니다 (지역적 재정렬)
 */
async function reindexRange(
  userId: string,
  startOrderIndex: number | null,
  endOrderIndex: number | null,
  limit: number = REINDEX_RANGE
): Promise<void> {
  // 재정렬할 범위의 todos 조회
  let query = supabase
    .from('todos')
    .select('id, order_index')
    .eq('user_id', userId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (startOrderIndex !== null) {
    query = query.gte('order_index', startOrderIndex);
  }
  if (endOrderIndex !== null) {
    query = query.lte('order_index', endOrderIndex);
  }

  const { data: todosToReindex, error } = await query;

  if (error || !todosToReindex || todosToReindex.length === 0) {
    console.error('Error fetching todos for reindexing:', error);
    return;
  }

  console.log(`지역적 재정렬: ${todosToReindex.length}개 항목`);

  // ORDER_GAP 간격으로 재정렬
  const baseIndex = startOrderIndex || ORDER_GAP;
  for (let i = 0; i < todosToReindex.length; i++) {
    const newOrderIndex = baseIndex + (i * ORDER_GAP);
    await supabase
      .from('todos')
      .update({ order_index: newOrderIndex })
      .eq('id', todosToReindex[i].id);
  }

  console.log('지역적 재정렬 완료');
}

/**
 * 새로운 할일을 맨 앞에 추가할 때 사용할 order_index 계산
 */
export async function calculateOrderIndexForFirst(userId: string): Promise<number> {
  // 현재 최소 order_index 조회
  const { data: firstTodo } = await supabase
    .from('todos')
    .select('order_index')
    .eq('user_id', userId)
    .order('order_index', { ascending: true })
    .limit(1)
    .single();

  if (!firstTodo) {
    // 첫 번째 할일
    return ORDER_GAP;
  }

  const newOrderIndex = firstTodo.order_index - ORDER_GAP;

  // 간격이 부족한 경우 (0 이하)
  if (newOrderIndex <= 0) {
    console.log('간격 부족 - 앞쪽 범위 재정렬 시작');
    // 앞쪽 10개만 재정렬
    await reindexRange(userId, null, firstTodo.order_index + (ORDER_GAP * 10), 10);
    return ORDER_GAP; // 재정렬 후 첫 번째 위치
  }

  return newOrderIndex;
}

/**
 * 두 항목 사이에 새로운 할일을 삽입할 때 사용할 order_index 계산
 */
export async function calculateOrderIndexBetween(
  userId: string,
  beforeOrderIndex: number,
  afterOrderIndex: number
): Promise<number> {
  const gap = afterOrderIndex - beforeOrderIndex;

  // 간격이 충분한 경우
  if (gap >= MIN_GAP) {
    return Math.floor((beforeOrderIndex + afterOrderIndex) / 2);
  }

  // 간격이 부족한 경우 - 해당 범위만 재정렬
  console.log('간격 부족 - 중간 범위 재정렬 시작');
  await reindexRange(
    userId,
    beforeOrderIndex - ORDER_GAP,
    afterOrderIndex + ORDER_GAP,
    REINDEX_RANGE
  );

  // 재정렬 후 중간값 반환
  return beforeOrderIndex + ORDER_GAP;
}

/**
 * 드래그 앤 드롭으로 항목을 이동할 때 새로운 order_index 계산
 */
export async function calculateOrderIndexForDragDrop(
  userId: string,
  targetPosition: number,
  todos: Array<{ id: string; order_index: number }>
): Promise<{ todoId: string; newOrderIndex: number }[]> {
  const updates: { todoId: string; newOrderIndex: number }[] = [];

  // 드래그된 항목의 새 위치 앞뒤 order_index 확인
  const beforeTodo = targetPosition > 0 ? todos[targetPosition - 1] : null;
  const afterTodo = targetPosition < todos.length ? todos[targetPosition] : null;

  if (!beforeTodo && afterTodo) {
    // 맨 앞으로 이동
    const newOrderIndex = afterTodo.order_index - ORDER_GAP;

    if (newOrderIndex <= 0) {
      // 간격 부족 - 앞쪽 재정렬
      console.log('드래그: 간격 부족 - 앞쪽 범위 재정렬');
      await reindexRange(userId, null, afterTodo.order_index + (ORDER_GAP * 10), 10);

      // 재정렬 후 새로운 값 조회
      const { data: reindexedTodos } = await supabase
        .from('todos')
        .select('id, order_index')
        .eq('user_id', userId)
        .order('order_index', { ascending: true })
        .limit(todos.length);

      return reindexedTodos?.map((todo, idx) => ({
        todoId: todo.id,
        newOrderIndex: (idx + 1) * ORDER_GAP
      })) || [];
    }

    return [{ todoId: todos[targetPosition].id, newOrderIndex }];

  } else if (beforeTodo && !afterTodo) {
    // 맨 뒤로 이동
    const newOrderIndex = beforeTodo.order_index + ORDER_GAP;
    return [{ todoId: todos[targetPosition].id, newOrderIndex }];

  } else if (beforeTodo && afterTodo) {
    // 중간에 이동
    const gap = afterTodo.order_index - beforeTodo.order_index;

    if (gap >= MIN_GAP) {
      // 간격 충분
      const newOrderIndex = Math.floor((beforeTodo.order_index + afterTodo.order_index) / 2);
      return [{ todoId: todos[targetPosition].id, newOrderIndex }];
    } else {
      // 간격 부족 - 중간 범위 재정렬
      console.log('드래그: 간격 부족 - 중간 범위 재정렬');
      await reindexRange(
        userId,
        beforeTodo.order_index - ORDER_GAP,
        afterTodo.order_index + ORDER_GAP,
        REINDEX_RANGE
      );

      // 재정렬 후 새로운 값 조회
      const { data: reindexedTodos } = await supabase
        .from('todos')
        .select('id, order_index')
        .eq('user_id', userId)
        .order('order_index', { ascending: true })
        .limit(todos.length);

      return reindexedTodos?.map((todo, idx) => ({
        todoId: todo.id,
        newOrderIndex: (idx + 1) * ORDER_GAP
      })) || [];
    }
  }

  return updates;
}
