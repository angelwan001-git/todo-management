'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserWithTodos {
  id: string;
  email: string;
  created_at: string;
  todos_count: number;
  completed_count: number;
  active_count: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithTodos[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // API 라우트를 통해 사용자 목록 가져오기 (페이지네이션 파라미터 포함)
      const response = await fetch(`/api/admin/users?page=${currentPage}&limit=${itemsPerPage}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Error fetching users:', data.error);
        setLoading(false);
        return;
      }

      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
      setTotalUsers(data.pagination.totalUsers);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">관리자 - 사용자 조회</h1>
            <p className="text-muted-foreground">
              전체 사용자 {totalUsers}명 / 페이지 {currentPage} of {totalPages}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>
            돌아가기
          </Button>
        </div>

        {/* 사용자 테이블 */}
        {users.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                등록된 사용자가 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="bg-muted/50">
                      <th className="px-6 py-3 text-left text-sm font-semibold">이메일</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">가입일</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">전체 할일</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">활성 할일</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">완료 할일</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">완료율</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((userData) => (
                      <tr key={userData.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">{userData.email}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(userData.created_at).toISOString().split('T')[0]}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-semibold">
                          {userData.todos_count}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-blue-600">
                          {userData.active_count}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                          {userData.completed_count}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-medium">
                          {userData.todos_count > 0
                            ? `${Math.round((userData.completed_count / userData.todos_count) * 100)}%`
                            : '0%'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
