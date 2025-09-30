# Supabase 데이터베이스 설정 가이드

## 문제 해결

현재 "todos not found" 오류가 발생하는 이유는 Supabase 데이터베이스에 `todos` 테이블이 생성되지 않았기 때문입니다.

## 해결 방법

### 1단계: Supabase 대시보드 접속
1. https://supabase.com/dashboard 에 접속
2. 로그인 후 프로젝트 선택: `mqswrgptjoojwtqjkxbg`

### 2단계: SQL Editor에서 스키마 실행
1. 왼쪽 메뉴에서 "SQL Editor" 클릭
2. "New query" 버튼 클릭
3. `database/schema.sql` 파일의 전체 내용을 복사해서 붙여넣기
4. "Run" 버튼 클릭하여 실행

### 3단계: 테이블 생성 확인
1. 왼쪽 메뉴에서 "Table Editor" 클릭
2. `todos` 테이블이 생성되었는지 확인

### 4단계: Row Level Security 확인
1. "Authentication" > "Policies" 메뉴 확인
2. `todos` 테이블에 대한 4개의 정책이 생성되었는지 확인:
   - Users can view their own todos
   - Users can insert their own todos
   - Users can update their own todos
   - Users can delete their own todos

## 스키마 내용

`database/schema.sql` 파일에는 다음이 포함되어 있습니다:

- `todos` 테이블 생성
- Row Level Security (RLS) 활성화
- 사용자별 데이터 접근 제한 정책
- 자동 타임스탬프 업데이트 기능
- 성능 최적화를 위한 인덱스

## 테이블 구조

```sql
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

## 문제가 계속 발생하는 경우

1. 브라우저 개발자 도구 콘솔에서 정확한 오류 메시지 확인
2. Supabase 대시보드에서 "Logs" 메뉴 확인
3. 환경 변수 (.env.local) 확인