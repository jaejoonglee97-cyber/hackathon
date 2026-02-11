# ✅ Vercel 배포 가이드

## 🚀 배포 전 체크리스트

### 1. 환경 변수 준비 ✓
다음 환경 변수들을 준비하세요:

```bash
# Google Sheets 인증
AUTH_SHEET_ID=your_auth_sheet_id
DATA_SHEET_ID=your_data_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# JWT 비밀키 (64자 이상 권장)
JWT_SECRET=your_super_secret_jwt_key_at_least_64_characters_long_random_string

# 앱 URL (배포 후 업데이트)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 2. Google Sheets 설정 ✓

#### AUTH_SHEET (인증 데이터)
- `users_auth` 탭: `id, email, password_hash, role, login_attempts, locked_until, created_at, updated_at`

#### DATA_SHEET (비즈니스 데이터)
- `users_profile` 탭: `id, name, birthdate, phone, org, privacy_consent, terms_consent, created_at, updated_at`
- `teams` 탭: `id, name, org, stage, created_at, updated_at`
- `team_members` 탭: `id, team_id, user_id, role, joined_at, updated_at`
- `projects` 탭: `team_id, problem_statement, target_audience, situation, evidence1, evidence2, evidence3, hypothesis1, hypothesis2, solution, features, prototype_link, github_link, experiment_log, wrong_assumption, next_test, adoption_checklist, created_at, updated_at`
- `help_cards` 탭: `id, team_id, type, title, description, status, created_at, updated_at`
- `insight_cards` 탭: `id, team_id, content, category, created_at`
- `config` 탭: `key, value`
- `audit_events` 탭: `id, user_id, action, table_name, record_id, details, timestamp`

#### config 탭 필수 설정
```
key: deadlines
value: [{"stage":"intro","date":"2026-03-01T00:00:00Z","lockType":"soft"}]
```

### 3. 로컬 빌드 테스트 ✓
```bash
npm run build
npm run start
```

---

## 📦 Vercel 배포 단계

### 방법 1: Vercel CLI (권장)

#### 1. Vercel CLI 설치
```bash
npm i -g vercel
```

#### 2. 로그인
```bash
vercel login
```

#### 3. 프로젝트 배포
```bash
cd c:\Users\이재중\OneDrive - 서울특별시사회복지사협회\문서\hackathon-hub
vercel
```

#### 4. 환경 변수 설정
```bash
# 각 환경 변수를 하나씩 추가
vercel env add AUTH_SHEET_ID
vercel env add DATA_SHEET_ID
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_APP_URL
```

**중요**: `GOOGLE_PRIVATE_KEY`는 반드시 큰따옴표로 감싸야 합니다:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

#### 5. Production 배포
```bash
vercel --prod
```

---

### 방법 2: Vercel 웹 대시보드

#### 1. GitHub 연동 (선택)
- https://github.com/new 에서 새 저장소 생성
- 로컬 프로젝트를 GitHub에 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/hackathon-hub.git
git push -u origin main
```

#### 2. Vercel 대시보드에서 Import
- https://vercel.com/new
- "Import Git Repository" 선택
- 저장소 선택

#### 3. 환경 변수 설정
- Settings → Environment Variables
- 위의 환경 변수들을 모두 추가
- Production, Preview, Development에 모두 체크

#### 4. Deploy
- "Deploy" 버튼 클릭

---

## 🔧 배포 후 확인 사항

### 1. 환경 변수 확인
```bash
# Vercel 대시보드에서
Settings → Environment Variables → 모든 변수 확인
```

### 2. 빌드 로그 확인
```bash
# Deployments → Latest Deployment → Building
# 에러 없이 빌드 성공 확인
```

### 3. 기능 테스트
- [ ] 회원가입: `/auth/signup`
- [ ] 로그인: `/auth/signin`
- [ ] 대시보드: `/`
- [ ] 프로젝트 편집: `/teams/[id]/edit`
- [ ] Help 작성: `/help/new`
- [ ] Insight 작성: `/insight/new`

### 4. Google Sheets 연동 확인
- [ ] 회원가입 후 `users_auth`, `users_profile` 시트에 데이터 추가 확인
- [ ] 팀/프로젝트 자동 생성 확인 (`teams`, `team_members`, `projects`)
- [ ] `audit_events`에 로그 기록 확인

---

## ⚠️ 주의사항

### 1. GOOGLE_PRIVATE_KEY 형식
```bash
# ❌ 잘못된 형식
-----BEGIN PRIVATE KEY-----
MIIEvQIBA...
-----END PRIVATE KEY-----

# ✅ 올바른 형식 (큰따옴표 + \n)
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

### 2. NEXT_PUBLIC_APP_URL 업데이트
배포 후 실제 도메인으로 업데이트:
```bash
vercel env rm NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_APP_URL production
# 값 입력: https://your-actual-domain.vercel.app
```

### 3. JWT_SECRET 보안
- 최소 64자 이상
- 랜덤 문자열 사용
- 절대 GitHub에 커밋하지 않기

생성 방법:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

---

## 🐛 문제 해결

### 빌드 실패 시

#### 1. TypeScript 에러
```bash
# 로컬에서 먼저 확인
npm run build

# 타입 에러 수정 후 다시 배포
```

#### 2. 환경 변수 누락
```bash
# Vercel 대시보드 확인
Settings → Environment Variables

# 또는 CLI
vercel env ls
```

#### 3. Google Sheets 권한 에러
- Service Account에 시트 편집 권한 부여 확인
- GOOGLE_PRIVATE_KEY 형식 재확인

### 런타임 에러 시

#### 1. 로그 확인
```bash
# Vercel 대시보드
Deployments → Latest → Runtime Logs
```

#### 2. Dev 모드 체크
```bash
# lib/db.ts에서 DEV_MODE 확인
# 프로덕션에서는 실제 시트 연동 필요
```

---

## 📊 성능 최적화

### 1. 이미지 최적화
Next.js Image 컴포넌트 사용 권장

### 2. 캐싱
- ISR (Incremental Static Regeneration) 고려
- API 응답 캐싱

### 3. 리전 설정
`vercel.json`에서 서울 리전(`icn1`) 설정 확인

---

## 🔐 보안 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] JWT_SECRET이 충분히 안전한지 확인 (64자 이상)
- [ ] Google Service Account 키가 안전하게 보관되는지 확인
- [ ] CORS 설정 확인 (필요 시)
- [ ] Rate limiting 고려 (향후)

---

## 📝 배포 체크리스트

### 배포 전
- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] 모든 환경 변수 준비
- [ ] Google Sheets 권한 설정
- [ ] `.gitignore`에 `.env.local` 포함

### 배포 중
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 모두 입력
- [ ] 빌드 성공 확인

### 배포 후
- [ ] 도메인 확인
- [ ] 회원가입/로그인 테스트
- [ ] Google Sheets 연동 테스트
- [ ] 모든 페이지 동작 확인
- [ ] NEXT_PUBLIC_APP_URL 업데이트

---

## 🎉 완료!

배포가 성공하면 다음 URL에서 앱을 확인할 수 있습니다:
```
https://your-project-name.vercel.app
```

문제가 생기면 Vercel 대시보드의 로그를 확인하세요!
