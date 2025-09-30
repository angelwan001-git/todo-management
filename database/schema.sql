-- Supabase 데이터베이스 스키마 설정
-- 이 파일을 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. todos 테이블 생성
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) > 0),
  completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Row Level Security (RLS) 활성화
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 생성 - 사용자는 자신의 todos만 볼 수 있음
CREATE POLICY "Users can view their own todos"
ON todos FOR SELECT
USING (auth.uid() = user_id);

-- 4. RLS 정책 생성 - 사용자는 자신의 todos만 삽입할 수 있음
CREATE POLICY "Users can insert their own todos"
ON todos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. RLS 정책 생성 - 사용자는 자신의 todos만 업데이트할 수 있음
CREATE POLICY "Users can update their own todos"
ON todos FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. RLS 정책 생성 - 사용자는 자신의 todos만 삭제할 수 있음
CREATE POLICY "Users can delete their own todos"
ON todos FOR DELETE
USING (auth.uid() = user_id);

-- 7. updated_at 자동 업데이트를 위한 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. updated_at 트리거 생성
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON todos(created_at DESC);
CREATE INDEX IF NOT EXISTS todos_completed_idx ON todos(completed);
CREATE INDEX IF NOT EXISTS todos_order_idx ON todos(user_id, order_index);