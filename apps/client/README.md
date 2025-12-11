# 간격 - Web Client

> **"지금 당장 말고, 조금 있다가."**

React + Vite 기반 웹 클라이언트

## 소개

간격 웹 클라이언트는 모바일 앱과 동일한 "간격 엔진" 위에서 동작하는 웹 버전입니다.
Local-first 아키텍처를 통해 오프라인에서도 원활하게 작동합니다.

### 간격 엔진 핵심 개념

- **Target Interval** - 목표 간격 ("최소 이만큼은 벌려보고 싶다")
- **Actual Interval** - 실제 간격 (직전 행동과 지금 사이의 시간)
- **Delay Minutes** - 미룬 시간 (충동을 조금이라도 미룬 시간)
- **거리 통장** - Delay Minutes 누적 (오늘/이번 주/누적)

## 기술 스택

| 영역       | 기술                                |
| ---------- | ----------------------------------- |
| Framework  | React 19, Vite 7                    |
| Routing    | React Router 7                      |
| UI         | Tailwind CSS 4, shadcn/ui, Radix UI |
| Animation  | Motion (Framer Motion)              |
| 상태관리   | Firsttx (Local-first)               |
| Validation | Zod 4                               |
| HTTP       | Axios                               |

## 시작하기

```bash
# 루트에서 실행
pnpm dev --filter=client

# 또는 이 디렉토리에서
pnpm dev

# 빌드
pnpm build

# 프리뷰
pnpm preview

# 린트
pnpm lint
```

## 디렉토리 구조

```
src/
├── components/    # UI 컴포넌트 (shadcn/ui 기반)
├── layouts/       # 레이아웃 컴포넌트
├── pages/         # 페이지 컴포넌트
├── lib/           # 유틸리티 및 헬퍼
├── models/        # 데이터 모델
├── types/         # TypeScript 타입 정의
├── routes.tsx     # 라우팅 설정
└── main.tsx       # 앱 진입점
```

## 환경 변수

```bash
# .env
VITE_SERVER_URL=""
```

## UI 컴포넌트

[shadcn/ui](https://ui.shadcn.com/) 기반으로 구성되어 있습니다.
컴포넌트 추가 시:

```bash
npx shadcn@latest add [component-name]
```
