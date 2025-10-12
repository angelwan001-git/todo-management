'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BoardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              게시판을 이용하시려면 먼저 로그인해주세요.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>게시판</CardTitle>
          <CardDescription>
            게시판 기능은 개발 예정입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            곧 게시글을 작성하고 공유할 수 있는 기능이 추가될 예정입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
