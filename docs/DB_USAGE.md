# Google Sheets DB 레이어 사용 가이드

## 📚 개요

`lib/db.ts`는 Google Sheets를 데이터베이스처럼 사용하기 위한 레이어입니다.

### 주요 기능
1. **AUTH_SHEET_ID / DATA_SHEET_ID 분리**: 인증 정보와 비즈니스 데이터 물리적 분리
2. **A1 range 표기법**: `users_auth!A:I` 형식으로 명확한 범위 지정
3. **CRUD 구현**: get / append / update 기본 작업
4. **audit_events 자동 기록**: 모든 쓰기 작업 추적

---

## 🔧 설치 및 설정

### 1. 환경변수 설정

`.env.local`:
```env
AUTH_SHEET_ID=1SnoNCVDUa2APj-GO7iVfjc-2lvGFxc8v-wvJBVuDJ70
DATA_SHEET_ID=1FlsIvChf3E9RsWhizFkz3QCvri1uunonTfYbl4UU9sM
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@...iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 2. 시트 헤더 설정

#### DATA_SHEET 필수: `audit_events` 탭

A1:G1에 다음 헤더 입력:
```
id	user_id	action	table_name	record_id	details	timestamp
```

---

## 📖 API 레퍼런스

### 1. `getByColumnValue()`
특정 컬럼 값으로 행 찾기

```typescript
import { getByColumnValue, SHEET_RANGES } from '@/lib/db';

// 예시: 이메일로 사용자 찾기
const user = await getByColumnValue(
  'auth', // sheetType: 'auth' | 'data'
  SHEET_RANGES.USERS_AUTH, // range: 'users_auth!A:I'
  'email', // columnName
  'hong@example.com' // value
);

if (user) {
  console.log(user.user_id, user.role);
}
```

**반환값**: 
- 찾으면: `{ user_id: 'user_123', email: 'hong@example.com', ... }`
- 못 찾으면: `null`

---

### 2. `getAll()`
전체 행 조회

```typescript
import { getAll, SHEET_RANGES } from '@/lib/db';

// 예시: 모든 팀 조회
const teams = await getAll('data', SHEET_RANGES.TEAMS);

teams.forEach(team => {
  console.log(team.name, team.stage);
});
```

**반환값**: `Array<any>`

---

### 3. `appendRow()`
새 행 추가 (audit 자동 기록)

```typescript
import { appendRow, SHEET_RANGES } from '@/lib/db';

// 예시: 새 팀 생성
const teamId = 'team_' + Date.now();
const now = new Date().toISOString();

await appendRow(
  'data', // sheetType
  SHEET_RANGES.TEAMS, // range
  [
    teamId,              // id
    '새 팀',             // name
    '서울시복지재단',    // org
    '["user_123"]',      // member_ids (JSON string)
    'intro',             // stage
    now,                 // created_at
    now,                 // updated_at
  ],
  {
    // audit 정보 (선택)
    userId: 'user_123',
    action: 'create_team',
    details: 'Created via signup'
  }
);
```

**주의사항**:
- 값의 순서는 시트 헤더 순서와 정확히 일치해야 함
- audit 정보를 제공하면 `audit_events`에 자동 기록됨

---

### 4. `updateRow()`
기존 행 업데이트 (audit 자동 기록)

```typescript
import { updateRow, SHEET_RANGES } from '@/lib/db';

// 예시: 사용자 인증 정보 업데이트 (로그인 실패 횟수)
await updateRow(
  'auth', // sheetType
  SHEET_RANGES.USERS_AUTH, // range
  'email', // columnName (검색 기준 컬럼)
  'hong@example.com', // value (검색 값)
  {
    // 업데이트할 컬럼들
    failed_count: 5,
    locked_until: '2026-02-06T17:30:00Z',
  },
  {
    // audit 정보 (선택)
    userId: 'system',
    action: 'update_failed_count',
    details: 'Login failed 5 times'
  }
);
```

**주의사항**:
- `updated_at` 컬럼이 있으면 자동으로 현재 시간으로 갱신됨
- 검색 컬럼(columnName)과 값(value)으로 행을 찾음
- 못 찾으면 에러 발생

---

## 🎯 실전 예시

### 예시 1: 회원가입 시 사용자 생성

```typescript
import { appendRow, SHEET_RANGES } from '@/lib/db';
import { hashPassword } from '@/lib/bcrypt';

async function createUser(email: string, password: string, name: string) {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  // 1) AUTH_SHEET: 인증 정보
  await appendRow('auth', SHEET_RANGES.USERS_AUTH, [
    userId,
    email,
    passwordHash,
    'participant',  // role
    'active',       // status
    '0',            // failed_count
    '',             // locked_until
    now,            // created_at
    now,            // updated_at
  ], {
    userId,
    action: 'create_user_auth',
  });

  // 2) DATA_SHEET: 개인정보
  await appendRow('data', SHEET_RANGES.USERS_PROFILE, [
    userId,
    name,
    '', // phone (나중에 입력)
    '', // org
    '', // birthdate
    'v1.0', // consent_version
    now,    // consented_at
  ], {
    userId,
    action: 'create_user_profile',
  });

  return userId;
}
```

### 예시 2: 로그인 실패 처리

```typescript
import { getUserAuth, updateRow, SHEET_RANGES } from '@/lib/db';

async function handleLoginFailure(email: string) {
  const user = await getUserAuth(email);
  if (!user) return;

  const failedCount = parseInt(user.failed_count || '0') + 1;
  let lockedUntil = '';

  if (failedCount >= 5) {
    lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  }

  await updateRow('auth', SHEET_RANGES.USERS_AUTH, 'email', email, {
    failed_count: failedCount,
    locked_until: lockedUntil,
  }, {
    userId: user.user_id,
    action: 'login_failed',
    details: `Failed count: ${failedCount}`,
  });
}
```

### 예시 3: 프로젝트 업데이트

```typescript
import { updateRow, SHEET_RANGES } from '@/lib/db';

async function updateProject(teamId: string, userId: string, updates: any) {
  await updateRow('data', SHEET_RANGES.PROJECTS, 'team_id', teamId, updates, {
    userId,
    action: 'update_project',
    details: `Updated: ${Object.keys(updates).join(', ')}`,
  });
}

// 사용
await updateProject('team_123', 'user_456', {
  problem_statement: '새로운 문제 정의',
  solution: '개선된 솔루션',
});
```

---

## 🧪 테스트 방법

### 1. 개발 모드 테스트 (환경변수 없이)

환경변수가 설정되지 않으면 자동으로 샘플 데이터를 사용합니다.

```typescript
import { IS_DEV_MODE, getAll, appendRow, SHEET_RANGES } from '@/lib/db';

console.log('Dev Mode:', IS_DEV_MODE); // true

// 샘플 데이터 조회
const teams = await getAll('data', SHEET_RANGES.TEAMS);
console.log(teams); // [{ id: '1', name: '케어링크', ... }]

// 추가 (콘솔에만 출력됨)
await appendRow('data', SHEET_RANGES.TEAMS, [
  '2', '테스트팀', '테스트기관', '[]', 'intro', '...', '...'
]);
```

### 2. 실제 시트 테스트

#### 2-1. 환경변수 설정 확인

```bash
# PowerShell
$env:AUTH_SHEET_ID
$env:DATA_SHEET_ID
```

#### 2-2. API Route에서 테스트

`app/api/test-db/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getAll, appendRow, SHEET_RANGES, IS_DEV_MODE } from '@/lib/db';

export async function GET() {
  try {
    // 설정 조회
    const configs = await getAll('data', SHEET_RANGES.CONFIG);
    
    return NextResponse.json({
      devMode: IS_DEV_MODE,
      configs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    // 테스트 audit 기록
    await appendRow('data', SHEET_RANGES.AUDIT_EVENTS, [
      `test_${Date.now()}`,
      'test_user',
      'test_action',
      'test_table',
      'test_record',
      'This is a test',
      new Date().toISOString(),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

브라우저에서:
- GET: `http://localhost:3001/api/test-db`
- POST: (Postman 등으로 테스트)

#### 2-3. 시트 확인

DATA_SHEET > `audit_events` 탭에서 새 행이 추가되었는지 확인

---

## ⚠️ 주의사항

### 1. 트랜잭션 없음
Google Sheets API는 트랜잭션을 지원하지 않습니다. 여러 시트에 동시에 쓰는 경우 일부만 성공할 수 있습니다.

**해결책**: 중요한 작업은 try-catch로 감싸고, 실패 시 롤백 로직 구현

### 2. 동시성 문제
여러 사용자가 동시에 같은 행을 수정하면 마지막 쓰기가 승리합니다.

**해결책**: 낙관적 잠금(optimistic locking) 패턴 사용 (updated_at 비교)

### 3. 성능 제한
- 읽기/쓰기 할당량: 분당 100회 (Google Sheets API 제한)
- 대량 작업은 `batchUpdate` 사용 권장

### 4. audit_events 실패
audit 기록 실패는 치명적이지 않으므로 에러를 던지지 않고 콘솔에만 기록합니다.

---

## 📝 다음 단계

1. ✅ DB 레이어 완성
2. ⏭️ JWT 인증 구현 (`lib/auth.ts`)
3. ⏭️ 회원가입/로그인 API 업데이트
4. ⏭️ 개인전 규칙 적용

---

**완료!** `lib/db.ts`를 사용하여 Google Sheets를 DB처럼 사용할 수 있습니다.
