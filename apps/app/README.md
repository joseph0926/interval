# 간격 - App

React Native (Expo) 기반 모바일 애플리케이션

## 기술 스택

- Expo SDK 54
- React Native 0.81
- Expo Router 6
- Expo Notifications
- Expo Secure Store

## 시작하기

```bash
# 루트에서 실행
pnpm dev --filter=app

# 또는 이 디렉토리에서
pnpm start
```

## 디렉토리 구조

```
app/
├── app/           # 페이지 (Expo Router)
│   └── (tabs)/    # 탭 네비게이션
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
