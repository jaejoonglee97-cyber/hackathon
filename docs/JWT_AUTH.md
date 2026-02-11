# JWT 인증 사용 가이드

## 📚 개요

`lib/auth.ts`는 JWT(JSON Web Token) 기반 인증을 제공합니다.

### iron-session에서 JWT로 변경한 이유
1. **서버 컴포넌트 친화적**: Next.js 13+ App Router에서 더 쉽게 사용
2. **Stateless**: 서버에 세션 저장소 불필요
3. **확장성**: 마이크로서비스 아키텍처에 유리

---

## 🔐 주요 기능

### 1. 토큰 생성 및 검증
```typescript
import { generateToken, verifyToken } from '@/lib/auth';

// 토큰 생성
const token = generateToken('user_123', 'hong@example.com', 'participant', '홍길동');

// 토큰 검증
const payload = verifyToken(token);
if (payload) {
  console.log(payload.userId, payload.email, payload.role);
}
```

### 2. 서버 컴포넌트에서 사용
```typescript
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }
  
  return <div>안녕하세요, {user.email}님!</div>;
}
```

### 3. API 라우트에서 사용
```typescript
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const user = await requireAuth(); // 인증 필수
    
    // user.userId, user.email, user.role 사용 가능
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

### 4. 권한 체크
```typescript
import { hasRole, isAdmin } from '@/lib/auth';

// 특정 역할 확인
if (await hasRole('admin')) {
  console.log('관리자입니다');
}

// 여러 역할 중 하나
if (await hasRole(['admin', 'judge', 'mentor'])) {
  console.log('스태프입니다');
}

// 관리자 확인
if (await isAdmin()) {
  console.log('관리자 또는 심사위원입니다');
}
```

---

## 🛠️ API 엔드포인트

### 1. 로그인: `POST /api/auth/signin`

**요청**:
```json
{
  "email": "hong@example.com",
  "password": "password123"
}
```

**응답 (성공)**:
```json
{
  "success": true,
  "message": "로그인 되었습니다.",
  "user": {
    "id": "user_123",
    "email": "hong@example.com",
    "role": "participant"
  }
}
```

**응답 (실패 - 5회)**:
```json
{
  "error": "로그인 실패 횟수 초과. 30분 후 다시 시도해주세요."
}
```

**쿠키 설정**:
- 이름: `auth_token`
- 속성: `httpOnly`, `secure` (프로덕션), `sameSite=lax`
- 유효기간: 7일

---

### 2. 로그아웃: `POST /api/auth/signout`

**요청**: Body 없음

**응답**:
```json
{
  "success": true,
  "message": "로그아웃 되었습니다."
}
```

---

### 3. 현재 사용자: `GET /api/auth/me`

**요청**: 헤더에 쿠키 자동 포함

**응답 (인증됨)**:
```json
{
  "user": {
    "id": "user_123",
    "email": "hong@example.com",
    "role": "participant",
    "name": "홍길동"
  }
}
```

**응답 (미인증)**:
```json
{
  "error": "로그인이 필요합니다."
}
```

---

## 🔒 보안 기능

### 1. 로그인 실패 잠금
- 5회 연속 실패 시 30분 잠금
- `users_auth.failed_count`, `users_auth.locked_until` 컬럼으로 관리
- audit_events에 자동 기록

### 2. JWT 보안
- **httpOnly 쿠키**: XSS 공격 방지 (JavaScript에서 접근 불가)
- **secure 플래그**: HTTPS에서만 전송 (프로덕션)
- **sameSite=lax**: CSRF 공격 방지
- **만료 시간**: 7일 (필요 시 갱신)

### 3. 환경변수 보호
```env
JWT_SECRET=your-64-char-random-secret
```

**생성 방법**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**주의**: 프로덕션에서는 절대 기본값 사용 금지!

---

## 📖 실전 예시

### 예시 1: 프로젝트 편집 권한 체크

```typescript
// app/teams/[id]/edit/page.tsx
import { getCurrentUser } from '@/lib/auth';
import { getByColumnValue, SHEET_RANGES } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function EditTeamPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  // 팀 멤버 확인
  const teamMembers = await getByColumnValue('data', SHEET_RANGES.TEAM_MEMBERS, 'team_id', params.id);
  const isMember = teamMembers?.user_id === user.userId;

  if (!isMember) {
    return <div>권한이 없습니다.</div>;
  }

  return <EditForm teamId={params.id} userId={user.userId} />;
}
```

### 예시 2: API에서 본인 확인

```typescript
// app/api/teams/[id]/route.ts
import { requireAuth } from '@/lib/auth';
import { updateRow, SHEET_RANGES } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // 권한 체크 로직...
    
    await updateRow('data', SHEET_RANGES.PROJECTS, 'team_id', params.id, body, {
      userId: user.userId,
      action: 'update_project',
      details: `Updated fields: ${Object.keys(body).join(', ')}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 예시 3: 클라이언트 컴포넌트에서 사용

```typescript
// app/components/UserProfile.tsx
'use client';

import { useEffect, useState } from 'react';

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (!user) return <div>로그인이 필요합니다.</div>;

  return (
    <div>
      <p>이메일: {user.email}</p>
      <p>역할: {user.role}</p>
    </div>
  );
}
```

---

## 🧪 테스트 방법

### 1. 로그인 테스트

```bash
# 회원가입
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "테스터",
    "phone": "010-1234-5678",
    "org": "테스트기관",
    "birthdate": "1990",
    "privacyConsent": true,
    "termsConsent": true
  }'

# 로그인
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt

# 현재 사용자 확인
curl -X GET http://localhost:3001/api/auth/me \
  -b cookies.txt

# 로그아웃
curl -X POST http://localhost:3001/api/auth/signout \
  -b cookies.txt
```

### 2. 브라우저 개발자 도구

1. Application > Cookies 확인
2. `auth_token` 쿠키 확인
3. https://jwt.io 에서 토큰 디코딩 (검증은 안 됨)

### 3. 로그인 실패 테스트

1. 잘못된 비밀번호로 5번 로그인
2. AUTH_SHEET > `users_auth` 확인:
   - `failed_count`: 5
   - `locked_until`: 30분 후
3. DATA_SHEET > `audit_events` 확인:
   - `login_failed` 기록 5건

---

## ⚠️ 주의사항

### 1. JWT_SECRET 관리
- ✅ 환경변수로만 관리
- ✅ Git에 커밋 금지
- ✅ 프로덕션과 개발 환경 분리
- ✅ 정기적으로 변경 (권장)

### 2. 토큰 만료
- 현재: 7일 고정
- 갱신: `refreshToken()` 함수 사용 (구현 필요 시)

### 3. 쿠키 도메인
- 로컬: `localhost`
- 프로덕션: 자동으로 도메인 감지
- 서브도메인: `domain` 옵션 추가 필요

---

## 🚀 다음 단계

1. ✅ JWT 인증 완성
2. ⏭️ 개인전 규칙 적용 (회원가입 시 기본 프로젝트 생성)
3. ⏭️ 권한 체크 미들웨어 (`lib/permissions.ts`)
4. ⏭️ 토큰 자동 갱신 (선택)

---

**완료!** JWT 기반 인증이 구현되었습니다. 서버 컴포넌트, API 라우트, 클라이언트 컴포넌트 모두에서 사용 가능합니다.
