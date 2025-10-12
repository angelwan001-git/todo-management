'use client';

import { useState } from 'react';
import { Todo } from '@/types/database.types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editPriority, setEditPriority] = useState(todo.priority || '보통');
  const [editStatus, setEditStatus] = useState(todo.status || '예정');
  const [editStartDate, setEditStartDate] = useState(todo.start_date || '');
  const [editDueDate, setEditDueDate] = useState(todo.due_date || '');
  const [loading, setLoading] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      await onUpdate(todo.id, { completed: !todo.completed });
    } catch (error) {
      console.error('Error toggling todo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await onUpdate(todo.id, {
        title: editTitle.trim(),
        priority: editPriority as '낮음' | '보통' | '높음' | '긴급',
        status: editStatus as '예정' | '진행 중' | '완료' | '보류' | '취소',
        start_date: editStartDate || null,
        due_date: editDueDate || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating todo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditPriority(todo.priority || '보통');
    setEditStatus(todo.status || '예정');
    setEditStartDate(todo.start_date || '');
    setEditDueDate(todo.due_date || '');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
      setLoading(true);
      try {
        await onDelete(todo.id);
      } catch (error) {
        console.error('Error deleting todo:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 우선순위 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '긴급': return 'text-red-600 font-semibold';
      case '높음': return 'text-orange-600 font-medium';
      case '보통': return 'text-blue-600';
      case '낮음': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  // 상태 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료': return 'text-green-600';
      case '진행 중': return 'text-blue-600';
      case '예정': return 'text-gray-600';
      case '보류': return 'text-yellow-600';
      case '취소': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card space-y-3">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={handleToggleComplete}
          disabled={loading}
        />

        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              disabled={loading}
              autoFocus
            />
          ) : (
            <span
              className={cn(
                'cursor-pointer',
                todo.completed && 'line-through text-muted-foreground'
              )}
              onClick={() => setIsEditing(true)}
            >
              {todo.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSaveEdit}
                disabled={loading}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 추가 정보 표시 / 수정 */}
      {isEditing ? (
        <div className="grid grid-cols-2 gap-3 pl-9 p-3 bg-muted/50 rounded">
          <div>
            <label className="text-xs font-medium mb-1 block">우선순위</label>
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as '낮음' | '보통' | '높음' | '긴급')}
              className="w-full px-2 py-1 text-sm rounded border bg-background"
            >
              <option value="낮음">낮음</option>
              <option value="보통">보통</option>
              <option value="높음">높음</option>
              <option value="긴급">긴급</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">상태</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as '예정' | '진행 중' | '완료' | '보류' | '취소')}
              className="w-full px-2 py-1 text-sm rounded border bg-background"
            >
              <option value="예정">예정</option>
              <option value="진행 중">진행 중</option>
              <option value="완료">완료</option>
              <option value="보류">보류</option>
              <option value="취소">취소</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">시작일</label>
            <Input
              type="date"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">완료 예정일</label>
            <Input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      ) : (
        <div className="flex gap-4 pl-9 text-xs text-muted-foreground">
          <span className={getPriorityColor(todo.priority || '보통')}>
            우선순위: {todo.priority || '보통'}
          </span>
          <span className={getStatusColor(todo.status || '예정')}>
            상태: {todo.status || '예정'}
          </span>
          {todo.start_date && (
            <span>시작일: {todo.start_date}</span>
          )}
          {todo.due_date && (
            <span>완료일: {todo.due_date}</span>
          )}
        </div>
      )}
    </div>
  );
}