# 명리연구소 - 토스 앱인토스 미니앱

## 프로젝트 개요
사주 + MBTI 기반 AI 운세 분석 미니앱. 토스 앱 내에서 실행.

- 배포: https://myeongri-lab.vercel.app
- 상태: 앱인토스 승인 완료 (2026-03-30)

## 기술 스택
- **프레임워크**: React 18 + TypeScript 5.6 + Vite
- **UI**: @toss/tds-mobile (토스 디자인 시스템) + Emotion (CSS-in-JS)
- **AI**: OpenAI GPT-4o-mini (운세 생성)
- **미니앱**: @apps-in-toss/web-framework
- **기타**: html2canvas (공유 이미지), 인앱 광고

## 폴더 구조
```
src/
├── screens/        # 페이지 단계별 (InfoStep → MbtiStep → LoadingStep → ResultStep)
├── components/     # UI 컴포넌트 (Hero, ShareSheet, ScoreRing 등)
├── utils/          # saju.ts(사주계산), haptic.ts, lucky.ts
├── hooks/          # useAds.ts (토스 인앱 광고)
├── data/           # fortune-handler.ts, mbtiProfiles.ts
├── api.ts          # OpenAI API 호출 + localStorage 캐싱
├── types.ts        # 중앙 타입 정의
└── App.tsx         # 메인 (상태관리 + 플로우 제어)

server/index.mjs    # 로컬 개발용 API 서버 (포트 8787)
api/fortune.mjs     # Vercel Serverless 함수 (프로덕션)
```

## 앱 플로우
```
InfoStep (이름/생년월일/성별/시진)
  → MbtiStep (선택적)
    → LoadingStep (하이라이트 API 호출)
      → ResultStep (총운/애정/금전/건강 + 공유)
```

## 코딩 규칙

### 필수 규칙
- TypeScript strict 모드
- 스타일링: Emotion CSS-in-JS + TDS 컴포넌트 (Tailwind 사용 안 함)
- 타입은 `src/types.ts`에 중앙 정의
- 컴포넌트 Props는 type으로 정의

### API 패턴
- 2단계 호출: highlight(빠른) → full(백그라운드 프리페치)
- localStorage 일일 캐시 (날짜 바뀌면 자동 삭제)
- 로컬: `http://127.0.0.1:8787/api/fortune`
- 프로덕션: Vercel Serverless (`/api/fortune`)

### 사주 계산
- 프론트에서 천간/지지/오행 기초 계산 → AI 프롬프트에 참고정보로 전달
- 실제 운세 텍스트는 OpenAI가 생성

### 환경변수 (.env)
- `OPENAI_API_KEY` - OpenAI API 키
- `OPENAI_MODEL` - 모델명 (기본: gpt-4o-mini)
- `VITE_API_BASE` - API 기본 URL

## 개발 명령어
```bash
npm install          # 의존성 설치
npm run dev          # Vite + API 서버 동시 실행
npm run dev:web      # Vite만 실행
npm run build        # ait build (앱인토스 빌드)
npm run lint         # ESLint 검사
```

## 배포
- Vercel (프론트 + Serverless API)
- 앱인토스: `ait build` → .ait 파일 생성 → 토스 제출

## 주의사항
- sudo 명령어 사용 금지
- .env 파일 커밋 금지
- 토스 앱인토스 빌드 설정은 `granite.config.ts` 참조
- 광고 ID는 useAds.ts의 AD_IDS 상수에 관리
- OpenAI 프롬프트 수정 시 api/fortune.mjs와 server/index.mjs 양쪽 반영 필요
