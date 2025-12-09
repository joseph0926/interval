# 간격 - Web

Next.js 기반 웹 애플리케이션

## 기술 스택

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui
- Prisma + PostgreSQL
- Zod

## 시작하기

```bash
# 루트에서 실행
pnpm dev --filter=web

# 또는 이 디렉토리에서
pnpm dev
```

## 환경 변수

```bash
# .env
DATABASE_URL="postgresql://..."
```

## 디렉토리 구조

```
web/
├── app/           # 페이지 (App Router)
├── components/    # UI 컴포넌트
├── actions/       # Server Actions
├── lib/
│   ├── dal/       # Data Access Layer
│   └── session.ts # 세션 관리
├── prisma/        # DB 스키마
└── public/        # 정적 파일
```

## 주요 스크립트

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm db:gen       # Prisma 클라이언트 생성
pnpm db:push      # 스키마 동기화
pnpm db:migrate   # 마이그레이션
```
