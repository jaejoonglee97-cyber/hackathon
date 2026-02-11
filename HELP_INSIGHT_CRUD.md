# ✅ Help/Insight CRUD 구현 완료

## 📋 구현 내용

### 1. API 라우트 ✅

#### Help 카드 API
- ✅ `POST /api/helps` - Help 카드 생성
- ✅ `PATCH /api/helps/[id]` - Help 카드 수정
- ✅ `DELETE /api/helps/[id]` - Help 카드 삭제 (soft delete)

#### Insight 카드 API
- ✅ `POST /api/insights` - Insight 카드 생성
- ✅ `PATCH /api/insights/[id]` - Insight 카드 수정
- ✅ `DELETE /api/insights/[id]` - Insight 카드 삭제 (soft delete)

### 2. 작성 페이지 ✅
- ✅ `/help/new` - Help 카드 작성
- ✅ `/insight/new` - Insight 카드 작성

### 3. 폼 컴포넌트 ✅
- ✅ `HelpForm.tsx` - Help 작성/수정 폼
- ✅ `InsightForm.tsx` - Insight 작성/수정 폼

### 4. 권한 체크 ✅
- ✅ `canEditCard()` - 팀 소유자 또는 스태프만 편집 가능
- ✅ Soft delete - 실제 삭제 대신 status 변경

---

## 🔧 생성된 파일

### API 라우트
```
app/api/helps/route.ts           # POST (생성)
app/api/helps/[id]/route.ts      # PATCH, DELETE (수정, 삭제)
app/api/insights/route.ts        # POST (생성)
app/api/insights/[id]/route.ts   # PATCH, DELETE (수정, 삭제)
```

### 페이지
```
app/help/new/page.tsx            # Help 작성 페이지
app/help/new/new.module.css      # 스타일
app/insight/new/page.tsx         # Insight 작성 페이지
app/insight/new/new.module.css   # 스타일
```

### 컴포넌트
```
app/components/HelpForm.tsx          # Help 폼
app/components/help-form.module.css  # Help 폼 스타일
app/components/InsightForm.tsx       # Insight 폼
app/components/insight-form.module.css # Insight 폼 스타일
```

---

## 📊 데이터 구조

### Help 카드
```typescript
{
  id: 'help_123...',
  team_id: 'team_456',
  type: 'needed' | 'offered',  // 도움 요청 / 제공
  title: '제목',
  description: '상세 설명',
  status: 'open' | 'closed' | 'deleted',
  created_at: '2026-02-06T...',
  updated_at: '2026-02-06T...'
}
```

### Insight 카드
```typescript
{
  id: 'insight_123...',
  team_id: 'team_456',
  content: '인사이트 내용',
  category: 'general' | 'customer' | 'technical' | 'process' | 'team' | 'deleted',
  created_at: '2026-02-06T...'
}
```

---

## 🎯 작동 흐름

### Help 카드 생성
```
1. GET /help/new
   ↓
2. getCurrentUser() - 로그인 확인
   ↓
3. team_members에서 user_id로 team_id 조회
   ↓
4. HelpForm 렌더링
   ↓
5. 사용자 입력 (type, title, description)
   ↓
6. POST /api/helps
   ├─ requireAuth() - 로그인 확인
   ├─ 필수 필드 검증
   └─ appendRow() - DB에 추가
   ↓
7. audit_events 기록
   ↓
8. 성공 → /helps로 리다이렉트
```

### Help 카드 수정
```
1. PATCH /api/helps/[id]
   ↓
2. requireAuth() - 로그인 확인
   ↓
3. getByColumnValue() - 카드 조회
   ↓
4. canEditCard(card.team_id) - 권한 확인
   ├─ isStaff() → true: 스태프는 모든 카드 편집 가능
   └─ isProjectOwner() → true: 팀 소유자만 자기 카드 편집
   ↓
5. updateRow() - DB 업데이트
   ↓
6. audit_events 기록
```

### Help 카드 삭제 (Soft Delete)
```
1. DELETE /api/helps/[id]
   ↓
2. 권한 확인 (위와 동일)
   ↓
3. 실제 삭제 대신: status = 'deleted'
   ↓
4. audit_events 기록
```

---

## 🧪 테스트 방법

### 1. Help 카드 생성 테스트
```bash
# 1) 작성 페이지 접속
브라우저: http://localhost:3001/help/new

# 2) 폼 입력
- 유형: 도움 요청 (Needed)
- 제목: Python 스크립트 도움 필요
- 설명: 엑셀 자동화 스크립트...

# 3) 저장하기 클릭

# 4) 시트 확인
# DATA_SHEET > help_cards: 새 행 추가됨
# DATA_SHEET > audit_events: create_help_card 기록됨
```

### 2. Insight 카드 생성 테스트
```bash
# 1) 작성 페이지 접속
브라우저: http://localhost:3001/insight/new

# 2) 폼 입력
- 카테고리: 고객 이해
- 인사이트: 노인분들이 모바일을 못 쓸 것이라...

# 3) 저장하기 클릭

# 4) 시트 확인
# DATA_SHEET > insight_cards: 새 행 추가됨
# DATA_SHEET > audit_events: create_insight_card 기록됨
```

### 3. 권한 테스트
```bash
# 1) 사용자 A로 로그인 → Help 카드 생성
# 2) 사용자 B로 로그인 → A의 카드 수정 시도

# API 호출:
PATCH /api/helps/{help_id}
{ "title": "수정 시도" }

# 예상 결과:
# → 403 Forbidden (권한 없음)
```

---

## 🎨 UI 특징

### Help 카드 폼
- 초록색 그라데이션 헤더
- 유형 선택: 🙏 도움 요청 / 🤝 도움 제공
- 제목 (최대 100자)
- 상세 설명 (개인정보 경고)

### Insight 카드 폼
- 보라색 그라데이션 헤더 + 특별한 인사이트 박스
- 카테고리: 일반/고객 이해/기술/프로세스/팀워크
- 긴 텍스트 영역 (최소 150px)

---

## 🔒 보안 기능

### 1. 권한 체크 (3단계)
1. JWT 토큰 검증 (로그인 확인)
2. 팀 소유자 확인 (team_members 테이블)
3. 스태프 확인 (admin/judge/mentor)

### 2. 필드 필터링
- **Help**: type, title, description, status만 업데이트 가능
- **Insight**: content, category만 업데이트 가능
- id, team_id, created_at는 수정 불가

### 3. Soft Delete
- 실제 삭제 대신 status/category 변경
- 복구 가능
- Audit trail 유지

### 4. Audit 기록
```
create_help_card
update_help_card
delete_help_card
create_insight_card
update_insight_card
delete_insight_card
```

---

## 📝 다음 작업

현재까지 완료:
1. ✅ DB 레이어 + JWT 인증
2. ✅ 개인전 규칙
3. ✅ 팀 편집 페이지
4. ✅ Help/Insight CRUD (생성/수정/삭제 API + 작성 페이지)

아직 남은 작업:
1. ⏭️ Help/Insight **목록 페이지** (`/helps`, `/insights`)
2. ⏭️ Help/Insight **수정 페이지** (`/help/[id]/edit`, `/insight/[id]/edit`)
3. ⏭️ 대시보드 업데이트 (내 프로젝트 표시, 점수/순위 제거)

---

## 💡 추가 개선 사항 (선택)

### 우선순위 낮음
1. 목록 페이지에서 필터링 (type, category, status)
2. 검색 기능
3. 페이지네이션
4. 카드 상세 페이지 개선

---

**현재 상태**: Help/Insight 기본 CRUD (생성/수정/삭제 API + 작성 페이지) 완성! 🎉

목록 페이지와 수정 페이지를 추가하면 완전한 CRUD가 완성됩니다.
