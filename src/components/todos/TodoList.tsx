'use client';

import { useEffect, useState } from 'react';
import { Todo, NewTodo } from '@/types/database.types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { TodoItem } from './TodoItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTodoItem } from './SortableTodoItem';
import { Pagination } from '@/components/ui/pagination';

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 할일 목록 가져오기 (서버 측 페이지네이션)
  const fetchTodos = async () => {
    if (!user) return;

    setLoading(true);

    // 페이지네이션 범위 계산
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage - 1;

    // 필터에 따른 쿼리 빌드
    let query = supabase
      .from('todos')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // 필터 적용
    if (filter === 'active') {
      query = query.eq('completed', false);
    } else if (filter === 'completed') {
      query = query.eq('completed', true);
    }

    // 정렬 및 범위 적용 (order_index DESC로 변경)
    const { data, error, count } = await query
      .order('order_index', { ascending: false })
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) {
      console.error('Error fetching todos:', error);
      if (error.message.includes('relation "public.todos" does not exist')) {
        console.warn('todos 테이블이 존재하지 않습니다. SETUP_DATABASE.md를 참고하여 테이블을 생성해주세요.');
      }
      setTodos([]);
      setTotalCount(0);
    } else {
      setTodos(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, [user, currentPage, filter, itemsPerPage]);

  // 드래그 앤 드롭 처리 (페이지 전체 재정렬 방식)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !user) return;

    const oldIndex = todos.findIndex(todo => todo.id === active.id);
    const newIndex = todos.findIndex(todo => todo.id === over.id);

    // 낙관적 UI 업데이트
    const newTodos = arrayMove(todos, oldIndex, newIndex);
    setTodos(newTodos);

    try {
      // 현재 페이지의 최소/최대 order_index 가져오기
      const currentOrderIndices = todos.map(t => t.order_index);
      const minOrderIndex = Math.min(...currentOrderIndices);
      const maxOrderIndex = Math.max(...currentOrderIndices);

      console.log(`드래그: 현재 페이지 범위 [${minOrderIndex} ~ ${maxOrderIndex}]`);

      // DESC 정렬이므로 큰 값부터 역순으로 할당
      // 첫 번째 항목이 가장 큰 값을 가져야 함
      const updatedTodos = newTodos.map((todo, idx) => ({
        ...todo,
        order_index: maxOrderIndex - idx
      }));

      setTodos(updatedTodos);

      // 전체 페이지 order_index 업데이트
      await saveTodoOrder(updatedTodos);

      console.log('페이지 전체 순서 저장 완료');
    } catch (error) {
      console.error('Error saving todo order:', error);
      // 에러 발생 시 원래 상태로 복구
      setTodos(todos);
      fetchTodos();
    }
  };

  // 순서 변경 저장 (여러 항목)
  const saveTodoOrder = async (reorderedTodos: Todo[]) => {
    try {
      if (reorderedTodos.length === 0) return;

      console.log('다중 순서 저장 중...', reorderedTodos.length);

      for (const todo of reorderedTodos) {
        await supabase
          .from('todos')
          .update({ order_index: todo.order_index })
          .eq('id', todo.id);
      }

      console.log('다중 순서 저장 완료!');
    } catch (error) {
      console.error('Error saving todo order:', error);
      throw error;
    }
  };

  // 전체 통계 가져오기 (필터링 없이)
  const [stats, setStats] = useState({ activeCount: 0, completedCount: 0, totalCount: 0 });

  const fetchStats = async () => {
    if (!user) return;

    const { count: totalCount } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: activeCount } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', false);

    const { count: completedCount } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    setStats({
      totalCount: totalCount || 0,
      activeCount: activeCount || 0,
      completedCount: completedCount || 0,
    });
  };

  useEffect(() => {
    fetchStats();
  }, [user, todos]);

  // 할일 수정
  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    const { error } = await supabase
      .from('todos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    } else {
      // 서버에서 다시 가져오기
      fetchTodos();
      fetchStats();
    }
  };

  // 할일 삭제
  const handleDeleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    } else {
      // 서버에서 다시 가져오기
      fetchTodos();
      fetchStats();
    }
  };

  // 페이지네이션 계산 (서버에서 받은 totalCount 사용)
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // 페이지당 항목 수 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">할일 관리</h1>
          </div>
          <div className="flex">
            <Button onClick={() => router.push('/todo/add')}>
              할일 추가
            </Button>
          </div>
        </div>

        {/* 통계 */}
        <div className="flex gap-4">
          <Card className="flex-1">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.activeCount}</div>
              <p className="text-muted-foreground">활성 할일</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.completedCount}</div>
              <p className="text-muted-foreground">완료 할일</p>
            </CardContent>
          </Card>
        </div>

        {/* 필터 버튼 */}
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              전체 ({stats.totalCount})
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              onClick={() => setFilter('active')}
            >
              활성 ({stats.activeCount})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
            >
              완료 ({stats.completedCount})
            </Button>
          </div>

          {/* 페이지당 항목 수 선택 */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">보기:</span>
            <div className="flex gap-1">
              <Button
                variant={itemsPerPage === 5 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setItemsPerPage(5)}
              >
                5
              </Button>
              <Button
                variant={itemsPerPage === 10 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setItemsPerPage(10)}
              >
                10
              </Button>
              <Button
                variant={itemsPerPage === 50 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setItemsPerPage(50)}
              >
                50
              </Button>
            </div>
          </div>
        </div>

        {/* 할일 목록 */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {filter === 'all'
                    ? '할일이 없습니다. 새로운 할일을 추가해보세요!'
                    : `${filter === 'active' ? '활성' : '완료된'} 할일이 없습니다.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={todos.map(todo => todo.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {todos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}