<img src="https://res.cloudinary.com/dx25hswix/image/upload/v1765754079/icon_r3tu08.png" alt="Interval Logo" width="60" />

# @interval/app

> Interval 모바일 앱

React Native (Expo) 기반 iOS/Android 애플리케이션

---

## 소개

Interval 모바일 앱은 WebView를 통해 웹 클라이언트를 렌더링하고, 네이티브 기능(푸시 알림, 진동 피드백 등)을 브릿지를 통해 제공합니다.

### 주요 화면

- **홈**: 오늘의 간격 상태, 모듈 카드, CTA
- **리포트**: 통계 및 인사이트
- **설정**: 하루 기준 시간, 알림, 모듈 설정

### 핵심 기능

- 목표 간격 / 실제 간격 비교
- Delay Minutes (미룬 시간) 누적
- 거리 은행 (일/주/전체)
- 30초 멈춤 코칭 모드
- 레벨/배지 시스템
- 푸시 알림

---

## 기술 스택

| 영역      | 기술                    | 버전   |
| --------- | ----------------------- | ------ |
| Framework | React Native            | 0.81   |
| Platform  | Expo                    | SDK 54 |
| Routing   | Expo Router             | 6      |
| Animation | React Native Reanimated | 4      |
| Push      | Expo Notifications      | -      |
| Storage   | Expo Secure Store       | -      |
| WebView   | react-native-webview    | 13     |

---

## 디렉토리 구조

```
app/
├── app/                    # Expo Router (파일 기반 라우팅)
│   ├── _layout.tsx         # 루트 레이아웃
│   ├── index.tsx           # 메인 화면 (WebView)
│   └── onboarding.tsx      # 온보딩 화면
├── components/
│   ├── WebViewScreen.tsx   # WebView 래퍼
│   └── ErrorBoundary.tsx   # 에러 바운더리
├── lib/
│   ├── bridge/             # WebView-Native 브릿지
│   ├── notifications.ts    # 푸시 알림
│   ├── haptics.ts          # 진동 피드백
│   └── storage.ts          # 보안 저장소
├── hooks/
│   └── useSession.ts       # 세션 관리
└── assets/                 # 이미지, 폰트
```

---

## 시작하기

### 사전 요구사항

- Node.js 24+
- Expo CLI
- iOS: Xcode (시뮬레이터)
- Android: Android Studio (에뮬레이터)

### 개발 서버 실행

```bash
# 루트에서 실행
pnpm --filter @interval/app dev

# 또는 이 디렉토리에서
pnpm dev
```

### 플랫폼별 실행

```bash
# iOS 시뮬레이터
pnpm ios

# Android 에뮬레이터
pnpm android

# 웹 (테스트용)
pnpm web
```

---

## 주요 스크립트

| 명령어           | 설명                    |
| ---------------- | ----------------------- |
| `pnpm dev`       | Expo 개발 서버 실행     |
| `pnpm ios`       | iOS 시뮬레이터 실행     |
| `pnpm android`   | Android 에뮬레이터 실행 |
| `pnpm prebuild`  | 네이티브 프로젝트 생성  |
| `pnpm lint`      | ESLint 실행             |
| `pnpm typecheck` | 타입 체크               |

---

## WebView-Native 브릿지

모바일 앱은 WebView와 네이티브 간 통신을 위한 브릿지를 제공합니다.

### WebView -> Native 액션

| 액션                              | 설명                           |
| --------------------------------- | ------------------------------ |
| `NAVIGATE`                        | 페이지 네비게이션              |
| `SMOKING_RECORDED`                | 습관 기록 완료 (알림 재스케줄) |
| `REQUEST_NOTIFICATION_PERMISSION` | 알림 권한 요청                 |
| `SCHEDULE_TARGET_NOTIFICATION`    | 목표 시간 알림 스케줄          |
| `HAPTIC_FEEDBACK`                 | 진동 피드백                    |
| `ONBOARDING_COMPLETE`             | 온보딩 완료                    |

### Native -> WebView 응답

| 응답                             | 설명             |
| -------------------------------- | ---------------- |
| `NOTIFICATION_PERMISSION_RESULT` | 권한 결과        |
| `NOTIFICATION_SCHEDULED`         | 알림 스케줄 결과 |
| `SMOKING_RECORDED_ACK`           | 습관 기록 확인   |

---

## 빌드 및 배포

### EAS Build

```bash
# 개발 빌드
eas build --profile development

# 프리뷰 빌드
eas build --profile preview

# 프로덕션 빌드
eas build --profile production
```

### 스토어 제출

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

---

## 앱 정보

| 항목              | 값                    |
| ----------------- | --------------------- |
| Package (Android) | com.intervalapp.habit |
| Bundle ID (iOS)   | com.intervalapp.habit |
| Version           | 1.0.2                 |
