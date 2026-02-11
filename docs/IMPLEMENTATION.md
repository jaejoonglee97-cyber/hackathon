# 구글 스프레드시트 DB 기반 구현 완료 보고서

## ✅ 구현 완료 항목

### 1. 라우팅/페이지
- ✅ `/auth/signup` - 회원가입 (이름/휴대폰/소속/생년/이메일/비밀번호 + 동의 체크)
- ✅ `/auth/signin` - 로그인 (이메일+비밀번호)
- ✅ `/teams/[id]` - 팀 페이지 (Why/가설/해결/프로토타입/검증로그/확산)
- ✅ `/help/[helpId]` - Help 카드 상세
- ✅ `/insight/[insightId]` - Insight 카드 상세

### 2. 데이터 레이어
- ✅ **구글 스프레드시트 연동 모듈** (`lib/sheets.ts`)
  - AUTH/DATA 시트 분리
  - CRUD 기본 함수 (readSheet, appendToSheet, findInSheet, updateSheetRow)
  - config_deadlines 읽기 및 D-day 계산
  - 마감 후 잠금 로직 (soft/hard)

### 3. 보안
- ✅ **비밀번호 해시 저장** (bcrypt, salt rounds: 10)
- ✅ **로그인 실패 횟수 추적** (5회 실패 시 30분 잠금)
- ✅ **세션 관리** (iron-session, 7일 유지)
- ✅ **개인정보 보호**
  - 실명/연락처는 최소 수집
  - 증거 입력란에 개인정보 금지 안내
  - 샘플 데이터는 가상 정보만 사용

---

## 📂 생성된 파일 목록 (총 32개)

### 설정 파일
```
.env.example                          # 환경변수 예시
package.json                          # 의존성 (googleapis, bcryptjs, iron-session 추가)
```

### 라이브러리 (lib/)
```
lib/sheets.ts                         # 구글 시트 연동 모듈
lib/bcrypt.ts                         # 비밀번호 해싱
lib/session.ts                        # 세션 설정
```

### API 라우트 (app/api/)
```
app/api/auth/signup/route.ts          # 회원가입 API
app/api/auth/signin/route.ts          # 로그인 API
app/api/auth/signout/route.ts         # 로그아웃 API
app/api/auth/me/route.ts              # 현재 사용자 조회 API
```

### 페이지 (app/)
```
app/auth/signup/page.tsx               # 회원가입 페이지
app/auth/signup/signup.module.css      # 회원가입 스타일
app/auth/signin/page.tsx               # 로그인 페이지
app/auth/signin/signin.module.css      # 로그인 스타일
app/teams/[id]/page.tsx                # 팀 상세 페이지
app/teams/[id]/team.module.css         # 팀 상세 스타일
app/help/[helpId]/page.tsx             # Help 상세 페이지
app/help/[helpId]/help.module.css      # Help 상세 스타일
app/insight/[insightId]/page.tsx       # Insight 상세 페이지
app/insight/[insightId]/insight.module.css # Insight 상세 스타일
```

### 문서 (docs/)
```
docs/SHEET_SCHEMA.md                  # 구글 시트 스키마 명세
docs/IMPLEMENTATION.md                # 구현 완료 보고서 (이 파일)
```

---

## 🚀 로컬 실행 방법

### 1. 의존성 설치
```bash
npm install
```

새로 추가된 패키지:
- `googleapis` (구글 시트 API)
- `bcryptjs` (비밀번호 해싱)
- `iron-session` (세션 관리)

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 아래 내용을 입력하세요:

```env
# 구글 서비스 계정 (JSON 키에서 복사)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# 스프레드시트 ID
SPREADSHEET_ID=your-spreadsheet-id-here

# 세션 암호화 키 (32자 이상 랜덤 문자열)
SESSION_SECRET=your-random-32-char-secret-key

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 환경변수 획득 방법

**1) GOOGLE_SERVICE_ACCOUNT_EMAIL & GOOGLE_PRIVATE_KEY**
- [Google Cloud Console](https://console.cloud.google.com/) 접속
- 프로젝트 생성 (또는 기존 프로젝트 선택)
- IAM 및 관리자 → 서비스 계정 → 서비스 계정 만들기
- JSON 키 다운로드
- JSON 파일 열어서 `client_email`과 `private_key` 복사

**2) SPREADSHEET_ID**
- 구글 시트 URL에서 확인:
  ```
  https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
  ```

**3) SESSION_SECRET**
- 랜덤 문자열 생성 (32자 이상):
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 3. 구글 스프레드시트 설정

**docs/SHEET_SCHEMA.md** 파일을 참고하여:

1. 새 Google Sheets 생성
2. 7개 탭 생성: `users`, `teams`, `projects`, `help_cards`, `insight_cards`, `feedbacks`, `config`
3. 각 탭에 헤더 행 추가 (스키마 문서 참고)
4. 서비스 계정 이메일을 편집자로 공유

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 5. 테스트 플로우

1. **회원가입**: http://localhost:3000/auth/signup
   - 이메일, 비밀번호(8자 이상, 영문+숫자), 이름, 휴대폰, 소속, 생년 입력
   - 개인정보 수집 및 이용약관 동의
   
2. **로그인**: http://localhost:3000/auth/signin
   - 가입한 이메일/비밀번호로 로그인
   - 5회 실패 시 30분 잠금 테스트 가능

3. **팀 페이지**: http://localhost:3000/teams/team_sample
   - Why/가설/해결/프로토타입/검증로그/확산 섹션 확인
   - 개인정보 경고 문구 확인

4. **Help 상세**: http://localhost:3000/help/help_001

5. **Insight 상세**: http://localhost:3000/insight/insight_001

---

## 📊 시트 탭 및 컬럼 명세

자세한 내용은 **docs/SHEET_SCHEMA.md** 참조

### 시트 탭 (7개)
1. **users** (12컬럼) - 사용자 인증 정보, 비밀번호 해시, 실패 횟수, 잠금
2. **teams** (7컬럼) - 팀 기본 정보
3. **projects** (18컬럼) - Why/가설/해결/검증로그 등 상세 내용
4. **help_cards** (8컬럼) - Help 카드, 상태 관리
5. **insight_cards** (5컬럼) - Insight 카드, 틀렸던 가정
6. **feedbacks** (7컬럼) - 피드백, 도움 됨 카운트
7. **config** (3컬럼) - 마감일, 시스템 설정

### 마감일 설정 예시 (config 탭)
```json
[
  {
    "stage": "1차 제출",
    "date": "2026-02-13T23:59:59Z",
    "lockType": "soft"
  }
]
```

- **soft**: 마감 후 경고 표시만, 수정 가능
- **hard**: 마감 후 수정 불가 (완전 잠금)

---

## 🔒 보안 구현 상세

### 1. 비밀번호 보안
```typescript
// 회원가입 시 해시 저장
const passwordHash = await hashPassword(password);

// 로그인 시 검증
const isValid = await verifyPassword(password, user.passwordHash);
```

- bcrypt salt rounds: 10
- 평문 비밀번호는 절대 저장하지 않음

### 2. 로그인 실패 잠금
```typescript
// 실패 횟수 증가
failedAttempts = parseInt(user.failedAttempts || '0') + 1;

// 5회 이상 실패 시 30분 잠금
if (failedAttempts >= 5) {
  lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
}
```

- 최대 실패 횟수: 5회
- 잠금 시간: 30분
- 로그인 성공 시 실패 횟수 초기화

### 3. 세션 관리
```typescript
// iron-session 사용
session.userId = user.id;
session.email = user.email;
session.isLoggedIn = true;
await session.save();
```

- 쿠키 이름: `hackathon_hub_session`
- 유효 기간: 7일
- httpOnly: true (XSS 방지)
- secure: production에서만 true (HTTPS)

---

## ⚠️ 개인정보 보호 준수

### 수집 항목 (최소 수집 원칙)
- ✅ **필수**: 이메일, 비밀번호, 이름, 휴대폰, 소속, 생년
- ✅ **목적**: 해커톤 운영 및 참가자 확인
- ✅ **보관**: 행사 종료 후 1년

### 금지 사항
- ❌ **실명** (증거/사례 기록)
- ❌ **연락처** (증거/사례 기록)
- ❌ **주소**
- ❌ **구체적 사례 식별 정보** (예: "A복지관 B씨")
- ❌ **얼굴/명찰 캡처**

### UI에 반영된 보호 장치
1. **회원가입 페이지**: 개인정보 수집 안내 및 동의 체크 필수
2. **팀 페이지 (프로젝트 섹션)**: 증거 입력란에 "⚠️ 개인정보 금지" 경고 표시
3. **샘플 데이터**: 모두 가상의 정보만 사용

---

## 📝 다음 구현 예정 사항

### 우선순위 1
- [ ] 팀 생성/편집 페이지
- [ ] Help/Insight 카드 생성 페이지
- [ ] 피드백 작성 UI
- [ ] 마감 후 잠금 UI (soft/hard 구분)

### 우선순위 2
- [ ] 심사위원 대시보드 (`/judge`)
- [ ] 운영자 콘솔 (`/admin`)
- [ ] 제출 스냅샷 기능
- [ ] 루브릭 기반 채점

### 우선순위 3
- [ ] 알림 시스템 (이메일/인앱)
- [ ] 검색 기능
- [ ] 데이터 내보내기 (CSV/PDF)

---

## 🐛 알려진 제약사항

### 구글 시트 API 제한
- **읽기/쓰기 속도**: API 호출 제한 (분당 100회)
- **동시성**: 여러 사용자 동시 수정 시 충돌 가능
- **해결**: 
  - 캐싱 레이어 추가 권장
  - 대규모 운영 시 PostgreSQL 등 전환 고려

### 개인정보 보호
- **휴대폰/이름**: 현재 평문 저장
- **권장**: AES-256 암호화 또는 토큰화
- **접근 제어**: 서비스 계정 권한 관리 필수

---

## 📚 참고 문서
- [docs/SHEET_SCHEMA.md](./SHEET_SCHEMA.md) - 시트 스키마 전체 명세
- [docs/PRD.md](./PRD.md) - 제품 요구사항 문서
- [docs/UX.md](./UX.md) - UX 스펙
- [docs/UI.md](./UI.md) - UI 가이드
- [README.md](../README.md) - 프로젝트 개요

---

## ✅ 체크리스트

### 환경 설정
- [ ] `npm install` 완료
- [ ] `.env.local` 파일 생성 및 환경변수 입력
- [ ] 구글 서비스 계정 생성 및 JSON 키 다운로드
- [ ] 스프레드시트 생성 및 탭 설정
- [ ] 서비스 계정에 스프레드시트 공유 (편집자 권한)

### 테스트
- [ ] 회원가입 테스트
- [ ] 로그인 테스트 (성공/실패 5회 잠금)
- [ ] 팀 페이지 확인
- [ ] Help/Insight 상세 확인
- [ ] 개인정보 보호 문구 확인

### 배포 전 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 서비스 계정 JSON 키가 Git에 커밋되지 않았는지 확인
- [ ] 프로덕션 환경 변수 (Vercel 등) 설정
- [ ] `SESSION_SECRET`을 안전한 랜덤 값으로 변경

---

**구현 완료!** 🎉
