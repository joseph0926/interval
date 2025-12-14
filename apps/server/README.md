<img src="https://res.cloudinary.com/dx25hswix/image/upload/v1765754079/icon_r3tu08.png" alt="Interval Logo" width="60" />

# @interval/server

> Interval 백엔드 서버

Fastify + Prisma 기반 REST API 서버

---

## 소개

Interval 백엔드 서버는 사용자 인증, 이벤트 기록, 설정 관리 등 핵심 비즈니스 로직을 처리합니다. `@interval/engine` 패키지를 사용하여 상태 계산 및 유효성 검사를 수행합니다.

---

## 기술 스택

| 영역       | 기술                              | 버전 |
| ---------- | --------------------------------- | ---- |
| Framework  | Fastify                           | 5.6  |
| ORM        | Prisma                            | 7.1  |
| Database   | PostgreSQL                        | -    |
| Validation | Zod                               | 4    |
| Session    | @fastify/session, @fastify/cookie | -    |

---

## 디렉토리 구조

```
src/
├── index.ts                # 서버 진입점
├── app.ts                  # Fastify 앱 설정
├── routes/
│   ├── auth.ts             # 인증 API
│   ├── engine.ts           # 엔진 API (멀티모듈)
│   ├── smoking.ts          # 흡연 기록 API (레거시)
│   ├── settings.ts         # 설정 API
│   ├── report.ts           # 리포트 API
│   ├── onboarding.ts       # 온보딩 API
│   └── gamification.ts     # 게이미피케이션 API
├── services/
│   ├── engine.ts           # 엔진 비즈니스 로직
│   ├── smoking.ts          # 흡연 비즈니스 로직
│   ├── report.ts           # 리포트 로직
│   └── gamification.ts     # 게이미피케이션 로직
├── hooks/
│   └── auth.ts             # 인증 미들웨어
├── lib/                    # 유틸리티
└── prisma/
    └── schema.prisma       # 데이터베이스 스키마
```

---

## 시작하기

### 사전 요구사항

- Node.js 24+
- PostgreSQL

### 환경 설정

```bash
# 환경 변수 설정
cp .env.example .env
```

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/interval
SESSION_SECRET=your-session-secret
```

### 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
pnpm db:gen

# 스키마 푸시 (개발용)
pnpm db:push

# Prisma Studio (DB 관리 UI)
pnpm db:studio
```

### 서버 실행

```bash
# 루트에서 실행
pnpm --filter @interval/server dev

# 또는 이 디렉토리에서
pnpm dev
```

---

## 주요 스크립트

| 명령어           | 설명                        |
| ---------------- | --------------------------- |
| `pnpm dev`       | 개발 서버 실행 (watch mode) |
| `pnpm build`     | TypeScript 빌드             |
| `pnpm start`     | 프로덕션 서버 실행          |
| `pnpm db:gen`    | Prisma 클라이언트 생성      |
| `pnpm db:push`   | 스키마 동기화               |
| `pnpm db:studio` | Prisma Studio 실행          |
| `pnpm typecheck` | 타입 체크                   |

---

## API 명세

### 인증 (`/api/auth`)

| 메서드 | 엔드포인트 | 설명             | 인증   |
| ------ | ---------- | ---------------- | ------ |
| GET    | `/me`      | 현재 사용자 조회 | 선택   |
| POST   | `/guest`   | 게스트 로그인    | 불필요 |
| POST   | `/logout`  | 로그아웃         | 필수   |

### 엔진 (`/api/engine`) - 멀티모듈

| 메서드 | 엔드포인트           | 설명                |
| ------ | -------------------- | ------------------- |
| GET    | `/today`             | 모든 모듈 오늘 요약 |
| POST   | `/events/action`     | 액션 이벤트 생성    |
| POST   | `/events/delay`      | 지연 이벤트 생성    |
| POST   | `/events/adjustment` | 조정 이벤트 생성    |
| GET    | `/report/weekly`     | 주간 리포트         |
| GET    | `/settings`          | 모듈 설정 조회      |
| PUT    | `/settings`          | 모듈 설정 업데이트  |

### 흡연 (`/api/smoking`) - 레거시

| 메서드 | 엔드포인트    | 설명             |
| ------ | ------------- | ---------------- |
| GET    | `/today`      | 오늘 흡연 요약   |
| POST   | `/record`     | 흡연 기록 추가   |
| POST   | `/delay`      | 미루기 분 추가   |
| POST   | `/soft-reset` | 오늘 기록 초기화 |

### 설정 (`/api/settings`)

| 메서드 | 엔드포인트 | 설명             |
| ------ | ---------- | ---------------- |
| GET    | `/`        | 사용자 설정 조회 |
| PATCH  | `/`        | 설정 업데이트    |

### 온보딩 (`/api/onboarding`)

| 메서드 | 엔드포인트  | 설명        |
| ------ | ----------- | ----------- |
| POST   | `/complete` | 온보딩 완료 |

### 리포트 (`/api/report`)

| 메서드 | 엔드포인트 | 설명        |
| ------ | ---------- | ----------- |
| GET    | `/weekly`  | 주간 리포트 |
| GET    | `/streak`  | 연속 기록   |
| GET    | `/insight` | 인사이트    |

### 게이미피케이션 (`/api/gamification`)

| 메서드 | 엔드포인트 | 설명                  |
| ------ | ---------- | --------------------- |
| GET    | `/status`  | 레벨, 배지, 거리 은행 |

---

## 데이터 모델

### User

```prisma
model User {
  id                    String   @id @default(uuid())
  isGuest               Boolean  @default(true)
  nickname              String?
  email                 String?  @unique
  enabledModules        String[] @default(["SMOKING"])
  dayStartTime          String   @default("04:00")
  dayAnchorMinutes      Int      @default(240)
  currentTargetInterval Int      @default(60)
  currentMotivation     String?
  onboardingCompleted   Boolean  @default(false)
  notifyOnTargetTime    Boolean  @default(true)
  notifyMorningDelay    Boolean  @default(false)
  notifyDailyReminder   Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### IntervalEvent

```prisma
model IntervalEvent {
  id             String   @id @default(uuid())
  userId         String
  moduleType     String   // SMOKE, SNS, CAFFEINE, FOCUS
  eventType      String   // ACTION, DELAY, ADJUSTMENT
  timestamp      DateTime
  localDayKey    String   // YYYY-MM-DD
  actionKind     String?
  delayMinutes   Int?
  reasonLabel    String?
  triggerContext String?
  payload        Json?
  createdAt      DateTime @default(now())

  @@index([userId])
  @@index([userId, moduleType])
  @@index([userId, localDayKey])
}
```

### UserModuleSetting

```prisma
model UserModuleSetting {
  id                String  @id @default(uuid())
  userId            String
  moduleType        String
  enabled           Boolean @default(false)
  targetIntervalMin Int     @default(60)
  configJson        Json?

  @@unique([userId, moduleType])
}
```

---

## 배포

Fly.io를 통해 배포됩니다.

```bash
# Fly.io 배포
fly deploy
```
