'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendEmail, setShowResendEmail] = useState(false);
  const { signIn } = useAuth();

  const handleResendEmail = async () => {
    if (!email) return;

    setLoading(true);
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      setError('확인 이메일을 재발송했습니다. 받은편지함을 확인해주세요.');
      setShowResendEmail(false);
    } catch (err: any) {
      setError('이메일 재발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
    } catch (err: any) {
      if (err.message?.includes('Email not confirmed')) {
        setError('이메일 확인이 필요합니다. 받은편지함을 확인하고 이메일 인증 링크를 클릭해주세요.');
        setShowResendEmail(true);
      } else {
        setError(err.message || '로그인에 실패했습니다.');
        setShowResendEmail(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          계정에 로그인하여 할 일을 관리하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
          {showResendEmail && (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={handleResendEmail}
              disabled={loading || !email}
            >
              확인 이메일 재발송
            </Button>
          )}
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sm text-muted-foreground hover:underline"
          >
            계정이 없으신가요? 회원가입
          </button>
        </div>
      </CardContent>
    </Card>
  );
}