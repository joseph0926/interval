# 간격 (Interval)

> 지금 한 개비 말고, 조금 있다가 한 개비

담배를 끊는 게 아니라, 담배와의 '간격'을 조금씩 벌려주는 심리 타이머 앱

## 구조

```
interval/
├── apps/
│   ├── app/    # React Native (Expo)
│   └── web/    # Next.js
└── docs/
    └── plan.md # 기획서
```

## 기술 스택

- Monorepo: Turborepo + pnpm
- Mobile: React Native 0.81, Expo SDK 54
- Web: Next.js 16, React 19
- DB: PostgreSQL + Prisma
- Style: Tailwind CSS, shadcn/ui

## 시작하기

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 타입 체크
pnpm typecheck
```

## 환경 변수

```bash
# apps/web/.env
DATABASE_URL="postgresql://..."
```
