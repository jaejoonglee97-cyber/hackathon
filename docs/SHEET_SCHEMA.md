# 구글 스프레드시트 DB 스키마 (AUTH + DATA 분리)

## 📊 개요

이 프로젝트는 **2개의 구글 스프레드시트**를 사용합니다:
1. **AUTH_SHEET**: 인증 정보 (email, password_hash, role, failed_count, locked_until)
2. **DATA_SHEET**: 비즈니스 데이터 + 개인정보 (teams, projects, users_profile 등)

### 개인정보 보호 원칙
- 인증 정보와 개인정보를 물리적으로 분리 (다른 스프레드시트)
- AUTH_SHEET는 접근 제한을 더 엄격하게 관리
- DATA_SHEET는 업무 데이터와 개인정보가 함께 있으나, 별도 탭으로 분리

---

## 🔐 AUTH_SHEET (인증 정보)

### 스프레드시트 설정
- **파일명**: `hackathon-hub-auth` (권장)
- **공유**: 서비스 계정만 편집자 권한
- **환경변수**: `AUTH_SHEET_ID`

### 탭 구성

#### `users_auth` (인증 정보)
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| user_id | string | 사용자 고유 ID | user_1709791234567_abc123 |
| email | string | 이메일 (로그인 ID) | hong@example.com |
| password_hash | string | bcrypt 해시 비밀번호 | $2a$10$... |
| role | string | 역할 (participant/mentor/judge/admin) | participant |
| status | string | 상태 (active/suspended/deleted) | active |
| failed_count | number | 로그인 실패 횟수 | 0 |
| locked_until | string (ISO) | 잠금 해제 시간 | 2026-02-06T16:30:00Z |
| created_at | string (ISO) | 생성일시 | 2026-02-06T15:00:00Z |
| updated_at | string (ISO) | 수정일시 | 2026-02-06T15:00:00Z |

**헤더 행 (A1:I1)**:
```
user_id	email	password_hash	role	status	failed_count	locked_until	created_at	updated_at
```

**보안 요구사항**:
- ✅ password_hash만 저장, 평문 비밀번호 절대 금지
- ✅ failed_count 5회 이상 시 locked_until 자동 설정 (30분)
- ✅ 로그인 성공 시 failed_count 0으로 초기화

---

## 📊 DATA_SHEET (비즈니스 데이터 + 개인정보)

### 스프레드시트 설정
- **파일명**: `hackathon-hub-data` (권장)
- **공유**: 서비스 계정 편집자 권한
- **환경변수**: `DATA_SHEET_ID`

### 탭 구성

#### 1. `users_profile` (개인정보)
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| user_id | string | 사용자 ID (FK: users_auth) | user_1709791234567_abc123 |
| name | string | 이름 (⚠️ 개인정보) | 홍길동 |
| phone | string | 휴대폰 (⚠️ 개인정보) | 010-1234-5678 |
| org | string | 소속 기관 | 서울시복지재단 |
| birthdate | string | 생년 (4자리) | 1990 |
| consent_version | string | 동의서 버전 | v1.0 |
| consented_at | string (ISO) | 동의일시 | 2026-02-06T15:00:00Z |

**헤더 행 (A1:G1)**:
```
user_id	name	phone	org	birthdate	consent_version	consented_at
```

**⚠️ 개인정보 보호**:
- `name`, `phone`은 개인정보이므로 접근 권한 엄격 관리
- 실제 운영 시 암호화 또는 토큰화 권장
- 행사 종료 후 보관 기간(1년) 준수 후 파기

---

#### 2. `teams` (팀 기본 정보)
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| id | string | 팀 ID | 1 |
| name | string | 팀명 | 케어링크 |
| org | string | 대표 소속 | 서울시복지재단 |
| member_ids | string (JSON) | 팀원 user_id 목록 | ["user_123","user_456"] |
| stage | string | 스테이지 (intro/validate/complete) | validate |
| created_at | string (ISO) | 생성일시 | 2026-02-01T10:00:00Z |
| updated_at | string (ISO) | 수정일시 | 2026-02-06T15:00:00Z |

**헤더 행 (A1:G1)**:
```
id	name	org	member_ids	stage	created_at	updated_at
```

---

#### 3. `projects` (프로젝트 상세)
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| team_id | string | 팀 ID (FK) | 1 |
| problem_statement | string | 문제 정의 | 독거노인 안부 확인에 매일 2시간 소요 |
| target_audience | string | 대상 (누구) | 독거노인 담당 사회복지사 |
| situation | string | 상황 (언제) | 매일 아침 9시~11시 |
| evidence1 | string | 증거 1 (⚠️ 개인정보 금지) | 인터뷰: "전화 연결 안 되면 재시도 반복" |
| evidence2 | string | 증거 2 | 업무로그: 하루 평균 50건 전화 |
| evidence3 | string | 증거 3 | 관찰: 전화 후 수기 기록에 30분 소요 |
| hypothesis1 | string | 가설 1 | 자동 문자 알림 시 응답률 50% 향상 예상 |
| hypothesis2 | string | 가설 2 | 음성 인식 기록 시 입력 시간 80% 단축 |
| solution | string | 솔루션 설명 | 자동 안부 확인 시스템 + 음성 기록 |
| features | string | 핵심 기능 | 1) 자동 문자 2) 응답 집계 3) 음성 기록 |
| prototype_link | string | 프로토타입 URL | https://demo.example.com |
| github_link | string | GitHub URL | https://github.com/team/repo |
| experiment_log | string | 검증 로그 | 10명 대상 2주 테스트: 응답률 60% |
| wrong_assumption | string | 틀렸던 가정 | 노인분들이 문자를 못 읽을 거라 생각했지만 80%가 읽음 |
| next_test | string | 다음 검증 | 음성 통화 자동화 테스트 필요 |
| adoption_checklist | string | 확산 체크리스트 | 1) 전화번호 DB 2) SMS 권한 3) 매뉴얼 |
| updated_at | string (ISO) | 수정일시 | 2026-02-06T15:00:00Z |

**헤더 행 (A1:R1)**:
```
team_id	problem_statement	target_audience	situation	evidence1	evidence2	evidence3	hypothesis1	hypothesis2	solution	features	prototype_link	github_link	experiment_log	wrong_assumption	next_test	adoption_checklist	updated_at
```

**⚠️ 개인정보 금지**:
- `evidence1~3`에는 실명/연락처/주소/구체적 사례 식별 정보 **절대 금지**

---

#### 4. `help_cards` (help 요청)
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| id | string | Help 카드 ID | help_001 |
| team_id | string | 팀 ID (FK) | 1 |
| title | string | 제목 | SMS API 연동 방법 질문 |
| detail | string | 상세 내용 | 네이버 클라우드 SMS API 사용법 문의 |
| link | string | 관련 링크 (선택) | https://docs.example.com |
| status | string | 상태 (open/in-progress/resolved) | open |
| created_at | string (ISO) | 생성일시 | 2026-02-06T14:00:00Z |
| updated_at | string (ISO) | 수정일시 | 2026-02-06T14:00:00Z |

**헤더 행 (A1:H1)**:
```
id	team_id	title	detail	link	status	created_at	updated_at
```

---

#### 5. `insight_cards` (배운 점)
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| id | string | Insight 카드 ID | insight_001 |
| team_id | string | 팀 ID (FK) | 1 |
| wrong_assumption | string | 틀렸던 가정 | 노인분들이 문자를 못 읽을 것이라 생각 |
| next_test | string | 다음 검증 | 음성 통화 자동화 선호도 조사 |
| created_at | string (ISO) | 생성일시 | 2026-02-05T10:00:00Z |

**헤더 행 (A1:E1)**:
```
id	team_id	wrong_assumption	next_test	created_at
```

---

#### 6. `feedbacks` (피드백)
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| id | string | 피드백 ID | feedback_001 |
| target_type | string | 대상 타입 (Project/Help/Insight) | Help |
| target_id | string | 대상 ID | help_001 |
| author_id | string | 작성자 ID (FK: users_auth) | user_123 |
| body | string | 피드백 내용 | Twilio 대신 국내 API 추천 |
| helpful_count | number | "도움 됨" 카운트 | 3 |
| created_at | string (ISO) | 생성일시 | 2026-02-06T15:30:00Z |

**헤더 행 (A1:G1)**:
```
id	target_type	target_id	author_id	body	helpful_count	created_at
```

---

#### 7. `config` (설정)
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| key | string | 설정 키 | deadlines |
| value | string | 설정 값 (JSON) | [{"stage":"1차제출",...}] |
| description | string | 설명 | 마감일 설정 |

**헤더 행 (A1:C1)**:
```
key	value	description
```

**초기 데이터**:
```
deadlines	[{"stage":"1차 제출","date":"2026-02-13T23:59:59Z","lockType":"soft"}]	마감일 설정
```

---

## 🛠️ 시트 초기 설정 방법

### 1단계: AUTH_SHEET 생성
1. 새 Google Sheets 생성, 이름: `hackathon-hub-auth`
2. `users_auth` 탭 생성
3. A1:I1에 헤더 입력:
   ```
   user_id	email	password_hash	role	status	failed_count	locked_until	created_at	updated_at
   ```
4. 스프레드시트 ID 복사 (URL에서)
5. `.env.local`에 `AUTH_SHEET_ID` 설정

### 2단계: DATA_SHEET 생성
1. 새 Google Sheets 생성, 이름: `hackathon-hub-data`
2. 7개 탭 생성: `users_profile`, `teams`, `projects`, `help_cards`, `insight_cards`, `feedbacks`, `config`
3. 각 탭의 A1부터 헤더 입력 (위 명세 참고)
4. `config` 탭에 초기 데이터 입력 (deadlines)
5. 스프레드시트 ID 복사
6. `.env.local`에 `DATA_SHEET_ID` 설정

### 3단계: 서비스 계정 공유
1. 구글 클라우드 콘솔에서 서비스 계정 생성
2. JSON 키 다운로드
3. **두 스프레드시트 모두** 서비스 계정 이메일에 **편집자** 권한 부여

---

## 🔒 보안/개인정보 보호

### AUTH_SHEET
- ✅ 비밀번호는 bcrypt 해시만 저장
- ✅ 로그인 실패 5회 → 30분 잠금
- ✅ 접근 권한을 DATA_SHEET보다 더 엄격하게 관리

### DATA_SHEET
- ✅ `users_profile`은 개인정보이므로 접근 제한 필요
- ✅ `projects.evidence*`에 개인정보 금지 (UI에 경고 표시)
- ✅ 행사 종료 후 보관 기간 준수

### 세션
- ✅ iron-session 사용 (httpOnly, 7일 유효)
- ✅ 프로덕션에서는 secure (HTTPS only)

---

## 📚 참고 링크
- [Google Sheets API](https://developers.google.com/sheets/api)
- [서비스 계정 설정](https://cloud.google.com/iam/docs/service-accounts)
