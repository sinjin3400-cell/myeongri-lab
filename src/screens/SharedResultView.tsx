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
  // 토스 앱 내부인지 확인
  const isInToss = typeof navigator !== 'undefined' &&
    (navigator.userAgent.includes('TossApp') || navigator.userAgent.includes('AppsInToss'));

  const bestLabel = CATEGORY_LABEL[highlight.bestCategory];

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  const handleCTA = () => {
    if (isInToss) {
      onTryOwn();
    } else {
      openTossApp();
    }
  };

  // 행운 정보 중 1개만 공개 (나머지 블러)
  const lucky = highlight.lucky;

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

      {/* 점수 + 한줄 요약 (공개) */}
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

      {/* 행운 정보 — 행운색만 공개, 나머지 블러 */}
      <div
        className="animate-slide-up"
        style={{ display: 'flex', gap: 8, marginBottom: 24, paddingBottom: 4, animationDelay: '0.2s', flexWrap: 'wrap' }}
      >
        <div className="lucky-badge">
          <span className="lucky-color-dot" style={{ background: lucky.colorHex }} />
          행운색: {lucky.color}
        </div>
        <div className="lucky-badge" style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>🔢 행운숫자: {lucky.number}</div>
        <div className="lucky-badge" style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>🧭 행운방향: {lucky.direction}</div>
        <div className="lucky-badge" style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>🍀 행운아이템: {lucky.item}</div>
      </div>

      {/* 가장 좋은 운 (공개) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
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
      </div>

      {/* 나머지 운세 블러 처리 (호기심 유발) */}
      <div
        className="animate-slide-up"
        style={{ position: 'relative', marginBottom: 24, animationDelay: '0.3s' }}
      >
        {/* 블러된 카드들 */}
        <div style={{ filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' }}>
          <section
            className="premium-card"
            style={{ background: 'linear-gradient(135deg, rgba(232, 98, 124, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)', marginBottom: 14 }}
          >
            <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700, background: 'rgba(232, 98, 124, 0.12)', color: '#c4566a', marginBottom: 10 }}>
              🛡️ 오늘 조심할 운
            </span>
            <h2 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--navy-700)' }}>
              조심할 운세가 숨겨져 있어요
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--navy-500)', lineHeight: 1.65 }}>
              이 내용은 직접 운세를 확인하면 볼 수 있습니다. 나만의 사주 분석으로 더 정확한 결과를 확인해보세요.
            </p>
          </section>

          {(texts.overall || texts.love) && (
            <section
              className="premium-card"
              style={{ background: 'linear-gradient(135deg, rgba(91, 141, 239, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)' }}
            >
              <h2 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--navy-700)' }}>
                상세 운세 분석
              </h2>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--navy-500)', lineHeight: 1.65 }}>
                총운, 애정운, 금전운, 건강운에 대한 상세한 분석 결과가 준비되어 있습니다. 직접 확인해보세요.
              </p>
            </section>
          )}
        </div>

        {/* 블러 위 잠금 오버레이 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 252, 245, 0.3)',
            borderRadius: 16,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #fff9e6 0%, #fef3cd 40%, #fde68a 100%)',
              borderRadius: 20,
              padding: '20px 28px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(201, 169, 98, 0.25)',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
            }}
          >
            <p style={{ margin: '0 0 4px', fontSize: 24 }}>🔒</p>
            <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#78520a' }}>
              나머지 운세는 직접 확인해보세요!
            </p>
            <button
              className="btn-primary"
              onClick={handleCTA}
              style={{
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--gold-500) 0%, var(--gold-600) 100%)',
                boxShadow: '0 4px 14px rgba(201, 169, 98, 0.4)',
              }}
            >
              {isInToss ? '나도 운세 보기 🔮' : '토스에서 확인하기 🔮'}
            </button>
          </div>
        </div>
      </div>

      {/* 메인 CTA */}
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
          <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--navy-400)' }}>
            AI가 사주와 MBTI를 분석해 맞춤 운세를 알려드려요
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 600, color: 'var(--gold-600)' }}>
            지금 바로 확인하면 최대 1,000원 포인트 지급!
          </p>
          <button
            className="btn-primary"
            onClick={handleCTA}
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

        {/* 궁합 바이럴 CTA */}
        <div
          className="premium-card animate-slide-up"
          style={{
            textAlign: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(232, 98, 124, 0.04) 0%, rgba(255, 245, 247, 1) 100%)',
            animationDelay: '0.45s',
          }}
        >
          <p style={{ margin: '0 0 4px', fontSize: 22 }}>💕</p>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--navy-700)' }}>
            {userName}님과 나의 궁합은?
          </p>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--navy-400)' }}>
            사주 기반 궁합 분석으로 우리 사이를 알아보세요
          </p>
          <button
            className="btn-primary"
            onClick={handleCTA}
            style={{
              width: '100%',
              gap: 8,
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              fontSize: 15,
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.25)',
            }}
          >
            {isInToss ? '궁합 보러가기 💕' : '토스에서 궁합 확인하기 💕'}
          </button>
        </div>

        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--navy-300)', textAlign: 'center' }}>
          ✨ 명리연구소 — AI 사주 운세
        </p>
      </div>
    </div>
  );
}
