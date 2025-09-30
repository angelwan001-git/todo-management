import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 서버 컴포넌트용 Supabase 클라이언트
export const createSupabaseServerClient = () => createClient(supabaseUrl, supabaseAnonKey);