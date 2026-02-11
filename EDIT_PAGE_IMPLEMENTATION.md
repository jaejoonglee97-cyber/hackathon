# ✅ 팀 편집 페이지 구현 완료

## 📋 구현 내용

### 1. API 라우트 ✅
**`PATCH /api/teams/[id]`**
- 로그인 확인 (`requireAuth`)
- 권한 확인 (`canEditProject`) - 소유자 + 마감일 체크
- 허용된 필드만 업데이트 (16개 필드)
- audit_events 자동 기록

### 2. 편집 페이지 ✅
**`/teams/[id]/edit`**
- 서버 컴포넌트: 권한 체크, Hard lock 리다이렉트
- 클라이언트 컴포넌트: 폼 입력, 상태 관리, API 호출
- 마감일 경고 배너 (Soft lock)
- 성공 시 자동으로 상세 페이지로 이동

### 3. 폼 필드 ✅
모든 프로젝트 필드를 편집 가능:
- **Why**: problem_statement, target_audience, situation, evidence1-3
- **가설**: hypothesis1-2
- **해결**: solution, features
- **프로토타입**: prototype_link, github_link
- **검증**: experiment_log, wrong_assumption, next_test
- **확산**: adoption_checklist

---

## 🔧 생성된 파일

### 1. `app/api/teams/[id]/route.ts`
```typescript
export async function PATCH(request, { params }) {
  const user = await requireAuth();
  const permission = await canEditProject(params.id);
  
  if (!permission.canEdit) {
    return 403 Forbidden;
  }
  
  await updateRow('data', SHEET_RANGES.PROJECTS, 'team_id', params.id, updates, {
    userId: user.userId,
    action: 'update_project',
    details: 'Updated fields: ...',
  });
}
```

### 2. `app/teams/[id]/edit/page.tsx` (서버 컴포넌트)
```typescript
export default async function TeamEditPage({ params }) {
  const currentUser = await getCurrentUser();
  const data = await getMyProject(params.id);
  
  // Hard lock이면 리다이렉트
  if (!data.canEdit && data.lockType === 'hard') {
    redirect(`/teams/${params.id}`);
  }
  
  return <ProjectEditForm ... />;
}
```

### 3. `app/teams/[id]/edit/ProjectEditForm.tsx` (클라이언트)
```typescript
'use client';

export default function ProjectEditForm({ teamId, project }) {
  const [formData, setFormData] = useState({ ... });
  
  const handleSubmit = async (e) => {
    const response = await fetch(`/api/teams/${teamId}`, {
      method: 'PATCH',
      body: JSON.stringify(formData),
    });
    
    // 성공 시 상세 페이지로 이동
    router.push(`/teams/${teamId}`);
  };
}
```

### 4. CSS
- `edit.module.css`: 페이지 레이아웃
- `edit-form.module.css`: 폼 스타일

---

## 🎯 작동 흐름

### 편집 페이지 접근
```
1. GET /teams/123/edit
   ↓
2. getCurrentUser() - 로그인 확인
   ↓
3. getMyProject(123)
   ├─ isProjectOwner() - 소유자 확인
   ├─ canEditProject() - 편집 가능 여부
   └─ 데이터 로드
   ↓
4. Hard lock이면 → redirect('/teams/123')
   Soft lock이면 → 경고 배너 + 폼 표시
   정상이면 → 폼 표시
```

### 프로젝트 저장
```
1. 폼 제출 (클라이언트)
   ↓
2. PATCH /api/teams/123
   ├─ requireAuth() - 로그인 확인
   ├─ canEditProject() - 권한 확인
   ├─ 허용 필드 필터링
   └─ updateRow() - DB 업데이트
   ↓
3. audit_events 기록
   ├─ user_id
   ├─ action: 'update_project'
   └─ details: 'Updated fields: problem_statement, solution'
   ↓
4. 성공 응답
   ↓
5. 클라이언트: 2초 후 /teams/123으로 이동
```

---

## 🧪 테스트 방법

### 1. 기본 편집 테스트
```bash
# 1) 로그인
POST /api/auth/signin
{ "email": "test@example.com", "password": "..." }

# 2) 편집 페이지 접속
브라우저: http://localhost:3001/teams/{team_id}/edit

# 3) 필드 입력 후 저장
# → 성공 배너 표시
# → 2초 후 /teams/{team_id}로 자동 이동

# 4) 시트 확인
# DATA_SHEET > projects: 업데이트된 값 확인
# DATA_SHEET > audit_events: update_project 기록 확인
```

### 2. 권한 테스트 (다른 사람 프로젝트)
```bash
# 1) 다른 사람 프로젝트 편집 시도
http://localhost:3001/teams/{other_team_id}/edit

# 2) 결과
# → 403 Forbidden 또는 상세 페이지로 리다이렉트
```

### 3. Hard Lock 테스트
```bash
# 1) DATA_SHEET > config에서 마감일 설정
deadlines: [{"stage":"intro","date":"2026-02-05T00:00:00Z","lockType":"hard"}]

# 2) 마감일 지난 후 편집 시도
http://localhost:3001/teams/{team_id}/edit

# 3) 결과
# → /teams/{team_id}로 리다이렉트 (편집 불가)
```

### 4. Soft Lock 테스트
```bash
# 1) lockType을 "soft"로 변경
deadlines: [{"stage":"intro","date":"2026-02-05T00:00:00Z","lockType":"soft"}]

# 2) 편집 페이지 접속
# → 노란색 경고 배너 표시
# → 편집은 가능
```

---

## 🎨 UI 특징

### 1. 개인정보 보호 강조
```
증거 섹션:
┌────────────────────────────────────────┐
│ 증거 (인터뷰/관찰/업무로그)            │
│ ⚠️ 개인정보(실명/연락처/사례식별정보) 금지 │
├────────────────────────────────────────┤
│ 증거 1: [텍스트 입력]                  │
│ 증거 2: [텍스트 입력]                  │
│ 증거 3: [텍스트 입력]                  │
└────────────────────────────────────────┘
```

### 2. Insight 강제 입력 강조
```
┌────────────────────────────────────────┐
│ 🎓 틀렸던 가정 1개 (Insight 강제)      │
├────────────────────────────────────────┤
│ [텍스트 입력]                          │
└────────────────────────────────────────┘
보라색 그라데이션 배경
```

### 3. 실시간 피드백
- **저장 중**: 버튼 비활성화, "저장 중..." 표시
- **성공**: 초록색 배너, 2초 후 자동 이동
- **실패**: 빨간색 에러 배너

---

## 📝 허용된 필드 (16개)

API에서 업데이트 가능한 필드:
```typescript
const allowedFields = [
  'problem_statement',     // 문제
  'target_audience',       // 대상
  'situation',             // 상황
  'evidence1',             // 증거 1
  'evidence2',             // 증거 2
  'evidence3',             // 증거 3
  'hypothesis1',           // 가설 1
  'hypothesis2',           // 가설 2
  'solution',              // 솔루션
  'features',              // 핵심 기능
  'prototype_link',        // 프로토타입 링크
  'github_link',           // GitHub 링크
  'experiment_log',        // 검증 로그
  'wrong_assumption',      // 틀렸던 가정
  'next_test',             // 다음 검증
  'adoption_checklist',    // 확산 체크리스트
];
```

**자동 업데이트되는 필드**:
- `updated_at`: DB에서 자동으로 현재 시간으로 설정

---

## 🔒 보안 기능

### 1. 권한 체크 (3단계)
1. JWT 토큰 검증 (로그인 확인)
2. 프로젝트 소유자 확인 (team_members 테이블)
3. 마감일 확인 (config 테이블)

### 2. 필드 필터링
- 클라이언트에서 보낸 모든 필드 중 허용된 필드만 처리
- `team_id`, `created_at` 등은 수정 불가

### 3. Audit 기록
모든 업데이트가 audit_events에 기록:
```
id: audit_123...
user_id: user_456
action: update_project
table_name: projects
record_id: team_789
details: Updated fields: problem_statement, solution, features
timestamp: 2026-02-06T17:15:00Z
```

---

## 📋 다음 작업

현재까지 완료:
1. ✅ Google Sheets DB 레이어
2. ✅ JWT 인증
3. ✅ 개인전 규칙 + 권한 체크
4. ✅ 팀 편집 페이지

다음 우선순위:
1. **Help/Insight CRUD** - 목록/작성/수정 페이지
2. **대시보드 업데이트** - 내 프로젝트 표시, 점수/순위 제거
3. **메인 페이지** - 로그인 후 내 프로젝트로 이동

---

**완료!** 🎉

팀 편집 페이지가 완성되었습니다. 마감일 전까지 자유롭게 프로젝트를 수정할 수 있으며, 모든 변경사항이 audit_events에 기록됩니다.
