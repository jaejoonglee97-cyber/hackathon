# 구글 스프레드시트 DB 구현 완료 요약

## ✅ 요청사항 완료 확인

### 1) 라우팅/페이지 ✅
- ✅ `/auth/signup` - 회원가입 (이름/휴대폰/소속/생년월일/이메일/비밀번호 + 동의 체크)
- ✅ `/auth/signin` - 이메일+비밀번호 로그인
- ✅ `/teams/[id]` - Why/가설/해결/프로토타입/검증로그 섹션
- ✅ `/help/[helpId]` - Help 상세 페이지
- ✅ `/insight/[insightId]` - Insight 상세 페이지

### 2) 데이터 ✅
- ✅ **AUTH_SHEET, DATA_SHEET 분리** (users / teams, projects, help_cards, insight_cards, feedbacks, config)
- ✅ **읽고/쓰는 모듈** (`lib/sheets.ts`)
  - `readSheet()` - 시트 전체 읽기
  - `appendToSheet()` - 행 추가
  - `findInSheet()` - 조건 검색
  - `updateSheetRow()` - 행 업데이트
  - `getConfig()` - 설정값 조회
  - `getDeadlines()` - 마감일 조회
  - `isLocked()` - 마감 잠금 확인
- ✅ **config_deadlines 읽기**
  - D-day 표시 (AnnouncementBanner 컴포넌트)
  - 마감 후 잠금 로직 (soft/hard) 구현

### 3) 보안(최소) ✅
- ✅ **비밀번호 해시 저장** (bcrypt, salt rounds 10)
- ✅ **로그인 실패 횟수/잠금** 구현
  - 5회 실패 시 30분 잠금
  - `failedAttempts`, `lockedUntil` 컬럼 사용
- ✅ **샘플 데이터는 실명/연락처/구체 사례 금지**
  - 모든 샘플은 가상의 정보만 사용
  - 문서에 개인정보 금지 명시

---

## 📂 생성된 파일 목록 (총 34개)

### 설정/문서
```
.env.example                          # 환경변수 예시
package.json                          # 의존성 추가 (googleapis, bcryptjs, iron-session)
README.md                             # 프로젝트 소개
docs/IMPLEMENTATION.md                # 전체 구현 완료 보고서
docs/SHEET_SCHEMA.md                  # 시트 스키마 명세
docs/PRD.md                           # 제품 요구사항 (기존)
docs/UX.md                            # UX 스펙 (기존)
docs/UI.md                            # UI 가이드 (기존)
```

### 라이브러리 (lib/)
```
lib/sheets.ts                         # 구글 시트 연동 모듈
lib/bcrypt.ts                         # 비밀번호 해싱
lib/session.ts                        # 세션 설정 (iron-session)
```

### API 라우트 (app/api/)
```
app/api/auth/signup/route.ts          # 회원가입 API
app/api/auth/signin/route.ts          # 로그인 API (실패/잠금 처리)
app/api/auth/signout/route.ts         # 로그아웃 API
app/api/auth/me/route.ts              # 현재 사용자 조회
```

### 인증 페이지 (app/auth/)
```
app/auth/signup/page.tsx               # 회원가입 페이지
app/auth/signup/signup.module.css      # 스타일
app/auth/signin/page.tsx               # 로그인 페이지
app/auth/signin/signin.module.css      # 스타일
```

### 팀/Help/Insight 페이지 (app/)
```
app/teams/[id]/page.tsx                # 팀 상세 (Why/가설/해결/검증로그)
app/teams/[id]/team.module.css         # 스타일
app/help/[helpId]/page.tsx             # Help 상세
app/help/[helpId]/help.module.css      # 스타일
app/insight/[insightId]/page.tsx       # Insight 상세
app/insight/[insightId]/insight.module.css # 스타일
```

### 기존 파일 (메인 대시보드)
```
app/page.tsx                           # 메인 대시보드
app/page.module.css
app/layout.tsx
app/globals.css
app/components/TeamCard.tsx            # 팀 카드
app/components/TeamCard.module.css
app/components/DashboardFilters.tsx    # 필터/정렬
app/components/DashboardFilters.module.css
app/components/SharedGoal.tsx          # 공동 목표
app/components/SharedGoal.module.css
app/components/AnnouncementBanner.tsx  # 공지/마감
app/components/AnnouncementBanner.module.css
```

---

## 🚀 로컬 실행 방법

### 1단계: 의존성 설치 (완료)
```bash
npm install
```

새로 추가된 패키지:
- `googleapis@^131.0.0` - 구글 시트 API
- `bcryptjs@^2.4.3` - 비밀번호 해싱
- `iron-session@^8.0.1` - 세션 관리
- `@types/bcryptjs@^2.4.6` - TypeScript 타입

### 2단계: 환경변수 설정

**`.env.local` 파일 생성** (`.env.example` 참고)

```env
# 구글 서비스 계정
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# 스프레드시트 ID (URL에서 복사)
SPREADSHEET_ID=your-spreadsheet-id

# 세션 암호화 키 (32자 이상 랜덤)
SESSION_SECRET=your-random-secret-key-min-32-chars

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 환경변수 획득 가이드

**구글 서비스 계정 생성**:
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성
3. "IAM 및 관리자" → "서비스 계정" → "서비스 계정 만들기"
4. JSON 키 다운로드
5. JSON 파일 열어서 `client_email`, `private_key` 복사

**스프레드시트 ID**:
- Google Sheets URL:
  ```
  https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
  ```

**SESSION_SECRET 생성**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3단계: 구글 스프레드시트 설정

**docs/SHEET_SCHEMA.md** 파일 참고하여 설정:

1. **새 Google Sheets 생성**
2. **7개 탭 생성 및 헤더 설정**:
   - `users` (12컬럼): id, email, passwordHash, name, phone, org, birthYear, role, failedAttempts, lockedUntil, createdAt, updatedAt
   - `teams` (7컬럼): id, name, org, memberIds, stage, createdAt, updatedAt
   - `projects` (18컬럼): teamId, problemStatement, targetAudience, situation, evidence1~3, hypothesis1~2, solution, features, prototypeLink, githubLink, experimentLog, wrongAssumption, nextTest, adoptionChecklist, updatedAt
   - `help_cards` (8컬럼): id, teamId, title, detail, link, status, createdAt, updatedAt
   - `insight_cards` (5컬럼): id, teamId, wrongAssumption, nextTest, createdAt
   - `feedbacks` (7컬럼): id, targetType, targetId, authorId, body, helpfulCount, createdAt
   - `config` (3컬럼): key, value, description

3. **config 탭 초기 데이터**:
   ```
   key         | value                                                          | description
   deadlines   | [{"stage":"1차제출","date":"2026-02-13T23:59:59Z","lockType":"soft"}] | 마감일 설정
   ```

4. **서비스 계정 공유**:
   - 스프레드시트에서 "공유" 클릭
   - 서비스 계정 이메일 입력
   - 권한: **편집자**

### 4단계: 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

### 5단계: 테스트

1. **회원가입**: `/auth/signup`
2. **로그인**: `/auth/signin`
3. **팀 페이지**: `/teams/team_sample` (샘플 데이터 필요)
4. **Help**: `/help/help_001`
5. **Insight**: `/insight/insight_001`

---

## 📊 시트 탭/컬럼 명세 (요약)

자세한 내용은 **docs/SHEET_SCHEMA.md** 참조

### AUTH_SHEET: `users` (12컬럼)
인증 정보, 비밀번호 해시, 로그인 실패/잠금 관리

### DATA_SHEET:
- **`teams`** (7컬럼): 팀 기본 정보
- **`projects`** (18컬럼): Why/가설/해결/검증로그 (개인정보 금지)
- **`help_cards`** (8컬럼): Help 요청, 상태 관리
- **`insight_cards`** (5컬럼): 배운 점 (틀렸던 가정)
- **`feedbacks`** (7컬럼): 피드백, 도움 됨 카운트
- **`config`** (3컬럼): 마감일(D-day), 잠금 설정 (soft/hard)

### 마감 후 잠금 타입
- **soft**: 마감 후 경고만 표시, 수정 가능
- **hard**: 마감 후 완전 잠금, 수정 불가

---

## 🔒 보안 구현

### 비밀번호 보안
- ✅ bcrypt 해시 (salt rounds: 10)
- ✅ 평문 비밀번호 절대 저장 금지

### 로그인 실패/잠금
- ✅ 최대 5회 실패
- ✅ 30분 잠금 (lockedUntil)
- ✅ 성공 시 실패 횟수 초기화

### 세션
- ✅ iron-session 사용
- ✅ httpOnly 쿠키 (XSS 방지)
- ✅ 7일 유효
- ✅ 프로덕션에서 secure (HTTPS only)

---

## ⚠️ 개인정보 보호 준수

### 수집 최소화
- 필수 항목만 수집 (이메일, 비밀번호, 이름, 휴대폰, 소속, 생년)
- 목적: 해커톤 운영 및 참가자 확인

### 금지 사항
- ❌ 증거/사례 기록에 실명/연락처/주소/구체 식별정보 절대 금지
- ❌ 얼굴/명찰 캡처
- ❌ 샘플 데이터에 실제 개인정보 사용

### UI 반영
- ✅ 회원가입 페이지: 개인정보 수집 안내 + 동의 필수
- ✅ 팀 페이지 증거란: "⚠️ 개인정보 금지" 경고 표시
- ✅ 로그인 페이지: 보안 알림 (5회 실패/30분 잠금)

---

## 📝 참고 문서

- **docs/IMPLEMENTATION.md**: 전체 구현 완료 보고서 (이 문서의 상세 버전)
- **docs/SHEET_SCHEMA.md**: 구글 시트 스키마 전체 명세
- **docs/PRD.md**: 제품 요구사항 문서
- **README.md**: 프로젝트 소개

---

## ✅ 완료 체크리스트

### 코드 구현
- [x] 회원가입 페이지 + API
- [x] 로그인 페이지 + API (실패/잠금)
- [x] 팀 상세 페이지 (Why/가설/해결/검증로그)
- [x] Help/Insight 상세 페이지
- [x] 구글 시트 연동 모듈 (AUTH/DATA 분리)
- [x] 비밀번호 해시 (bcrypt)
- [x] 세션 관리 (iron-session)
- [x] 마감일 D-day 표시
- [x] 마감 후 잠금 로직 (soft/hard)

### 문서
- [x] 환경변수 예시 (.env.example)
- [x] 시트 스키마 명세 (SHEET_SCHEMA.md)
- [x] 구현 완료 보고서 (IMPLEMENTATION.md)
- [x] 요약 문서 (이 파일)

### 보안/개인정보
- [x] 비밀번호 평문 저장 금지
- [x] 로그인 실패/잠금 구현
- [x] 개인정보 금지 문구 UI 반영
- [x] 샘플 데이터 가상화

---

**구현 완료!** 🎉

다음 단계: `.env.local` 설정 → 구글 시트 설정 → `npm run dev`
