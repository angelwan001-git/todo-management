# Google OAuth 설정 가이드

이 문서는 Supabase Auth를 사용한 Google OAuth 소셜 로그인 설정 방법을 안내합니다.

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성 및 OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 좌측 메뉴에서 **"APIs & Services"** > **"Credentials"** 이동
4. **"Create Credentials"** 클릭 > **"OAuth 2.0 Client ID"** 선택

### 1.2 OAuth 동의 화면 설정 (첫 실행 시)

만약 OAuth 동의 화면을 설정하지 않았다면:

1. **"Configure Consent Screen"** 클릭
2. User Type: **"External"** 선택 (일반 사용자용)
3. 앱 정보 입력:
   - App name: 앱 이름 (예: "Todo App")
   - User support email: 지원 이메일
   - Developer contact email: 개발자 이메일
4. **"Save and Continue"** 클릭
5. Scopes 단계에서 기본값 유지하고 **"Save and Continue"**
6. Test users 단계는 선택사항 (개발 단계에서는 추가 권장)
7. **"Back to Dashboard"** 클릭

### 1.3 OAuth 2.0 Client ID 생성

1. **"Create Credentials"** > **"OAuth 2.0 Client ID"** 선택
2. Application type: **"Web application"** 선택
3. Name: 클라이언트 이름 입력 (예: "Todo Web Client")
4. **Authorized redirect URIs** 추가:
   ```
   https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback
   ```
   - `<YOUR_PROJECT_ID>`는 Supabase 프로젝트의 ID로 변경
   - Supabase Dashboard > Settings > API에서 확인 가능

5. **"Create"** 클릭
6. **Client ID**와 **Client Secret** 복사 (다음 단계에서 사용)

## 2. Supabase Dashboard 설정

### 2.1 Google Provider 활성화

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **"Authentication"** > **"Providers"** 이동
4. **"Google"** 찾기 및 클릭
5. **"Enable Google Provider"** 토글 활성화
6. Google Cloud Console에서 복사한 정보 입력:
   - **Client ID (for OAuth)**: 위에서 복사한 Client ID
   - **Client Secret (for OAuth)**: 위에서 복사한 Client Secret
7. **"Save"** 클릭

### 2.2 Redirect URL 확인

Supabase에서 제공하는 Callback URL을 확인:
```
https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback
```

이 URL이 Google Cloud Console의 Authorized redirect URIs에 추가되었는지 확인하세요.

## 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일이 이미 존재합니다. 기존 Supabase 환경 변수만 있으면 됩니다:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Google OAuth는 Supabase가 관리하므로 추가 환경 변수가 필요하지 않습니다.**

## 4. 로컬 개발 환경 테스트

### 4.1 개발 서버 실행

```bash
npm run dev
```

### 4.2 Google 로그인 테스트

1. http://localhost:3000 접속
2. 로그인 화면에서 **"Google로 로그인"** 버튼 클릭
3. Google 계정 선택 및 권한 동의
4. 로그인 성공 후 Todo 앱 메인 화면으로 리디렉션

### 4.3 문제 해결

**"Error 400: redirect_uri_mismatch"** 발생 시:
- Google Cloud Console에서 Authorized redirect URIs가 정확한지 확인
- Supabase 프로젝트 URL이 올바른지 확인

**로그인 후 리디렉션되지 않을 경우**:
- 브라우저 콘솔에서 에러 확인
- Supabase Dashboard > Authentication > Logs에서 로그 확인

## 5. 프로덕션 배포

### 5.1 Vercel 배포 시 추가 설정

프로덕션 도메인으로 배포 시:

1. Google Cloud Console의 Authorized redirect URIs에 프로덕션 URL 추가:
   ```
   https://your-domain.com/
   https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback
   ```

2. Supabase Dashboard의 Site URL 업데이트:
   - Authentication > URL Configuration > Site URL
   - 프로덕션 도메인으로 변경

### 5.2 환경 변수 확인

Vercel 프로젝트 설정에서 환경 변수가 올바르게 설정되었는지 확인:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 6. 구현된 기능

### 6.1 코드 변경 사항

- **`src/contexts/AuthContext.tsx`**: `signInWithGoogle()` 메서드 추가
- **`src/components/auth/LoginForm.tsx`**: Google 로그인 버튼 추가
- **`src/components/auth/SignUpForm.tsx`**: Google 회원가입 버튼 추가

### 6.2 사용자 플로우

1. 사용자가 "Google로 로그인" 버튼 클릭
2. Google OAuth 동의 화면으로 리디렉션
3. 사용자가 Google 계정 선택 및 권한 동의
4. Supabase가 인증 처리 및 세션 생성
5. 앱 메인 화면으로 리디렉션
6. `AuthContext`가 자동으로 사용자 세션 감지 및 상태 업데이트

### 6.3 보안 고려사항

- Supabase의 Row Level Security (RLS)가 자동으로 적용됨
- Google OAuth 사용자도 `auth.users` 테이블에 저장됨
- `user_id`가 자동으로 할당되어 기존 todos 테이블과 호환됨

## 7. FAQ

### Q: NextAuth.js 대신 Supabase Auth를 사용하는 이유는?

A: 기존 프로젝트가 이미 Supabase Auth를 사용하고 있어, 코드 변경을 최소화하면서 Google OAuth를 추가할 수 있습니다.

### Q: 다른 OAuth 제공자(Facebook, GitHub 등)도 추가할 수 있나요?

A: 네, Supabase는 다양한 OAuth 제공자를 지원합니다. Supabase Dashboard의 Authentication > Providers에서 활성화하면 됩니다.

### Q: 이메일/비밀번호 로그인과 Google 로그인을 동시에 사용할 수 있나요?

A: 네, 현재 구현은 두 가지 방법을 모두 지원합니다. 사용자는 원하는 방식으로 로그인할 수 있습니다.

### Q: Google로 가입한 사용자의 이메일을 확인해야 하나요?

A: Google OAuth를 통해 가입한 사용자는 이메일이 이미 Google에 의해 검증되었으므로 추가 이메일 확인이 필요하지 않습니다.

## 8. 참고 자료

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)



###  이메일, 비밀번호 입력하면 Users에 왜 저장이 안되고 다른 테이블에 저장 되는건가 알려줘 ? 

● Read(database\schema.sql)
  ⎿  Read 58 lines

● Search(pattern: "database/*.sql")
  ⎿  Found 5 files (ctrl+o to expand)

● 좋은 질문입니다! Supabase의 인증 구조에 대해 설명드리겠습니다.

  Supabase 인증 구조

  1. auth.users 테이블 (Supabase가 자동 관리)

  이메일/비밀번호로 회원가입하면 사용자 정보는 auth.users 테이블에 자동으로 저장됩니다. 이 테이블은:

  - Supabase가 자동으로 관리하는 시스템 테이블
  - auth 스키마에 위치 (별도 스키마)
  - 직접 접근하거나 수정할 수 없음 (보안상 이유)
  - Supabase Auth API를 통해서만 관리

  저장되는 정보:
  - id (UUID): 사용자 고유 ID
  - email: 이메일 주소
  - encrypted_password: 암호화된 비밀번호
  - email_confirmed_at: 이메일 확인 시간
  - created_at, updated_at: 타임스탬프
  - 기타 인증 관련 메타데이터

  2. public.todos 테이블 (개발자가 관리)

  Todo 데이터를 저장하는 테이블로, user_id로 auth.users 테이블과 연결됩니다:

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE

  이 코드는:
  - todos.user_id가 auth.users.id를 참조
  - 사용자가 삭제되면 해당 사용자의 todos도 자동 삭제 (CASCADE)

  3. 왜 별도 테이블에 저장되나요?

  보안과 역할 분리를 위해서입니다:

  1. 보안:
    - auth.users는 민감한 인증 정보 (비밀번호 해시 등)
    - 개발자가 직접 접근할 수 없어 보안 유지
  2. 역할 분리:
    - auth.*: Supabase가 인증/권한 관리
    - public.*: 개발자가 비즈니스 로직 관리
  3. 확장성:
    - 사용자 프로필 정보가 필요하면 public.profiles 테이블 생성
    - 예: 닉네임, 프로필 이미지, 설정 등

  실제 확인 방법

  Supabase Dashboard에서 확인할 수 있습니다:

  1. Authentication > Users 메뉴:
    - 회원가입한 사용자 목록 확인
    - 이메일, ID, 가입일 등 확인
  2. Table Editor > todos 테이블:
    - user_id 컬럼에서 어느 사용자의 todo인지 확인

  코드에서 사용자 정보 접근

  // 현재 로그인한 사용자 정보
  const { user } = useAuth();

  console.log(user?.id);    // auth.users의 id
  console.log(user?.email); // auth.users의 email

  AuthContext.tsx에서 supabase.auth.getSession()을 통해 auth.users 정보를 가져옵니다 (23-26번 줄).

  추가 사용자 정보가 필요하다면?

  닉네임, 프로필 이미지 등을 저장하려면 public.profiles 테이블을 만들면 됩니다:

  CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    nickname TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  정리하면, 이메일/비밀번호는 auth.users에 저장되고 있습니다! Supabase Dashboard의 Authentication > Users에서 확인할 수 있습니다.
