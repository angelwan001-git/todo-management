# 할일 관리 (Todo Management)

Next.js와 Supabase를 활용한 현대적이고 직관적인 할일 관리 애플리케이션입니다.

## 🚀 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (BaaS)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: Vercel

## ✨ 주요 기능

### 🔐 사용자 인증
- 이메일/비밀번호 기반 회원가입 및 로그인
- 이메일 인증 시스템
- 안전한 JWT 토큰 기반 세션 관리
- 비밀번호 강도 검증 (8자 이상, 대소문자/숫자/특수문자 포함)

### 📝 할일 관리
- ✅ 할일 생성, 조회, 수정, 삭제 (CRUD)
- ✅ 완료/미완료 상태 토글
- ✅ 실시간 편집 (인라인 편집)
- ✅ 필터링 (전체/활성/완료)
- ✅ 통계 표시 (활성/완료 할일 수)

### 🎨 사용자 인터페이스
- 깔끔하고 현대적인 디자인
- 반응형 UI (모바일/데스크톱 지원)
- 직관적인 사용자 경험
- 접근성 고려 설계

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론
\`\`\`bash
git clone <repository-url>
cd todo-management
\`\`\`

### 2. 의존성 설치
\`\`\`bash
npm install
\`\`\`

### 3. 환경 변수 설정
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

\`.env.local\` 파일에 Supabase 설정을 입력하세요:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 4. 데이터베이스 스키마 설정
1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. SQL Editor에서 \`database/schema.sql\` 내용을 실행

### 5. 개발 서버 실행
\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 📁 프로젝트 구조

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   └── globals.css        # 글로벌 스타일
├── components/            # React 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   ├── todos/            # 할일 관리 컴포넌트
│   └── ui/               # 재사용 UI 컴포넌트
├── contexts/             # React Context
│   └── AuthContext.tsx   # 인증 컨텍스트
├── lib/                  # 유틸리티 및 설정
│   ├── supabase.ts       # Supabase 클라이언트
│   └── utils.ts          # 유틸리티 함수
└── types/                # TypeScript 타입 정의
    └── database.types.ts # 데이터베이스 타입
\`\`\`

## 🗄️ 데이터베이스 스키마

### todos 테이블
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | 기본키 (자동 생성) |
| title | TEXT | 할일 제목 |
| completed | BOOLEAN | 완료 상태 |
| created_at | TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | 수정 시간 |
| user_id | UUID | 사용자 ID (외래키) |

### 보안 설정
- Row Level Security (RLS) 활성화
- 사용자는 자신의 할일만 접근 가능
- 인증된 사용자만 CRUD 작업 허용

## 🚀 배포

### Vercel 배포
1. [Vercel](https://vercel.com)에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포 확인

### 환경 변수 (Production)
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## 🧪 개발 스크립트

\`\`\`bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run start     # 프로덕션 서버 실행
npm run lint      # ESLint 검사
\`\`\`

## 📋 TODO

- [ ] 다크 모드 지원
- [ ] 할일 우선순위 기능
- [ ] 할일 카테고리/태그 기능
- [ ] 마감일 설정 기능
- [ ] 검색 기능
- [ ] 데이터 내보내기/가져오기
- [ ] PWA 지원

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.