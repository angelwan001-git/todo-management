'use client';

import { useEffect, useState } from 'react';
import { Todo, NewTodo } from '@/types/database.types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { TodoItem } from './TodoItem';
import { AddTodoForm } from './AddTodoForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { user, signOut } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 할일 목록 가져오기
  const fetchTodos = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      if (error.message.includes('relation "public.todos" does not exist')) {
        console.warn('todos 테이블이 존재하지 않습니다. SETUP_DATABASE.md를 참고하여 테이블을 생성해주세요.');
      }
      setTodos([]);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, [user]);

  // 할일 추가
  const handleAddTodo = async (title: string) => {
    if (!user) return;

    // 새로운 할일의 order_index는 가장 큰 값 + 1
    const maxOrder = todos.length > 0
      ? Math.max(...todos.map(t => t.order_index))
      : -1;

    const newTodo: NewTodo = {
      title,
      completed: false,
      order_index: maxOrder + 1,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('todos')
      .insert([newTodo])
      .select()
      .single();

    if (error) {
      console.error('Add todo error:', error);
      if (error.message.includes('relation "public.todos" does not exist')) {
        alert('데이터베이스 테이블이 생성되지 않았습니다. SETUP_DATABASE.md 파일을 참고하여 Supabase에서 테이블을 생성해주세요.');
      } else {
        alert(`할일 추가 중 오류가 발생했습니다: ${error.message}`);
      }
      throw error;
    } else {
      setTodos([data, ...todos]);
    }
  };

  // 드래그 앤 드롭 처리
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTodos((todos) => {
        const oldIndex = todos.findIndex(todo => todo.id === active.id);
        const newIndex = todos.findIndex(todo => todo.id === over.id);

        const newTodos = arrayMove(todos, oldIndex, newIndex);

        // order_index 업데이트
        const updatedTodos = newTodos.map((todo, index) => ({
          ...todo,
          order_index: index
        }));

        // 데이터베이스에 순서 저장
        saveTodoOrder(updatedTodos);

        return updatedTodos;
      });
    }
  };

  // 순서 변경 저장
  const saveTodoOrder = async (reorderedTodos: Todo[]) => {
    try {
      if (reorderedTodos.length === 0) return;

      const updates = reorderedTodos.map((todo, index) => ({
        id: todo.id,
        order_index: index
      }));

      console.log('순서 저장 중...', updates);

      for (const update of updates) {
        await supabase
          .from('todos')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      console.log('순서 저장 완료!');
    } catch (error) {
      console.error('Error saving todo order:', error);
    }
  };

  // 할일 수정
  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    const { error } = await supabase
      .from('todos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    } else {
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      ));
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
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  // 필터링된 할일 목록
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;

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
            <p className="text-muted-foreground">
              안녕하세요, {user?.email}님!
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            로그아웃
          </Button>
        </div>

        {/* 할일 추가 폼 */}
        <Card>
          <CardContent className="pt-6">
            <AddTodoForm onAdd={handleAddTodo} />
          </CardContent>
        </Card>

        {/* 통계 */}
        <div className="flex gap-4">
          <Card className="flex-1">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-muted-foreground">활성 할일</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-muted-foreground">완료 할일</p>
            </CardContent>
          </Card>
        </div>

        {/* 필터 버튼 */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            전체 ({todos.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
          >
            활성 ({activeCount})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
          >
            완료 ({completedCount})
          </Button>
        </div>

        {/* 할일 목록 */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTodos.map(todo => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredTodos.map((todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}