# 열매똑똑 해커톤 보드 (Hackathon Transparency Hub)

사회복지 현장 문제를 해결하는 해커톤을 위한 투명성 플랫폼입니다.

## 🎯 프로젝트 목표

- **투명성**: 팀별 진행상황을 한눈에 파악
- **협력 중심**: 점수/순위가 아닌 Help/Insight/기여 배지로 건전한 자극
- **고객 중심**: "Why(문제/고객/증거)"를 강제하는 구조
- **개인정보 보호**: 최소수집·비식별·접근통제 기본값

## 🚀 시작하기

### 필수 조건

- Node.js 18.17 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
hackathon-hub/
├── app/
│   ├── components/       # 재사용 가능한 컴포넌트
│   │   ├── TeamCard.tsx
│   │   ├── DashboardFilters.tsx
│   │   ├── SharedGoal.tsx
│   │   └── AnnouncementBanner.tsx
│   ├── globals.css       # 글로벌 스타일 및 디자인 시스템
│   ├── layout.tsx        # 루트 레이아웃
│   └── page.tsx          # 메인 대시보드
├── docs/                 # 문서
│   ├── PRD.md.md        # 제품 요구사항 문서
│   ├── UX.md.md         # UX 사양
│   └── UI.md.md         # UI 가이드
└── package.json
```

## 🎨 주요 기능

### 1. 메인 대시보드 (PRD FR-01, FR-02, FR-03)

- **팀 카드**: 점수/순위 대신 Help/Insight/기여 배지 중심
- **필터/정렬**: 스테이지, 분야, Help 여부로 필터링
- **공동 목표**: 팀 경쟁이 아닌 협력 성과 시각화
- **공지/마감**: D-day 계산 및 우선순위 표시

### 2. 디자인 원칙

- **협력/학습 중심**: 경쟁보다 협력을 강조하는 컬러 팔레트
- **접근성**: WCAG 2.2 준수 (Focus Visible, 대비, 터치 영역)
- **반응형**: 모바일우선 설계
- **프리미엄**: 그라디언트, 애니메이션으로 풍부한 UX

## 🛠️ 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일**: CSS Modules
- **배포**: Vercel (예정)

## 📝 개인정보 보호

- 실명, 연락처, 주소 등 개인정보는 **절대 포함 금지**
- 샘플 데이터는 가상의 정보만 사용
- 업로드 기능에는 "개인정보 체크리스트 게이트" 필수

## 🔗 참고 문서

- [PRD (제품 요구사항)](./docs/PRD.md.md)
- [UX 스펙](./docs/UX.md.md)
- [UI 가이드](./docs/UI.md.md)
- [WCAG 2.2 접근성 권고](https://www.w3.org/TR/WCAG22/)

## 📄 라이선스

MIT

## 👥 기여

현재 개발 중입니다. 문의사항은 이슈로 남겨주세요.
