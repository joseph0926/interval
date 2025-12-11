# 간격 - Mobile App

> **"지금 당장 말고, 조금 있다가."**

React Native (Expo) 기반 모바일 애플리케이션

## 앱 소개

간격 앱은 직장인의 담배, SNS, 커피, 딴짓 같은 충동에 심리적 간격을 만들어주는 앱입니다.

### 주요 화면

- **[오늘]** - 오늘의 간격 상태, 모듈 카드, CTA
- **[리포트]** - 도메인별/통합 통계 & 한 줄 코치
- **[설정]** - 하루 기준 시간, 알림, 모듈 on/off, 계정

### 핵심 기능

- 목표 간격 / 실제 간격 비교
- Delay Minutes (미룬 시간) 누적
- 거리 통장 (일/주/전체)
- 30초 멈춤 코칭 모드
- 레벨/배지 시스템
- 복귀 플로우 (기록 놓침 대응)

## 기술 스택

| 영역      | 기술                           |
| --------- | ------------------------------ |
| Framework | React Native 0.81, Expo SDK 54 |
| Routing   | Expo Router 6                  |
| Animation | React Native Reanimated        |
| Push      | Expo Notifications             |
| Storage   | Expo Secure Store              |

## 시작하기

```bash
# 루트에서 실행
pnpm dev --filter=app

# 또는 이 디렉토리에서
pnpm start

# iOS 시뮬레이터
pnpm ios

# Android 에뮬레이터
pnpm android
```

## 디렉토리 구조

```
app/
├── app/           # 페이지 (Expo Router)
│   ├── (tabs)/    # 탭 네비게이션 (오늘, 리포트, 설정)
│   ├── index.tsx  # 진입점
│   └── onboarding.tsx  # 온보딩 플로우
├── components/    # UI 컴포넌트
├── hooks/         # 커스텀 훅
├── lib/           # 유틸리티
└── assets/        # 이미지, 폰트
```

## 빌드

```bash
# 개발 빌드
eas build --profile development

# 프리뷰 빌드
eas build --profile preview

# 프로덕션 빌드
eas build --profile production
```

## 앱 정보

- Package: com.intervalapp.smoking
- Bundle ID: com.intervalapp.smoking
