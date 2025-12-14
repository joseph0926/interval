<img src="https://res.cloudinary.com/dx25hswix/image/upload/v1765754079/icon_r3tu08.png" alt="Interval Logo" width="80" />

# Interval (간격)

> "지금 당장 말고, 조금 있다가."

충동과 실제 행동 사이에 심리적 간격을 만들어주는 습관 관리 앱

---

## 소개

**Interval**은 담배, SNS, 카페인 등 다양한 행동 습관을 추적하고, 충동이 일어났을 때 바로 행동하지 않고 잠시 미루는 습관을 형성하도록 돕습니다.

### 핵심 컨셉

- **간격 만들기**: 충동과 행동 사이에 시간 간격 형성
- **거리 은행**: 미룬 시간을 시각화하여 성취감 제공
- **게이미피케이션**: 레벨, 배지, 연속 기록으로 동기부여

### 지원 모듈

| 모듈     | 설명                 | 타입      |
| -------- | -------------------- | --------- |
| SMOKE    | 담배 흡연 추적       | 간격 기반 |
| SNS      | 소셜미디어 사용 추적 | 간격 기반 |
| CAFFEINE | 카페인 섭취 추적     | 간격 기반 |
| FOCUS    | 집중 세션 추적       | 세션 기반 |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Monorepo                              │
│                   (Turborepo + pnpm)                        │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│  apps/app   │ apps/client │ apps/server │ packages/engine  │
│  (Mobile)   │   (Web)     │  (Backend)  │  (Core Logic)    │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ React Native│   React     │   Fastify   │   TypeScript     │
│ Expo SDK 54 │  Vite 7     │  Prisma ORM │   Zod Schemas    │
│ Expo Router │React Router │ PostgreSQL  │   Pure Functions │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

---

## 기술 스택

| 영역          | 기술                              | 버전            |
| ------------- | --------------------------------- | --------------- |
| Monorepo      | Turborepo, pnpm                   | 2.6, 10.24      |
| Runtime       | Node.js                           | 24              |
| 언어          | TypeScript                        | 5.9             |
| 웹 클라이언트 | React, Vite, React Router         | 19, 7, 7        |
| 모바일        | React Native, Expo, Expo Router   | 0.81, SDK 54, 6 |
| 백엔드        | Fastify, Prisma, PostgreSQL       | 5.6, 7.1        |
| 상태관리      | Firsttx (Local-first)             | -               |
| UI            | Tailwind CSS, Radix UI, shadcn/ui | 4               |
| 유효성 검사   | Zod                               | 4               |

---

## 프로젝트 구조

```
interval/
├── apps/
│   ├── app/                 # React Native 모바일 앱
│   ├── client/              # React 웹 클라이언트
│   └── server/              # Fastify 백엔드 서버
├── packages/
│   └── interval-engine/     # 핵심 비즈니스 로직
├── docs/                    # 문서
├── turbo.json               # Turborepo 설정
├── pnpm-workspace.yaml      # 워크스페이스 설정
└── tsconfig.base.json       # 기본 TypeScript 설정
```

---

## 시작하기

### 사전 요구사항

- Node.js 24+
- pnpm 10.24+
- PostgreSQL (서버 실행 시)

### 설치

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp apps/server/.env.example apps/server/.env
# .env 파일에 DATABASE_URL 등 설정
```

### 개발 서버 실행

```bash
# 전체 워크스페이스 개발 모드
pnpm dev

# 개별 앱 실행
pnpm --filter @interval/client dev   # 웹 클라이언트
pnpm --filter @interval/server dev   # 백엔드 서버
pnpm --filter @interval/app dev      # 모바일 앱
```

### 빌드

```bash
# 전체 빌드
pnpm build

# 타입 체크
pnpm typecheck
```

---

## 주요 스크립트

| 명령어           | 설명                   |
| ---------------- | ---------------------- |
| `pnpm dev`       | 개발 서버 실행         |
| `pnpm build`     | 프로덕션 빌드          |
| `pnpm typecheck` | 타입 체크              |
| `pnpm lint`      | ESLint 실행            |
| `pnpm format`    | Prettier 포맷팅        |
| `pnpm db:gen`    | Prisma 클라이언트 생성 |

---

## 환경 변수

### apps/client

```bash
VITE_SERVER_URL=http://localhost:3000
```

### apps/server

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/interval
SESSION_SECRET=your-session-secret
```

---

## 배포

| 앱            | 플랫폼                            |
| ------------- | --------------------------------- |
| 백엔드        | Fly.io                            |
| 웹 클라이언트 | Vercel                            |
| 모바일        | App Store / Play Store (Expo EAS) |

---

## 라이선스

ISC
