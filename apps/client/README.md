<img src="https://res.cloudinary.com/dx25hswix/image/upload/v1765754079/icon_r3tu08.png" alt="Interval Logo" width="60" />

# @interval/client

> Interval 웹 클라이언트

React + Vite 기반 웹 애플리케이션

---

## 소개

Interval 웹 클라이언트는 모바일 앱과 동일한 핵심 엔진(`@interval/engine`) 위에서 동작합니다. Local-first 아키텍처를 통해 오프라인에서도 원활하게 작동하며, 모바일 WebView에서도 사용됩니다.

### 핵심 개념

- **Target Interval**: 목표 간격 (최소 이만큼 벌려보고 싶은 시간)
- **Actual Interval**: 실제 간격 (직전 행동과 현재 사이의 시간)
- **Delay Minutes**: 충동을 미룬 시간
- **거리 은행**: Delay Minutes 누적 (오늘/이번 주/전체)

---

## 기술 스택

| 영역       | 기술                              | 버전 |
| ---------- | --------------------------------- | ---- |
| Framework  | React                             | 19   |
| Bundler    | Vite                              | 7    |
| Routing    | React Router                      | 7    |
| UI         | Tailwind CSS, Radix UI, shadcn/ui | 4    |
| Animation  | Motion (Framer Motion)            | 12   |
| 상태관리   | Firsttx (Local-first)             | -    |
| Validation | Zod                               | 4    |
| HTTP       | Axios                             | -    |

---

## 디렉토리 구조

```
src/
├── main.tsx                # 앱 진입점
├── routes.tsx              # React Router 설정
├── pages/
│   ├── home.page.tsx       # 홈 페이지
│   ├── onboarding.page.tsx # 온보딩 페이지
│   ├── report.page.tsx     # 리포트 페이지
│   └── settings.page.tsx   # 설정 페이지
├── components/
│   ├── ui/                 # shadcn/ui 기본 컴포넌트
│   ├── home/               # 홈 관련 컴포넌트
│   ├── settings/           # 설정 관련 컴포넌트
│   ├── module/             # 모듈 관련 컴포넌트
│   ├── report/             # 리포트 관련 컴포넌트
│   └── onboarding/         # 온보딩 관련 컴포넌트
├── layouts/
│   ├── root.layout.tsx     # 루트 레이아웃 (토스트)
│   └── main.layout.tsx     # 메인 레이아웃 (네비게이션)
├── lib/                    # 유틸리티 함수
├── types/                  # 타입 정의
└── constants/              # 상수 정의
```

---

## 시작하기

```bash
# 루트에서 실행
pnpm --filter @interval/client dev

# 또는 이 디렉토리에서
pnpm dev
```

### 주요 스크립트

| 명령어         | 설명                 |
| -------------- | -------------------- |
| `pnpm dev`     | 개발 서버 실행       |
| `pnpm build`   | 프로덕션 빌드        |
| `pnpm preview` | 빌드 결과물 미리보기 |
| `pnpm lint`    | ESLint 실행          |

---

## 환경 변수

```bash
# .env
VITE_SERVER_URL=http://localhost:3000
```

---

## 화면 구조

### 레이아웃 계층

```
RootLayout (토스트 알림)
  └── MainLayout (하단 네비게이션)
        ├── HomePage      # /
        ├── ReportPage    # /report
        └── SettingsPage  # /settings
```

### 하단 네비게이션

```
┌─────────┬─────────┬─────────┐
│   홈    │  리포트  │   설정   │
└─────────┴─────────┴─────────┘
```

---

## UI 컴포넌트

[shadcn/ui](https://ui.shadcn.com/) 기반으로 구성되어 있습니다.

```bash
# 컴포넌트 추가
npx shadcn@latest add [component-name]
```

### 사용 중인 Radix UI 컴포넌트

- Dialog
- Alert Dialog
- Slider
- Switch
- Progress
- Label

---

## 배포

Vercel을 통해 배포됩니다.
