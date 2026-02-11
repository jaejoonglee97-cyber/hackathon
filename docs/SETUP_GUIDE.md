# 🚀 스프레드시트 연동 설정 가이드

## 📋 제공받은 스프레드시트 정보

### 1. AUTH_SHEET (인증 전용)
- **스프레드시트 ID**: `1SnoNCVDUa2APj-GO7iVfjc-2lvGFxc8v-wvJBVuDJ70`
- **용도**: 사용자 인증 정보 (email, password_hash, role, failed_count, locked_until)
- **탭**: `users_auth`

### 2. DATA_SHEET (운영 데이터)
- **스프레드시트 ID**: `1FlsIvChf3E9RsWhizFkz3QCvri1uunonTfYbl4UU9sM`
- **용도**: 비즈니스 데이터 + 개인정보
- **탭**: `users_profile`, `teams`, `projects`, `help_cards`, `insight_cards`, `feedbacks`, `config`

---

## ⚙️ 로컬 개발 환경 설정

### 1단계: 환경변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 입력하세요:

```env
# 구글 서비스 계정 (JSON 키에서 복사)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# 스프레드시트 ID (실제 운영)
AUTH_SHEET_ID=1SnoNCVDUa2APj-GO7iVfjc-2lvGFxc8v-wvJBVuDJ70
DATA_SHEET_ID=1FlsIvChf3E9RsWhizFkz3QCvri1uunonTfYbl4UU9sM

# 세션 암호화 키 (아래 명령어로 생성)
SESSION_SECRET=your-random-32-char-secret-key-here

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2단계: 서비스 계정 생성 및 키 다운로드

1. **Google Cloud Console** 접속: https://console.cloud.google.com/
2. **프로젝트 생성** (또는 기존 프로젝트 선택)
3. **API 및 서비스 > 사용 설정된 API 및 서비스**
   - "Google Sheets API" 검색 후 사용 설정
4. **IAM 및 관리자 > 서비스 계정**
   - "서비스 계정 만들기" 클릭
   - 이름: `hackathon-hub-service`
   - 역할: (권한 불필요, 시트 공유로 권한 부여)
5. **서비스 계정 상세 > 키 탭**
   - "키 추가 > 새 키 만들기 > JSON" 선택
   - 다운로드된 JSON 파일 열기
6. **JSON 파일에서 복사**:
   ```json
   {
     "client_email": "hackathon-hub-service@your-project.iam.gserviceaccount.com",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   }
   ```
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`에 복사
   - `private_key` → `GOOGLE_PRIVATE_KEY`에 복사 (따옴표 포함)

### 3단계: 세션 암호화 키 생성

PowerShell에서 실행:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

출력된 값을 `SESSION_SECRET`에 복사

### 4단계: 스프레드시트 공유

두 스프레드시트 모두 서비스 계정에 **편집자** 권한을 부여해야 합니다.

#### AUTH_SHEET 공유
1. https://docs.google.com/spreadsheets/d/1SnoNCVDUa2APj-GO7iVfjc-2lvGFxc8v-wvJBVuDJ70/edit 접속
2. 우측 상단 "공유" 클릭
3. 서비스 계정 이메일 입력 (예: `hackathon-hub-service@...iam.gserviceaccount.com`)
4. 권한: **편집자** 선택
5. "전송" 클릭

#### DATA_SHEET 공유
1. https://docs.google.com/spreadsheets/d/1FlsIvChf3E9RsWhizFkz3QCvri1uunonTfYbl4UU9sM/edit 접속
2. 동일하게 서비스 계정에 **편집자** 권한 부여

### 5단계: 시트 헤더 확인

각 스프레드시트의 탭에 헤더가 올바르게 설정되어 있는지 확인하세요.

#### AUTH_SHEET > `users_auth` 탭 (A1:I1)
```
user_id	email	password_hash	role	status	failed_count	locked_until	created_at	updated_at
```

#### DATA_SHEET 탭별 헤더
- **`users_profile`** (A1:G1):
  ```
  user_id	name	phone	org	birthdate	consent_version	consented_at
  ```

- **`teams`** (A1:G1):
  ```
  id	name	org	member_ids	stage	created_at	updated_at
  ```

- **`projects`** (A1:R1):
  ```
  team_id	problem_statement	target_audience	situation	evidence1	evidence2	evidence3	hypothesis1	hypothesis2	solution	features	prototype_link	github_link	experiment_log	wrong_assumption	next_test	adoption_checklist	updated_at
  ```

- **`help_cards`** (A1:H1):
  ```
  id	team_id	title	detail	link	status	created_at	updated_at
  ```

- **`insight_cards`** (A1:E1):
  ```
  id	team_id	wrong_assumption	next_test	created_at
  ```

- **`feedbacks`** (A1:G1):
  ```
  id	target_type	target_id	author_id	body	helpful_count	created_at
  ```

- **`config`** (A1:C1):
  ```
  key	value	description
  ```

### 6단계: config 초기 데이터 입력

**DATA_SHEET > `config` 탭**에 아래 행 추가 (A2:C2):
```
deadlines	[{"stage":"1차 제출","date":"2026-02-13T23:59:59Z","lockType":"soft"}]	마감일 설정
```

---

## 🧪 연동 테스트

### 1. 개발 서버 시작
```bash
npm run dev
```

### 2. 브라우저에서 확인
http://localhost:3000

### 3. 회원가입 테스트
1. http://localhost:3000/auth/signup 접속
2. 정보 입력 후 회원가입
3. **AUTH_SHEET > users_auth 탭** 확인: 새 행 추가되었는지 확인
4. **DATA_SHEET > users_profile 탭** 확인: 새 행 추가되었는지 확인

### 4. 로그인 테스트
1. http://localhost:3000/auth/signin 접속
2. 가입한 이메일/비밀번호로 로그인
3. 성공 시 메인 페이지로 이동

### 5. 실패 테스트 (잠금 기능)
1. 잘못된 비밀번호로 5번 로그인 시도
2. "30분 후 다시 시도" 메시지 확인
3. **AUTH_SHEET > users_auth 탭** 확인:
   - `failed_count`: 5
   - `locked_until`: 30분 후 시간

---

## 🔧 문제 해결

### "Missing required environment variables" 에러
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 파일 이름이 정확히 `.env.local`인지 확인 (`.env.local.txt` 아님)
- 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

### "Failed to read sheet" 에러
- 서비스 계정이 두 스프레드시트에 모두 **편집자** 권한이 있는지 확인
- 스프레드시트 ID가 정확한지 확인
- Google Sheets API가 활성화되어 있는지 확인

### "Cannot find module 'iron-session'" 에러
```bash
npm install
```

### 한글이 깨지는 경우
- Google Sheets에서 직접 입력할 때 UTF-8로 저장되는지 확인
- 탭 이름이 영문인지 확인 (`users_auth`, `teams` 등)

---

## ⚠️ 보안 주의사항

### 절대 Git에 커밋하지 말 것
- `.env.local` 파일
- 서비스 계정 JSON 키 파일
- 실제 스프레드시트 ID (문서에는 괜찮음, 코드에는 안 됨)

### .gitignore 확인
`.gitignore` 파일에 아래 내용이 있는지 확인:
```
.env.local
.env*.local
*.key.json
```

### 프로덕션 배포 시
- Vercel/Netlify 등의 환경변수 설정에서 동일한 값 입력
- `SESSION_SECRET`은 다른 랜덤 값 사용 권장

---

## 📞 추가 지원

문제가 계속되면 다음 정보와 함께 요청하세요:
1. 에러 메시지 전체 텍스트
2. 터미널 로그
3. 어느 단계에서 막혔는지
