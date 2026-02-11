# ✅ AUTH_SHEET + DATA_SHEET 분리 구현 완료

## 📋 구현 완료 내용

### 1) 2개 스프레드시트로 분리 ✅
- **AUTH_SHEET** (`1SnoNCVDUa2APj-GO7iVfjc-2lvGFxc8v-wvJBVuDJ70`): 인증 정보 전용
  - `users_auth` 탭: email, password_hash, role, status, failed_count, locked_until
- **DATA_SHEET** (`1FlsIvChf3E9RsWhizFkz3QCvri1uunonTfYbl4UU9sM`): 운영 데이터
  - `users_profile` 탭: name, phone, org, birthdate, consent_version
  - `teams`, `projects`, `help_cards`, `insight_cards`, `feedbacks`, `config` 탭

### 2) ENV 변수 분리 ✅
```env
AUTH_SHEET_ID=1SnoNCVDUa2APj-GO7iVfjc-2lvGFxc8v-wvJBVuDJ70
DATA_SHEET_ID=1FlsIvChf3E9RsWhizFkz3QCvri1uunonTfYbl4UU9sM
```

### 3) 회원가입 로직 ✅
- **AUTH_SHEET > users_auth**: email, password_hash, role, status, failed_count 저장
- **DATA_SHEET > users_profile**: name, phone, org, birthdate, consent_version 저장
- 2개 스프레드시트에 동시 추가 (트랜잭션 없음, 순차 처리)

### 4) 로그인 로직 ✅
- **AUTH_SHEET > users_auth**에서 email로 조회
- password_hash 검증
- 실패 시 `failed_count` 증가
- 5회 실패 → `locked_until` 30분 후로 설정
- 성공 시 `failed_count` 0으로 초기화

### 5) A1 Range 기반 읽기/쓰기 ✅
```typescript
// 예시: users_auth!A1:I
const range = `${tabName}!A1:Z`;
await sheets.spreadsheets.values.get({ spreadsheetId, range });
```

---

## 📂 수정된 파일 목록

### 핵심 모듈
```
lib/sheets.ts                    # 완전 재작성: AUTH/DATA 분리, A1 range 기반
.env.example                     # AUTH_SHEET_ID, DATA_SHEET_ID 분리
```

### API 라우트
```
app/api/auth/signup/route.ts     # AUTH + DATA 동시 저장
app/api/auth/signin/route.ts     # AUTH에서 조회, failed_count 관리
```

### 페이지
```
app/auth/signup/page.tsx         # birthYear → birthdate로 변경
app/teams/[id]/page.tsx          # DATA_SHEET 사용, 언더스코어 컬럼명
app/help/[helpId]/page.tsx       # DATA_SHEET 사용
app/insight/[insightId]/page.tsx # DATA_SHEET 사용
```

### 문서
```
docs/SHEET_SCHEMA.md             # AUTH/DATA 분리 스키마 명세
docs/SETUP_GUIDE.md              # 실제 스프레드시트 ID 반영한 설정 가이드 (신규)
```

---

## 🚀 다음 단계: 로컬 테스트

### 1. 환경변수 설정
`.env.local` 파일 생성 (프로젝트 루트):
```env
AUTH_SHEET_ID=1SnoNCVDUa2APj-GO7iVfjc-2lvGFxc8v-wvJBVuDJ70
DATA_SHEET_ID=1FlsIvChf3E9RsWhizFkz3QCvri1uunonTfYbl4UU9sM
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@...iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SESSION_SECRET=(32자 랜덤 문자열)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 서비스 계정 생성 및 공유
1. Google Cloud Console에서 서비스 계정 생성
2. JSON 키 다운로드
3. **두 스프레드시트 모두** 서비스 계정에 편집자 권한 부여

### 3. 헤더 설정
**AUTH_SHEET > users_auth (A1:I1)**:
```
user_id	email	password_hash	role	status	failed_count	locked_until	created_at	updated_at
```

**DATA_SHEET > users_profile (A1:G1)**:
```
user_id	name	phone	org	birthdate	consent_version	consented_at
```

기타 탭 헤더는 `docs/SHEET_SCHEMA.md` 참고

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 테스트 플로우
1. http://localhost:3000/auth/signup - 회원가입
2. AUTH_SHEET, DATA_SHEET 확인 → 각각 새 행 추가됨
3. http://localhost:3000/auth/signin - 로그인
4. 잘못된 비밀번호 5번 입력 → 30분 잠금 확인

---

## 🔒 보안 강화 포인트

### 개인정보 물리적 분리
- **AUTH_SHEET**: 인증 정보만 (접근 제한 강화 가능)
- **DATA_SHEET**: 비즈니스 데이터 + 개인정보 (name, phone은 별도 탭)

### 비밀번호 보안
- bcrypt 해시만 저장
- 평문 비밀번호 절대 저장 안 함

### 로그인 잠금
- 5회 실패 → 30분 자동 잠금
- `locked_until` 컬럼으로 관리

### 개인정보 보호
- `projects.evidence*`에 개인정보 금지 (UI 경고)
- `users_profile`은 별도 탭으로 분리

---

## 📝 참고 문서

| 문서 | 설명 |
|------|------|
| **docs/SETUP_GUIDE.md** | 실제 스프레드시트 연동 설정 가이드 (신규) |
| **docs/SHEET_SCHEMA.md** | AUTH/DATA 분리 스키마 전체 명세 |
| **docs/IMPLEMENTATION.md** | 전체 구현 완료 보고서 |
| **.env.example** | 환경변수 예시 |

---

## ✅ 체크리스트

### 코드
- [x] AUTH_SHEET, DATA_SHEET ENV 분리
- [x] `lib/sheets.ts` 완전 재작성 (A1 range 기반)
- [x] 회원가입 API: AUTH + DATA 동시 저장
- [x] 로그인 API: failed_count, locked_until 관리
- [x] 모든 페이지 언더스코어 컬럼명 사용

### 문서
- [x] SHEET_SCHEMA.md 업데이트 (AUTH/DATA 분리)
- [x] SETUP_GUIDE.md 신규 작성 (실제 시트 ID 반영)
- [x] .env.example 업데이트

### 테스트 (다음 단계)
- [ ] .env.local 파일 생성
- [ ] 서비스 계정 생성 및 JSON 키 다운로드
- [ ] 두 스프레드시트 공유 (편집자 권한)
- [ ] 헤더 행 설정
- [ ] 회원가입/로그인 테스트

---

**구현 완료!** 🎉

다음 작업: `docs/SETUP_GUIDE.md`를 참고하여 실제 스프레드시트 연동 설정을 진행하세요.
