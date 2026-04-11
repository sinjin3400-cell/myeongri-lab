import { useState } from 'react';
import { ResultSparkleDecor } from '../components/ResultSparkleDecor';
import { ScoreRing } from '../components/ScoreRing';
import type { FortuneHighlight, FortuneCategory } from '../types';
import type { FortuneTexts } from '../utils/shareUrl';

/** 토스 앱 딥링크 (외부 웹에서 토스 앱 실행) */
const TOSS_APP_SCHEME = 'supertoss://miniapp?appkey=myeongri-lab';
/** 토스 앱 스토어 링크 */
const TOSS_IOS_STORE = 'https://apps.apple.com/kr/app/id839333328';
const TOSS_ANDROID_STORE = 'https://play.google.com/store/apps/details?id=viva.republica.toss';

/** 토스 앱 열기 시도 → 실패 시 스토어로 이동 */
function openTossApp() {
  const isIOS = /iPhone|iPad/i.test(navigator.userAgent);
  const storeUrl = isIOS ? TOSS_IOS_STORE : TOSS_ANDROID_STORE;

  // 딥링크로 토스 앱 열기 시도
  window.location.href = TOSS_APP_SCHEME;

  // 2초 내에 앱이 안 열리면 스토어로 이동
  setTimeout(() => {
    // 앱이 열렸으면 페이지가 blur 상태 → 스토어 이동 안 함
    if (document.hidden) return;
    window.location.href = storeUrl;
  }, 2000);
}

type Props = {
  userName: string;
  highlight: FortuneHighlight;
  texts: FortuneTexts;
  onTryOwn: () => void;
};

const CATEGORY_LABEL: Record<FortuneCategory, { title: string; icon: string }> = {
  overall: { title: '총운', icon: '☀️' },
  love: { title: '애정운', icon: '💕' },
  money: { title: '금전운', icon: '✨' },
  health: { title: '건강운', icon: '🌿' },
};

export function SharedResultView({ userName, highlight, texts, onTryOwn }: Props) {
  const [showMore, setShowMore] = useState(false);

  // 토스 앱 내부인지 확인
  const isInToss = typeof navigator !== 'undefined' &&
    (navigator.userAgent.includes('TossApp') || navigator.userAgent.includes('AppsInToss'));

  const lucky = highlight.lucky;
  const bestLabel = CATEGORY_LABEL[highlight.bestCategory];
  const cautionLabel = CATEGORY_LABEL[highlight.cautionCategory];

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  const hasTexts = texts.overall || texts.love || texts.money || texts.health;

  // 더보기에서 보여줄 나머지 운세 (best/caution 제외)
  const allCategories: FortuneCategory[] = ['overall', 'love', 'money', 'health'];
  const textsMap: Record<FortuneCategory, string | undefined> = {
    overall: texts.overall,
    love: texts.love,
    money: texts.money,
    health: texts.health,
  };

  return (
    <div className="app-page">
      <ResultSparkleDecor />

      {/* 공유 배지 */}
      <div
        className="animate-fade-in"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 20,
          background: 'rgba(201, 169, 98, 0.1)',
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--gold-600)',
        }}
      >
        🔮 {userName}님이 공유한 운세
      </div>

      {/* 헤더 */}
      <header className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--gold-500)', letterSpacing: '0.03em' }}>
          {dateStr} ({dayOfWeek}) · {userName}님의 오늘 운세
        </p>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--navy-700)', lineHeight: 1.3, letterSpacing: '-0.03em' }}>
          ✨ {userName}님의 운세를 구경해보세요
        </h1>
      </header>

      {/* 점수 + 한줄 요약 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, padding: '20px 22px', animationDelay: '0.15s' }}
      >
        <ScoreRing score={highlight.score} size={88} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--navy-700)', lineHeight: 1.4 }}>
            {highlight.summaryLine}
          </p>
        </div>
      </div>

      {/* 행운 정보 */}
      <div
        className="animate-slide-up"
        style={{ display: 'flex', gap: 8, marginBottom: 24, paddingBottom: 4, animationDelay: '0.2s', flexWrap: 'wrap' }}
      >
        <div className="lucky-badge">
          <span className="lucky-color-dot" style={{ background: lucky.colorHex }} />
          행운색: {lucky.color}
        </div>
        <div className="lucky-badge">🔢 행운숫자: {lucky.number}</div>
        <div className="lucky-badge">🧭 행운방향: {lucky.direction}</div>
        <div className="lucky-badge">🍀 행운아이템: {lucky.item}</div>
      </div>

      {/* 하이라이트 미리보기 카드 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        <section
          className="premium-card animate-slide-up"
          style={{ background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)', animationDelay: '0.25s' }}
        >
          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700, background: 'rgba(201, 169, 98, 0.15)', color: 'var(--gold-600)', marginBottom: 10 }}>
            🌟 오늘 가장 좋은 운
          </span>
          <h2 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{bestLabel.icon}</span>
            {bestLabel.title}
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--navy-500)', lineHeight: 1.65 }}>
            {highlight.bestSummary}
          </p>
        </section>

        <section
          className="premium-card animate-slide-up"
          style={{ background: 'linear-gradient(135deg, rgba(232, 98, 124, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)', animationDelay: '0.3s' }}
        >
          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700, background: 'rgba(232, 98, 124, 0.12)', color: '#c4566a', marginBottom: 10 }}>
            🛡️ 오늘 조심할 운
          </span>
          <h2 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{cautionLabel.icon}</span>
            {cautionLabel.title}
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--navy-500)', lineHeight: 1.65 }}>
            {highlight.cautionSummary}
          </p>
        </section>
      </div>

      {/* 더보기 버튼 + 전체 운세 */}
      {hasTexts && !showMore && (
        <button
          className="btn-secondary animate-slide-up"
          onClick={() => setShowMore(true)}
          style={{
            width: '100%',
            marginBottom: 24,
            gap: 8,
            fontSize: 15,
            fontWeight: 600,
            animationDelay: '0.35s',
          }}
        >
          전체 운세 자세히 보기 📖
        </button>
      )}

      {showMore && hasTexts && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--navy-700)' }}>
            📋 {userName}님의 전체 운세
          </p>
          {allCategories.map((cat, i) => {
            const text = textsMap[cat];
            if (!text) return null;
            const label = CATEGORY_LABEL[cat];
            const bgColors = [
              'rgba(201, 169, 98, 0.06)',
              'rgba(232, 98, 124, 0.04)',
              'rgba(91, 141, 239, 0.05)',
              'rgba(56, 176, 126, 0.05)',
            ];
            return (
              <section
                key={cat}
                className="premium-card animate-slide-up"
                style={{
                  background: `linear-gradient(135deg, ${bgColors[i]} 0%, rgba(255, 255, 255, 0.9) 100%)`,
                  animationDelay: `${0.05 * i}s`,
                }}
              >
                <h2 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{label.icon}</span>
                  {label.title}
                </h2>
                <p style={{ margin: 0, fontSize: 15, color: 'var(--navy-500)', lineHeight: 1.65 }}>
                  {text}
                </p>
              </section>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div style={{ gap: 12, display: 'flex', flexDirection: 'column', marginTop: 8, marginBottom: 24 }}>
        <div
          className="premium-card animate-slide-up"
          style={{
            textAlign: 'center',
            padding: '24px 20px',
            background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.06) 0%, rgba(255, 252, 245, 1) 100%)',
            animationDelay: '0.4s',
          }}
        >
          <p style={{ margin: '0 0 6px', fontSize: 28 }}>🔮</p>
          <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--navy-700)' }}>
            나의 운세도 궁금하지 않으세요?
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--navy-400)' }}>
            AI가 사주와 MBTI를 분석해 맞춤 운세를 알려드려요
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              if (isInToss) {
                // 토스 앱 내부 → 앱 내 이동
                onTryOwn();
              } else {
                // 외부 웹 브라우저 → 토스 앱 열기 (없으면 스토어)
                openTossApp();
              }
            }}
            style={{
              width: '100%',
              gap: 8,
              background: 'linear-gradient(135deg, var(--gold-500) 0%, var(--gold-600) 100%)',
              fontSize: 16,
              boxShadow: '0 4px 14px rgba(201, 169, 98, 0.3)',
            }}
          >
            {isInToss ? '나만의 운세 보러가기 ✨' : '토스 앱에서 운세 보기 ✨'}
          </button>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--navy-300)', textAlign: 'center' }}>
          ✨ 명리연구소 — AI 사주 운세
        </p>
      </div>
    </div>
  );
}
