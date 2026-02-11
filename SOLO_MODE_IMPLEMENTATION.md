# ✅ 개인전 규칙 구현 완료

## 📋 구현 내용

### 1. 회원가입 시 자동 생성 ✅
회원가입하면 자동으로:
1. **팀 생성**: `team_{userId}` 형식의 ID, 팀명은 "{이름}의 프로젝트"
2. **팀 멤버 등록**: `team_members`에 owner로 등록
3. **빈 프로젝트 생성**: 모든 필드가 빈 값인 템플릿 프로젝트

### 2. 소유자만 편집 가능 ✅
- `lib/permissions.ts`의 `isProjectOwner()` 함수로 확인
- `team_members` 테이블에서 `role='owner'` 확인

### 3. 마감일 기반 잠금 ✅
**Soft Lock** (경고만):
- 마감일이 지나도 편집 가능
- 노란색 경고 배너 표시
- "가급적 빨리 제출해주세요" 메시지

**Hard Lock** (완전 잠금):
- 마감일이 지나면 편집 불가
- 빨간색 에러 배너 표시
- 편집 버튼 비활성화

---

## 🔧 수정된 파일

### 1. `app/api/auth/signup/route.ts`
```typescript
// 회원가입 시 자동으로:
// 1) users_auth (AUTH_SHEET)
// 2) users_profile (DATA_SHEET)
// 3) teams (DATA_SHEET)
// 4) team_members (DATA_SHEET)
// 5) projects (DATA_SHEET) - 빈 템플릿
```

### 2. `lib/permissions.ts` (신규)
```typescript
// 권한 체크 함수들:
- isProjectOwner(teamId): 소유자 확인
- canEditProject(teamId): 편집 가능 여부 (소유자 + 마감일)
- isStaff(): 관리자/심사위원 확인
- canEditCard(cardOwnerId): Help/Insight 편집 가능
- isDeadlinePassed(stage): 마감일 지났는지
- getMyProject(teamId): 프로젝트 + 권한 정보 한 번에 조회
```

### 3. `app/teams/[id]/page.tsx`
- `getMyProject()` 사용하여 권한 + 데이터 한 번에 조회
- 편집 버튼 활성화/비활성화
- 마감일 경고/에러 배너 표시

### 4. `app/teams/[id]/team.module.css`
```css
.headerActions: 편집 버튼 영역
.editButton: 편집 가능 시
.editButtonDisabled: 편집 불가 시
.warningBanner: Soft lock 경고
.errorBanner: Hard lock 에러
```

---

## 📊 데이터 구조

### team_members 테이블
```
id	team_id	user_id	role	joined_at	updated_at
```

**개인전에서는**:
- 팀당 1명만 존재 (owner)
- `team_id = team_{user_id}` 형식

---

## 🧪 테스트 방법

### 1. 회원가입 테스트
```bash
# 1) 회원가입
POST /api/auth/signup
{
  "email": "test@example.com",
  "password": "password123",
  "name": "테스터",
  "phone": "010-1234-5678",
  "org": "테스트기관",
  "birthdate": "1990",
  "privacyConsent": true,
  "termsConsent": true
}

# 2) 시트 확인
# DATA_SHEET > teams: team_user_... 행 추가됨 ("테스터의 프로젝트")
# DATA_SHEET > team_members: owner 행 추가됨
# DATA_SHEET > projects: 빈 프로젝트 행 추가됨
# DATA_SHEET > audit_events: create_team, add_team_member, create_project 기록됨
```

### 2. 권한 체크 테스트
```bash
# 1) 로그인
POST /api/auth/signin
{ "email": "test@example.com", "password": "password123" }

# 2) 내 프로젝트 접속
GET /teams/{team_id}
# → "✏️ 편집하기" 버튼 표시됨

# 3) 다른 사람 프로젝트 접속 (권한 없음)
GET /teams/{other_team_id}
# → "🔒 편집 불가" 버튼 표시됨
```

### 3. 마감일 테스트

#### Soft Lock 테스트
```bash
# DATA_SHEET > config 탭에서 마감일 설정
deadlines: [{"stage":"intro","date":"2026-02-05T00:00:00Z","lockType":"soft"}]

# 마감일 지난 후 접속
GET /teams/{team_id}
# → 노란색 경고 배너: "마감일(2026. 2. 5.)이 지났습니다..."
# → 편집 버튼은 여전히 활성화
```

#### Hard Lock 테스트
```bash
# DATA_SHEET > config 탭
deadlines: [{"stage":"intro","date":"2026-02-05T00:00:00Z","lockType":"hard"}]

# 마감일 지난 후 접속
GET /teams/{team_id}
# → 빨간색 에러 배너: "마감일(2026. 2. 5.)이 지나 편집할 수 없습니다."
# → "🔒 편집 불가" 버튼으로 변경
```

---

## 🎯 DB 스키마 업데이트 필요

### team_members 탭 생성
DATA_SHEET에 `team_members` 탭을 생성하고 A1:F1에 헤더 입력:
```
id	team_id	user_id	role	joined_at	updated_at
```

---

## 🔄 작동 흐름

### 회원가입 플로우
```
1. POST /api/auth/signup 요청
   ↓
2. users_auth + users_profile 생성
   ↓
3. team 생성 (team_user_123...)
   ↓
4. team_members 추가 (role=owner)
   ↓
5. project 생성 (빈 템플릿)
   ↓
6. audit_events에 모든 작업 기록
   ↓
7. 성공 응답: { userId, teamId }
```

### 편집 권한 체크 플로우
```
1. GET /teams/{id} 접속
   ↓
2. getCurrentUser() - JWT에서 사용자 확인
   ↓
3. getMyProject(teamId)
   ├─ isProjectOwner() - owner 확인
   ├─ getDeadlines() - 마감일 조회
   └─ canEditProject() - 종합 판단
   ↓
4. 결과:
   ├─ canEdit: true → 편집 버튼 활성화
   ├─ soft lock → 경고 + 편집 가능
   └─ hard lock → 에러 + 편집 불가
```

---

## 📝 다음 단계

현재까지 완료:
1. ✅ Google Sheets DB 레이어
2. ✅ JWT 인증
3. ✅ 개인전 규칙 (자동 팀/프로젝트 생성)
4. ✅ 권한 체크 (소유자 + 마감일)

다음 우선순위:
1. **팀 편집 페이지** (`/teams/[id]/edit`) - 실제 수정 가능하게
2. **Help/Insight CRUD** - 목록/작성/수정 페이지
3. **대시보드** - 내 프로젝트 표시, 점수/순위 제거

---

## 📖 관련 문서

| 문서 | 설명 |
|------|------|
| `docs/DB_USAGE.md` | DB 레이어 사용법 |
| `docs/JWT_AUTH.md` | JWT 인증 사용법 |
| `IMPLEMENTATION_PLAN.md` | 전체 구현 플랜 |

---

**완료!** 🎉

개인전 규칙이 구현되었습니다. 회원가입하면 자동으로 팀과 프로젝트가 생성되며, 마감일 전까지 자유롭게 수정할 수 있습니다.
