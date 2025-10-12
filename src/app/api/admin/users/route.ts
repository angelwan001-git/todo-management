import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 서버 사이드용 Supabase 클라이언트 (service role key 사용)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: Request) {
  try {
    // URL에서 페이지네이션 파라미터 추출
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 모든 사용자 목록 가져오기 (admin API)
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // 전체 사용자 수
    const totalUsers = users.length;

    // 페이지네이션 적용
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    // 각 사용자의 할일 통계 가져오기 (페이지네이션된 사용자만)
    const usersWithStats = await Promise.all(
      paginatedUsers.map(async (user) => {
        const { data: todos } = await supabaseAdmin
          .from('todos')
          .select('id, completed')
          .eq('user_id', user.id);

        const todosCount = todos?.length || 0;
        const completedCount = todos?.filter(t => t.completed).length || 0;
        const activeCount = todosCount - completedCount;

        return {
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          todos_count: todosCount,
          completed_count: completedCount,
          active_count: activeCount,
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
