'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { NewTodo } from '@/types/database.types';
import { ArrowLeft } from 'lucide-react';
import { getNextOrderIndex } from '@/lib/orderIndex';

export default function AddTodoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('보통');
  const [status, setStatus] = useState('예정');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const showAlert = (title: string, description: string, redirect = false) => {
    setAlertTitle(title);
    setAlertDescription(description);
    setShouldRedirect(redirect);
    setAlertOpen(true);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    if (shouldRedirect) {
      router.push('/');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;
    setConfirmDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);
    try {
      // 최대 order_index 가져와서 +1 (데이터가 없으면 1부터 시작)
      const newOrderIndex = await getNextOrderIndex(user.id);

      // 새 할일 생성
      const newTodo: NewTodo = {
        title: title.trim(),
        completed: false,
        order_index: newOrderIndex,
        user_id: user.id,
        priority: priority as '낮음' | '보통' | '높음' | '긴급',
        status: status as '예정' | '진행 중' | '완료' | '보류' | '취소',
        start_date: startDate || null,
        due_date: dueDate || null,
      };

      const { error } = await supabase
        .from('todos')
        .insert([newTodo]);

      if (error) {
        console.error('Add todo error:', error);
        showAlert('오류', `할일 추가 중 오류가 발생했습니다: ${error.message}`);
      } else {
        showAlert('성공', '할일이 추가되었습니다!', true);
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('오류', '할일 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">할일 추가</h1>
            <p className="text-muted-foreground">새로운 할일을 등록하세요</p>
          </div>
        </div>

        {/* 할일 추가 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>할일 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* 제목 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="할일을 입력하세요..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {/* 우선순위와 상태 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">우선순위</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                    disabled={loading}
                  >
                    <option value="낮음">낮음</option>
                    <option value="보통">보통</option>
                    <option value="높음">높음</option>
                    <option value="긴급">긴급</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">상태</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                    disabled={loading}
                  >
                    <option value="예정">예정</option>
                    <option value="진행 중">진행 중</option>
                    <option value="완료">완료</option>
                    <option value="보류">보류</option>
                    <option value="취소">취소</option>
                  </select>
                </div>
              </div>

              {/* 시작일과 완료일 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">시작일</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">완료 예정일</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  disabled={loading}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="flex-1"
                >
                  {loading ? '추가 중...' : '할일 추가'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Save Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>할일을 저장하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              입력한 할일 정보를 저장합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              저장
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Result Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAlertClose}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
