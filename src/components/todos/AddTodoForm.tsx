'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface AddTodoFormProps {
  onAdd: (title: string, priority: string, status: string, startDate: string | null, dueDate: string | null) => Promise<void>;
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('보통');
  const [status, setStatus] = useState('예정');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onAdd(
        title.trim(),
        priority,
        status,
        startDate || null,
        dueDate || null
      );
      setTitle('');
      setPriority('보통');
      setStatus('예정');
      setStartDate('');
      setDueDate('');
      setShowDetails(false);
    } catch (error) {
      console.error('Error adding todo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="새로운 할 일을 입력하세요..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !title.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          추가
        </Button>
      </div>

      {/* 상세 옵션 토글 버튼 */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className="w-full"
      >
        {showDetails ? '간단히 보기' : '상세 옵션 보기'}
      </Button>

      {/* 상세 옵션 */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
          {/* 우선순위 */}
          <div>
            <label className="text-sm font-medium mb-1 block">우선순위</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-background"
            >
              <option value="낮음">낮음</option>
              <option value="보통">보통</option>
              <option value="높음">높음</option>
              <option value="긴급">긴급</option>
            </select>
          </div>

          {/* 상태 */}
          <div>
            <label className="text-sm font-medium mb-1 block">상태</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-background"
            >
              <option value="예정">예정</option>
              <option value="진행 중">진행 중</option>
              <option value="완료">완료</option>
              <option value="보류">보류</option>
              <option value="취소">취소</option>
            </select>
          </div>

          {/* 시작일 */}
          <div>
            <label className="text-sm font-medium mb-1 block">시작일</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* 완료일 */}
          <div>
            <label className="text-sm font-medium mb-1 block">완료 예정일</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      )}
    </form>
  );
}