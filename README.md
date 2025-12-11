# 간격 (Interval)

> **"지금 당장 말고, 조금 있다가."**

직장인의 하루 곳곳에서 '충동'과 '행동' 사이에 심리적 간격을 만들어주는 라이프 OS 앱

## 서비스 소개

**간격**은 담배, SNS, 커피, 딴짓 같은 '지금 당장' 하고 싶은 충동에 딱 몇 분의 심리적 간격을 만들어줍니다.

- **완전한 금지가 아닌 "조금 미루기"를 인정**
- **충동이 올라오는 그 순간에 개입하는 실시간 코치**
- **비난 없는 자기 관찰로 심리적 안전감 제공**

### 핵심 모듈

| 모듈         | 설명                                     |
| ------------ | ---------------------------------------- |
| 🚬 담배 간격 | "지금 한 개비 말고, 조금 있다가 한 개비" |
| 📱 SNS 간격  | "지금 스크롤 말고, 조금 있다가 스크롤"   |
| 💼 집중 간격 | "지금 딴짓 말고, 10분만 더 집중"         |
| ☕ 커피 간격 | "지금 커피 말고, 조금 있다가 커피"       |

## 프로젝트 구조

```
interval/
├── apps/
│   ├── app/      # React Native (Expo) 모바일 앱
│   └── client/   # React + Vite 웹 클라이언트
└── docs/         # 기획서 및 문서
```

## 기술 스택

| 영역       | 기술                                        |
| ---------- | ------------------------------------------- |
| Monorepo   | Turborepo + pnpm                            |
| Mobile     | React Native 0.81, Expo SDK 54, Expo Router |
| Web        | React 19, Vite, React Router                |
| UI         | Tailwind CSS 4, shadcn/ui, Radix UI         |
| 상태관리   | Firsttx (Local-first)                       |
| Validation | Zod                                         |

## 시작하기

```bash
# 의존성 설치
pnpm install

# 전체 개발 서버 실행
pnpm dev

# 개별 앱 실행
pnpm dev --filter=app      # 모바일 앱
pnpm dev --filter=client   # 웹 클라이언트

# 빌드
pnpm build

# 타입 체크
pnpm typecheck

# 린트 & 포맷
pnpm lint
pnpm format
```

## 환경 변수

```bash
# apps/client/.env
VITE_SERVER_URL=""
```

## 기획 문서

- [전체 기획서](docs/temp.md) - 서비스 비전, 모듈별 상세 기획
- [아이디어 요약](docs/temp.02.md) - 문제 정의, 타깃 유저, 핵심 가설

## 라이선스

Private
