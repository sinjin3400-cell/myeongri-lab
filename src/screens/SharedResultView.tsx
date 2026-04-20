import { SemiCircleGauge } from '../components/SemiCircleGauge';
import type { FortuneHighlight } from '../types';
import type { FortuneTexts } from '../utils/shareUrl';
import { CATEGORY_LABEL } from '../utils/categoryLabel';

const TOSS_DEEP_LINK = 'intoss://myeongri-lab';
const TOSS_IOS_STORE = 'https://apps.apple.com/kr/app/id839333328';
const TOSS_ANDROID_STORE = 'https://play.google.com/store/apps/details?id=viva.republica.toss';

function openTossApp() {
  const isIOS = /iPhone|iPad/i.test(navigator.userAgent);
  const storeUrl = isIOS ? TOSS_IOS_STORE : TOSS_ANDROID_STORE;
  window.location.href = TOSS_DEEP_LINK;
  setTimeout(() => {
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

export function SharedResultView({ userName, highlight, texts, onTryOwn }: Props) {
  const isInToss = typeof navigator !== 'undefined' &&
    (navigator.userAgent.includes('TossApp') || navigator.userAgent.includes('AppsInToss'));

  const bestLabel = CATEGORY_LABEL[highlight.bestCategory];

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  const handleCTA = () => {
    if (isInToss) { onTryOwn(); } else { openTossApp(); }
  };

  const lucky = highlight.lucky;

  return (
    <div className="app-page" style={{ background: 'var(--cream-50)' }}>
      {/* 상단 앱 바 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 0 14px',
        borderBottom: '1px solid rgba(26,39,68,0.04)',
        marginBottom: 16,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--gold-500), var(--gold-600))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>
          🔮
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy-700)' }}>명리연구소</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--gold-600)' }}>친구가 공유한 운세</span>
        </div>
        <button
          onClick={handleCTA}
          style={{
            marginLeft: 'auto', padding: '6px 10px',
            background: 'var(--gold-50)', borderRadius: 8,
            fontSize: 10, fontWeight: 800, color: 'var(--gold-600)',
            letterSpacing: '0.04em', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          APP 열기
        </button>
      </div>

      {/* 헤더 */}
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 16 }}>
        <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 500, color: 'var(--navy-300)' }}>
          {dateStr} ({dayOfWeek})
        </p>
        <h1 style={{
          margin: 0, fontSize: 24, fontWeight: 800,
          color: 'var(--navy-700)', lineHeight: '30.72px',
          letterSpacing: '-0.84px',
        }}>
          💌 {userName}님이 보낸<br/>오늘의 운세
        </h1>
      </div>

      {/* 게이지 카드 */}
      <div
        className="animate-slide-up"
        style={{
          padding: '22px 20px',
          background: 'linear-gradient(180deg, var(--gold-50) 0%, #fff 60%)',
          border: '1px solid rgba(212, 168, 75, 0.22)',
          borderRadius: 22,
          marginBottom: 16,
          boxShadow: '0 1px 2px rgba(26,39,68,0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <SemiCircleGauge score={highlight.score} size={200} label={`${userName}님의 오늘`} />
        </div>
        <div style={{
          marginTop: 8, padding: '12px 14px',
          background: '#fff', borderRadius: 12,
          border: '1px solid rgba(26,39,68,0.08)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-600)', letterSpacing: '0.06em', marginBottom: 4 }}>
            한 줄 요약
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy-700)', lineHeight: 1.5 }}>
            {highlight.summaryLine}
          </div>
        </div>
      </div>

      {/* 행운 뱃지 */}
      <div style={{
        padding: '14px 16px',
        background: '#fff', borderRadius: 16,
        border: '1px solid rgba(26,39,68,0.08)',
        marginBottom: 16,
        boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy-700)', marginBottom: 8 }}>
          오늘의 행운
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <div style={luckyBadge}>
            <span style={{ width: 12, height: 12, borderRadius: 100, background: lucky.colorHex, display: 'inline-block', flexShrink: 0 }} />
            {lucky.color}
          </div>
          <div style={luckyBadge}>숫자 {lucky.number}</div>
          <div style={luckyBadge}>{lucky.direction}</div>
        </div>
      </div>

      {/* 가장 좋은 운 (공개) */}
      <div style={{
        padding: '18px 20px',
        background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)',
        borderRadius: 22,
        border: '1px solid rgba(26,39,68,0.08)',
        marginBottom: 16,
        boxShadow: '0 1px 2px rgba(26,39,68,0.04)',
      }}>
        <span style={{
          display: 'inline-block', padding: '4px 10px', borderRadius: 12,
          fontSize: 12, fontWeight: 700,
          background: 'rgba(201, 169, 98, 0.15)', color: 'var(--gold-600)',
          marginBottom: 10,
        }}>
          오늘 가장 좋은 운
        </span>
        <h2 style={{
          margin: '0 0 8px', fontSize: 17, fontWeight: 700,
          color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 20 }}>{bestLabel.icon}</span>
          {bestLabel.title}
        </h2>
        <p style={{ margin: 0, fontSize: 15, color: 'var(--navy-500)', lineHeight: 1.65 }}>
          {highlight.bestSummary}
        </p>
      </div>

      {/* 나머지 운세 블러 처리 */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' }}>
          <div style={{
            padding: '18px 20px', borderRadius: 22,
            background: 'linear-gradient(135deg, rgba(232, 98, 124, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: '1px solid rgba(26,39,68,0.08)', marginBottom: 14,
          }}>
            <span style={{
              display: 'inline-block', padding: '4px 10px', borderRadius: 12,
              fontSize: 12, fontWeight: 700,
              background: 'rgba(232, 98, 124, 0.12)', color: '#c4566a', marginBottom: 10,
            }}>
              오늘 조심할 운
            </span>
            <h2 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--navy-700)' }}>
              조심할 운세가 숨겨져 있어요
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--navy-500)', lineHeight: 1.65 }}>
              이 내용은 직접 운세를 확인하면 볼 수 있습니다. 나만의 사주 분석으로 더 정확한 결과를 확인해보세요.
            </p>
          </div>

          {(texts.overall || texts.love) && (
            <div style={{
              padding: '18px 20px', borderRadius: 22,
              background: 'linear-gradient(135deg, rgba(91, 141, 239, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: '1px solid rgba(26,39,68,0.08)',
            }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--navy-700)' }}>
                상세 운세 분석
              </h2>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--navy-500)', lineHeight: 1.65 }}>
                총운, 애정운, 금전운, 건강운에 대한 상세한 분석 결과가 준비되어 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* 잠금 오버레이 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255, 252, 245, 0.3)', borderRadius: 16,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff9e6 0%, #fef3cd 40%, #fde68a 100%)',
            borderRadius: 20, padding: '20px 28px', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(201, 169, 98, 0.25)',
            border: '1.5px solid rgba(212, 175, 55, 0.4)',
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 24 }}>🔒</p>
            <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#78520a' }}>
              나머지 운세는 직접 확인해보세요!
            </p>
            <button
              onClick={handleCTA}
              style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 700,
                background: 'linear-gradient(135deg, var(--gold-500) 0%, var(--gold-600) 100%)',
                boxShadow: '0 4px 14px rgba(201, 169, 98, 0.4)',
                color: '#fff', border: 'none', borderRadius: 14,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {isInToss ? '나도 운세 보기' : '토스에서 확인하기'}
            </button>
          </div>
        </div>
      </div>

      {/* CTA 블록 — navy gradient */}
      <div style={{
        padding: '18px 20px', borderRadius: 18,
        background: 'linear-gradient(135deg, var(--navy-700), var(--navy-600))',
        color: '#fff', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            🔮
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>나도 오늘의 운세 보기</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(244,228,188,0.7)', marginTop: 2 }}>
              AI 사주 × MBTI, 토스에서 무료
            </div>
          </div>
        </div>
        <button
          onClick={handleCTA}
          style={{
            width: '100%', padding: '14px 16px', fontSize: 14, fontWeight: 700,
            background: 'linear-gradient(135deg, var(--gold-500) 0%, var(--gold-400) 100%)',
            color: '#fff', border: 'none', borderRadius: 14,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 6px 20px rgba(212, 168, 75, 0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          내 운세도 풀어보기 <span style={{ color: '#e0be70' }}>&rarr;</span>
        </button>
      </div>

      <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--navy-300)', textAlign: 'center' }}>
        명리연구소 — AI 사주 운세
      </p>
    </div>
  );
}

const luckyBadge: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 12px', borderRadius: 20,
  background: 'var(--cream-100)', fontSize: 12,
  fontWeight: 600, color: 'var(--navy-600)',
};
