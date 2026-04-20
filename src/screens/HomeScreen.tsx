import { useEffect, useRef, useState } from 'react';
import { haptic } from '../utils/haptic';
import { LogoMark } from '../components/LogoMark';
import { trackEvent } from '../utils/analytics';
import { FortuneIcon, DreamIcon, ZodiacIcon, CompatibilityIcon } from '../components/FeatureIcons';
import { useTossBanner, AD_IDS } from '../hooks/useAds';
import { recordVisit, getDailyZodiacFortunes, getDailyReward } from '../utils/streak';
import { usePremiumPass } from '../hooks/usePremiumPass';
import { useSubscription } from '../hooks/useSubscription';
import { Toast } from '../components/Toast';
import { DAILY_QUOTES } from '../data/daily-quotes';
import { Analytics } from '@apps-in-toss/web-framework';
import type { AppFeature } from '../types';

type Props = {
  onSelect: (feature: AppFeature) => void;
  onIAP?: () => void;
};

const FEATURES: {
  key: AppFeature;
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  tag?: string;
  tagColor?: string;
}[] = [
  {
    key: 'fortune',
    icon: <FortuneIcon size={36} color="var(--navy-700)" />,
    title: '사주풀이',
    description: '오늘 나의 기운',
    accentColor: 'var(--navy-700)',
    tag: 'BEST',
    tagColor: 'var(--gold-600)',
  },
  {
    key: 'dream',
    icon: <DreamIcon size={36} color="#6b4c9a" />,
    title: '꿈해몽',
    description: '간밤의 메시지',
    accentColor: '#6b4c9a',
    tag: 'HOT',
    tagColor: '#e11d48',
  },
  {
    key: 'zodiac',
    icon: <ZodiacIcon size={36} color="#b45309" />,
    title: '띠별운세',
    description: '12간지의 지혜',
    accentColor: '#b45309',
  },
  {
    key: 'compatibility',
    icon: <CompatibilityIcon size={36} color="#e8627c" />,
    title: '궁합보기',
    description: '우리 사이는',
    accentColor: '#e8627c',
  },
];

function getLastUserName(): string | null {
  try {
    return localStorage.getItem('myeongri_last_name');
  } catch { return null; }
}

export function saveLastUserName(name: string) {
  try {
    if (name.trim()) localStorage.setItem('myeongri_last_name', name.trim());
  } catch { /* noop */ }
}

function getDailyQuote(date: Date) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

function getWeekOfMonth(date: Date): string {
  const weekNames = ['첫째', '둘째', '셋째', '넷째', '다섯째'];
  const week = Math.ceil(date.getDate() / 7) - 1;
  return weekNames[Math.min(week, 4)];
}

export function HomeScreen({ onSelect, onIAP }: Props) {
  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const bannerRef = useRef<HTMLDivElement>(null);

  const [streakInfo, setStreakInfo] = useState<{ count: number; dailyReward: number; actualAdded: number }>({ count: 0, dailyReward: 0, actualAdded: 0 });
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const { addPasses } = usePremiumPass();
  const { isSubscribed } = useSubscription();

  const userName = getLastUserName();

  useEffect(() => {
    const result = recordVisit();
    if (result.isNew && result.dailyReward > 0) {
      const { added, capped } = addPasses(result.dailyReward);
      setStreakInfo({ count: result.count, dailyReward: result.dailyReward, actualAdded: added });
      if (added > 0) setShowDailyReward(true);
      if (capped) {
        setTimeout(() => {
          setToastMsg('🎫 열람권 한도(20개)가 가득 찼어요! 사용 후 다시 받을 수 있어요');
          setToastVisible(true);
        }, 2500);
      }
    } else {
      setStreakInfo({ count: result.count, dailyReward: 0, actualAdded: 0 });
    }
    try { Analytics.impression({ log_name: 'home_view' }); } catch (_) { /* noop */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!bannerReady || !bannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bannerRef.current, {
      theme: 'light',
      tone: 'blackAndWhite',
      variant: 'card',
    });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner]);

  const today = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const monthDay = `${today.getMonth() + 1}월 ${today.getDate()}일 (${dayNames[today.getDay()]})`;
  const weekLabel = `${today.getMonth() + 1}월의 ${getWeekOfMonth(today)} 주`;
  const dailyQuote = getDailyQuote(today);
  const zodiacFortunes = getDailyZodiacFortunes(today);

  return (
    <div className="app-page" style={{ paddingBottom: 40 }}>
      <Toast message={toastMsg} visible={toastVisible} onDone={() => setToastVisible(false)} duration={3000} />

      {/* 헤더 */}
      <header
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
        }}
      >
        <LogoMark size={40} />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--navy-700)', letterSpacing: '-0.03em' }}>
            명리연구소
          </h1>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--gold-500)', letterSpacing: '0.02em' }}>
            AI 사주 × MBTI 운세
          </p>
        </div>
        <button
          onClick={() => { haptic(); onIAP?.(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 12,
            background: isSubscribed
              ? 'linear-gradient(135deg, #1a2744 0%, #2a3a5c 100%)'
              : 'linear-gradient(135deg, #fff9e5 0%, #fef0c2 100%)',
            border: isSubscribed ? '1.5px solid #2a3a5c' : '1.5px solid #e9c768',
            boxShadow: isSubscribed
              ? '0 0 10px rgba(26, 39, 68, 0.25)'
              : '0 0 10px rgba(212, 168, 75, 0.25), 0 2px 6px rgba(212, 168, 75, 0.15)',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 12, fontWeight: 800,
            color: isSubscribed ? '#d4a84b' : '#8a6715',
            letterSpacing: '-0.01em',
          }}
        >
          {isSubscribed ? '🗝️ 황금열쇠' : '🎫 열람권 충전소'}
        </button>
      </header>

      {/* 날짜 + 인사 */}
      <div className="animate-fade-in" style={{ marginBottom: 16, animationDelay: '0.05s' }}>
        <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 500, color: 'var(--navy-300)' }}>
          {monthDay} · {weekLabel}
        </p>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--navy-700)', lineHeight: 1.4, letterSpacing: '-0.02em' }}>
          {userName ? `${userName}님의 하루,` : '오늘 하루,'}<br />
          오늘도 좋은 기운이 흘러요
        </h2>
      </div>

      {/* 연속방문 배너 */}
      {streakInfo.count >= 1 && (() => {
        const dayInCycle = ((streakInfo.count - 1) % 7) + 1;
        const nextReward = getDailyReward(streakInfo.count + 1);
        const isBonusDay = [3, 5, 7].includes(((streakInfo.count) % 7) + 1);
        return (
          <div
            className="animate-slide-up"
            style={{
              marginBottom: 20,
              padding: '14px 16px',
              borderRadius: 16,
              background: 'var(--gold-50)',
              border: '1.5px solid rgba(212, 168, 75, 0.35)',
              boxShadow: '0 0 12px rgba(212, 168, 75, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 100,
              background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
              boxShadow: '0 2px 8px rgba(255,140,0,0.3)',
            }}>
              {streakInfo.count >= 7 ? '🏆' : '🔥'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>
                {streakInfo.count}일 연속 방문 중!
              </p>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--navy-500)' }}>
                {showDailyReward && streakInfo.actualAdded > 0
                  ? `황금 열람권 ${streakInfo.actualAdded}장 획득 🎉`
                  : nextReward >= 2
                    ? `내일 오면 황금 열람권 ${nextReward}장 획득 🎁`
                    : `내일 오면 황금 열람권 ${nextReward}장 획득`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: i < dayInCycle ? '#d4a84b' : 'rgba(212,168,75,0.2)',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>
          </div>
        );
      })()}

      {/* 오늘의 한 줄 — 명리 고전 인용 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{ marginBottom: 24, padding: '18px 20px', animationDelay: '0.1s' }}
      >
        <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'var(--gold-600)', letterSpacing: '0.04em' }}>
          오늘의 한 줄
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: 'var(--navy-700)', lineHeight: 1.55, letterSpacing: '-0.01em' }}>
          {dailyQuote.quote}
        </p>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: 'var(--navy-300)' }}>
          — {dailyQuote.source}, {dailyQuote.category}
        </p>
      </div>

      {/* 기능 카드 2x2 */}
      <div
        className="stagger-children"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}
      >
        {FEATURES.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              haptic();
              trackEvent('home_feature_clicked', { feature: f.key, ready: true });
              try { Analytics.click({ log_name: 'home_feature_select', feature: f.key }); } catch (_) { /* noop */ }
              onSelect(f.key);
            }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '20px 16px',
              background: 'var(--app-surface)',
              border: '1px solid rgba(26, 39, 68, 0.06)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              minHeight: 130,
              boxShadow: 'var(--card-shadow)',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
            }}
          >
            {f.tag && (
              <span style={{
                position: 'absolute',
                top: 10,
                right: 10,
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: '#fff',
                background: f.tagColor,
              }}>
                {f.tag}
              </span>
            )}
            <div style={{ marginBottom: 14 }}>
              {f.icon}
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: 'var(--navy-700)', letterSpacing: '-0.02em' }}>
              {f.title}
            </p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--navy-400)' }}>
              {f.description}
            </p>
          </button>
        ))}
      </div>

      {/* 오늘의 띠별 운세 미리보기 */}
      <div className="animate-slide-up" style={{ marginTop: 24, animationDelay: '0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--navy-700)' }}>
            오늘의 띠별 운세
          </p>
          <button
            onClick={() => { haptic(); onSelect('zodiac'); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--navy-300)',
              padding: '10px 4px', margin: '-6px 0',
            }}
          >
            ← 옆으로 넘겨보세요
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollSnapType: 'x mandatory' }} className="hide-scrollbar">
          {[...zodiacFortunes].sort((a, b) => b.score - a.score).map((z) => (
            <button
              key={z.animal}
              type="button"
              onClick={() => { haptic(); onSelect('zodiac'); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '14px 16px',
                background: '#fff',
                border: '1px solid rgba(26,39,68,0.06)',
                borderRadius: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                minWidth: 90,
                flexShrink: 0,
                scrollSnapAlign: 'start',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy-600)' }}>{z.animal}띠</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold-600)' }}>{z.score ?? '—'}</span>
              <div style={{ width: '100%', height: 4, borderRadius: 2, background: 'rgba(26,39,68,0.06)', overflow: 'hidden' }}>
                <div style={{
                  width: `${z.score ?? 50}%`,
                  height: '100%',
                  borderRadius: 2,
                  background: (z.score ?? 50) >= 80 ? 'var(--gold-500)' : (z.score ?? 50) >= 60 ? 'var(--navy-400)' : 'var(--navy-200)',
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--navy-300)' }}>띠별점수</span>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 안내 */}
      <p
        className="animate-fade-in"
        style={{
          marginTop: 28,
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--navy-200)',
          lineHeight: 1.5,
          animationDelay: '0.4s',
        }}
      >
        동양 철학과 현대 AI가 만나는 곳 ✨
      </p>

      {/* 하단 배너 광고 */}
      <div
        ref={bannerRef}
        style={{
          marginTop: 16,
          minHeight: bannerReady ? 80 : 0,
          borderRadius: 12,
        }}
      />
    </div>
  );
}
