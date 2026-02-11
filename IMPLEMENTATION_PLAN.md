# 🚀 전체 구현 플랜 및 배포 가이드

## 📋 요구사항 체크리스트

### ✅ 완료된 항목

- [x] Google Sheets DB 레이어 (`lib/db.ts`)
  - [x] AUTH_SHEET_ID / DATA_SHEET_ID 분리
  - [x] A1 range 표기법
  - [x] getByColumnValue, appendRow, updateRow 공통 유틸
  - [x] audit_events 자동 기록
- [x] 환경변수 분리 (`.env.example`)
- [x] 스프레드시트 스키마 문서 (`docs/SHEET_SCHEMA.md`)

### 🔄 진행 중 / 필요한 작업

#### 1. JWT 세션으로 변경 ⚠️
**현재**: iron-session 사용 중  
**변경 필요**: `lib/auth.ts`에 JWT 유틸 생성
```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken';

export function generateToken(userId: string, email: string, role: string) {
  return jwt.sign({ userId, email, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!);
}
```

**필요 패키지**:
```bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

#### 2. 회원가입/로그인 완성
**현재 상태**: 기본 구조 완료  
**추가 필요**:
- [ ] JWT 토큰 발급 로직
- [ ] CONSENT_VERSION 저장 (users_profile)
- [ ] 테스트 절차 문서화

#### 3. 개인전 규칙 적용
**필요 작업**:
- [ ] 회원가입 시 기본 team + project 자동 생성
- [ ] team_members에 owner 1명만 등록
- [ ] UI 라벨 "팀" → "내 프로젝트"로 변경

#### 4. /teams/[id] 편집 페이지
**필요 작업**:
- [ ] 편집 모드 UI
- [ ] 세션 user_id로 권한 체크
- [ ] config_deadlines 기반 잠금 처리
- [ ] 저장 시 updated_at + audit_events 기록

#### 5. Help/Insight CRUD
**필요 작업**:
- [ ] `/helps` 목록 페이지
- [ ] `/help/new` 작성 페이지
- [ ] `/insights` 목록 페이지
- [ ] `/insight/new` 작성 페이지
- [ ] 본인 프로젝트만 수정 가능하도록 권한 체크

#### 6. 대시보드 업데이트
**필요 작업**:
- [ ] 점수/순위 제거
- [ ] Help/Insight 카운트만 노출

---

## 🛠️ 단계별 구현 가이드

### Step 1: JWT 세션 적용

#### 1-1. 패키지 설치
```bash
npm install jsonwebtoken cookie
npm install -D @types/jsonwebtoken @types/cookie
```

#### 1-2. `lib/auth.ts` 생성
```typescript
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const COOKIE_NAME = 'auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
```

#### 1-3. 로그인 API 수정
`app/api/auth/signin/route.ts`:
```typescript
import { generateToken, setAuthCookie } from '@/lib/auth';

// 로그인 성공 시
const token = generateToken(user.user_id, user.email, user.role);
setAuthCookie(token);

return NextResponse.json({ success: true, token });
```

#### 1-4. 서버 컴포넌트에서 사용
```typescript
import { getCurrentUser } from '@/lib/auth';

export default async function TeamPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/auth/signin');
  }
  
  // currentUser.userId로 권한 체크
}
```

---

### Step 2: 개인전 규칙 적용

#### 2-1. 회원가입 시 기본 프로젝트 생성
`app/api/auth/signup/route.ts` 수정:
```typescript
import { appendRow } from '@/lib/db';

// 1) users_auth, users_profile 생성 (기존 코드)

// 2) 기본 team 생성
const teamId = `team_${userId}`;
await appendRow('data', SHEET_RANGES.TEAMS, [
  teamId,
  `${name}의 프로젝트`, // team name
  org,
  JSON.stringify([userId]), // member_ids
  'intro', // stage
  now, // created_at
  now, // updated_at
], { userId, action: 'create_team', details: 'Auto-created on signup' });

// 3) team_members 추가 (owner)
await appendRow('data', SHEET_RANGES.TEAM_MEMBERS, [
  `member_${Date.now()}`,
  teamId,
  userId,
  'owner', // role
  now, // joined_at
  now, // updated_at
], { userId, action: 'add_team_member' });

// 4) 기본 project 생성
await appendRow('data', SHEET_RANGES.PROJECTS, [
  teamId, // team_id
  '', // problem_statement (빈 값)
  '', // target_audience
  '', // situation
  '', '', '', // evidence1~3
  '', '', // hypothesis1~2
  '', '', // solution, features
  '', '', // prototype_link, github_link
  '', '', '', // experiment_log, wrong_assumption, next_test
  '', // adoption_checklist
  now, // updated_at
], { userId, action: 'create_project', details: 'Auto-created on signup' });
```

#### 2-2. UI 라벨 변경
- `app/page.tsx`: "팀" → "내 프로젝트"
- `app/components/TeamCard.tsx`: 동일하게 변경

---

### Step 3: /teams/[id] 편집 페이지

#### 3-1. 권한 체크 미들웨어
`lib/permissions.ts`:
```typescript
import { getCurrentUser } from './auth';
import { getByColumnValue, SHEET_RANGES } from './db';

export async function canEditProject(teamId: string): Promise<boolean> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return false;

  const member = await getByColumnValue(
    'data',
    SHEET_RANGES.TEAM_MEMBERS,
    'user_id',
    currentUser.userId
  );

  return member?.team_id === teamId && member?.role === 'owner';
}
```

#### 3-2. 편집 폼 컴포넌트
`app/teams/[id]/edit/page.tsx` 생성 (Server Component + Client Component 분리)

---

### Step 4: Help/Insight CRUD

#### 4-1. 목록 페이지
- `/app/helps/page.tsx`: 전체 Help 목록
- `/app/insights/page.tsx`: 전체 Insight 목록

#### 4-2. 작성 페이지
- `/app/help/new/page.tsx`
- `/app/insight/new/page.tsx`

---

## 🌐 Vercel 배포 가이드

### 1. 환경변수 설정

#### 로컬 (`.env.local`)
```env
# Google Sheets
AUTH_SHEET_ID=1SnoNCVDUa2APj-GO7iVfjc-2lvGFxc8v-wvJBVuDJ70
DATA_SHEET_ID=1FlsIvChf3E9RsWhizFkz3QCvri1uunonTfYbl4UU9sM
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@...iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# JWT
JWT_SECRET=your-random-64-char-secret-here

# 앱 URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Vercel 환경변수
1. Vercel Dashboard → 프로젝트 → Settings → Environment Variables
2. 위 모든 변수를 **Production, Preview, Development** 모두에 추가
3. `GOOGLE_PRIVATE_KEY`는 줄바꿈(`\n`)이 포함되어 있으므로 그대로 복사

### 2. 로컬 실행 체크리스트

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 확인
cat .env.local  # Windows: type .env.local

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 확인
# http://localhost:3000
```

### 3. 빌드 체크리스트

```bash
# 1. 프로덕션 빌드
npm run build

# 2. 에러 확인
# - TypeScript 에러
# - 빌드 에러
# - 환경변수 누락 경고

# 3. 로컬 프로덕션 실행
npm run start
```

### 4. 라우트 점검

| 라우트 | 확인 항목 |
|--------|----------|
| `/` | 메인 대시보드 로딩 |
| `/auth/signup` | 회원가입 폼 |
| `/auth/signin` | 로그인 폼 |
| `/teams/1` | 프로젝트 상세 (샘플 데이터) |
| `/help/help_001` | Help 상세 |
| `/insight/insight_001` | Insight 상세 |

### 5. Vercel 배포

```bash
# Vercel CLI 설치 (선택)
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

또는 GitHub 연동:
1. GitHub에 푸시
2. Vercel에서 Import
3. 환경변수 설정
4. Deploy

### 6. 배포 후 확인

- [ ] 모든 페이지 로딩되는지 확인
- [ ] 회원가입/로그인 동작 확인
- [ ] Google Sheets 쓰기 권한 확인
- [ ] audit_events 기록 확인

---

## 🔒 보안 체크리스트

### 배포 전
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `JWT_SECRET`이 충분히 복잡한지 확인 (64자 이상 권장)
- [ ] `GOOGLE_PRIVATE_KEY`가 Git에 커밋되지 않았는지 확인

### 배포 후
- [ ] HTTPS 활성화 확인
- [ ] 쿠키가 `httpOnly`, `secure` 설정되었는지 확인
- [ ] CSP 헤더 추가 고려

---

## 📝 추가 구현 TODO

우선순위가 높은 순서:

1. **JWT 세션 적용** (현재 iron-session 사용 중)
2. **개인전 규칙** (회원가입 시 기본 프로젝트 생성)
3. **/teams/[id] 편집 기능**
4. **Help/Insight CRUD**
5. **대시보드 점수/순위 제거**

각 항목별 상세 구현은 위의 가이드를 참고하세요.

---

## 🆘 문제 해결

### "MODULE_NOT_FOUND: jsonwebtoken"
```bash
npm install jsonwebtoken
```

### Vercel 빌드 실패
1. `next.config.js`에서 `output: 'standalone'` 제거
2. TypeScript 에러 모두 수정
3. 환경변수 설정 확인

### Google Sheets 권한 에러
1. 서비스 계정 이메일 확인
2. 두 스프레드시트 모두 편집자 권한 부여 확인
3. Google Sheets API 활성화 확인

---

**현재 상태**: 기본 구조는 완료, JWT/개인전/CRUD 기능은 위 가이드를 참고하여 구현 필요
