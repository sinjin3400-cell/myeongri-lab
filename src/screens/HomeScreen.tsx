import { useEffect, useRef, useState } from 'react';
import { haptic } from '../utils/haptic';
import { LogoMark } from '../components/LogoMark';
import { trackEvent } from '../utils/analytics';
import { FortuneIcon, DreamIcon, ZodiacIcon, CompatibilityIcon } from '../components/FeatureIcons';
import { useTossBanner, AD_IDS } from '../hooks/useAds';
import { recordVisit, getDailyZodiacFortunes } from '../utils/streak';
import { usePremiumPass } from '../hooks/usePremiumPass';
import type { AppFeature } from '../types';

type Props = {
  onSelect: (feature: AppFeature) => void;
};

const FEATURES: {
  key: AppFeature;
  icon: React.ReactNode;
  bgIcon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  accentColor: string;
  ready: boolean;
  tag?: string;
  tagSide?: 'left' | 'right';
  tagBg?: string;
}[] = [
  {
    key: 'fortune',
    icon: <FortuneIcon size={36} />,
    bgIcon: <FortuneIcon size={90} />,
    title: '오늘의 사주풀이',
    description: 'AI가 사주와 MBTI를 결합해\n나만의 운세를 풀어드려요',
    gradient: 'linear-gradient(135deg, #1a2744 0%, #2d446c 100%)',
    accentColor: 'var(--gold-500)',
    ready: true,
    tag: 'BEST',
    tagSide: 'right',
    tagBg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
  },
  {
    key: 'dream',
    icon: <DreamIcon size={36} />,
    bgIcon: <DreamIcon size={90} />,
    title: '꿈해몽',
    description: '간밤의 꿈이 알려주는 메시지\n행운의 로또번호까지!',
    gradient: 'linear-gradient(135deg, #2d1b69 0%, #4a2d8a 100%)',
    accentColor: '#a78bfa',
    ready: true,
    tag: 'HOT',
    tagSide: 'right',
    tagBg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
  },
  {
    key: 'zodiac',
    icon: <ZodiacIcon size={36} />,
    bgIcon: <ZodiacIcon size={90} />,
    title: '띠별 운세',
    description: '내 띠로 보는 오늘의 운세\n12간지의 지혜를 만나보세요',
    gradient: 'linear-gradient(135deg, #7c2d12 0%, #b45309 100%)',
    accentColor: '#fbbf24',
    ready: true,
  },
  {
    key: 'compatibility',
    icon: <CompatibilityIcon size={36} />,
    bgIcon: <CompatibilityIcon size={90} />,
    title: '궁합 보기',
    description: '우리 사이 얼마나 잘 맞을까?\n부부·가족·연인 궁합 풀이',
    gradient: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)',
    accentColor: '#fda4af',
    ready: true,
  },
];

export function HomeScreen({ onSelect }: Props) {
  // 하단 배너 광고
  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const bannerRef = useRef<HTMLDivElement>(null);

  // 스트릭 시스템
  const [streakInfo, setStreakInfo] = useState<{ count: number; milestone: number | null }>({ count: 0, milestone: null });
  const [showMilestone, setShowMilestone] = useState(false);
  const { addPasses } = usePremiumPass();

  useEffect(() => {
    const result = recordVisit();
    setStreakInfo({ count: result.count, milestone: result.milestone });
    if (result.milestone) {
      setShowMilestone(true);
      // 마일스톤 보상: 3일 → 황금열람권 1개, 7일 → 3개
      const reward = result.milestone === 3 ? 1 : 3;
      addPasses(reward);
    }
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
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} (${dayNames[today.getDay()]})`;
  const zodiacFortunes = getDailyZodiacFortunes(today);

  return (
    <div className="app-page" style={{ paddingBottom: 40 }}>
      {/* 스트릭 마일스톤 알림 */}
      {showMilestone && streakInfo.milestone && (
        <div
          className="animate-slide-up"
          style={{
            marginBottom: 16,
            padding: '16px 20px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 4px 16px rgba(255, 165, 0, 0.35)',
          }}
        >
          <button
            onClick={() => setShowMilestone(false)}
            style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', fontSize: 16, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
          >✕</button>
          <p style={{ margin: '0 0 4px', fontSize: 24 }}>🔥</p>
          <p style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#fff' }}>
            {streakInfo.milestone}일 연속 방문 달성!
          </p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
            황금 열람권 {streakInfo.milestone === 3 ? 1 : 3}개가 지급되었어요 🎫
          </p>
        </div>
      )}

      {/* 스트릭 뱃지 (2일 이상일 때) */}
      {streakInfo.count >= 2 && !showMilestone && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            padding: '8px 14px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(255,165,0,0.1) 0%, rgba(255,215,0,0.08) 100%)',
            border: '1px solid rgba(255,165,0,0.2)',
          }}
        >
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-700)' }}>
            {streakInfo.count}일 연속 방문 중!
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--navy-400)', marginLeft: 'auto' }}>
            {streakInfo.count < 3 ? `${3 - streakInfo.count}일 더 오면 열람권 🎫` :
             streakInfo.count < 7 ? `${7 - streakInfo.count}일 더 오면 열람권 3개 🎫` :
             '꾸준함이 빛나요!'}
          </span>
        </div>
      )}

      {/* 헤더 */}
      <header
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 8,
        }}
      >
        <LogoMark size={44} />
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--navy-700)',
              letterSpacing: '-0.03em',
            }}
          >
            명리연구소
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--gold-500)',
              letterSpacing: '0.04em',
            }}
          >
            AI 사주 × MBTI 운세
          </p>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            background: 'linear-gradient(135deg, rgba(255,250,230,0.7), rgba(255,243,200,0.5))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 14,
            padding: '7px 12px',
            textAlign: 'center',
            border: '1.5px solid rgba(212, 175, 55, 0.5)',
            boxShadow: '0 4px 16px rgba(212, 175, 55, 0.2), 0 0 8px rgba(250, 220, 50, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--navy-700)', display: 'block', lineHeight: 1.4, opacity: 0.75 }}>
            오늘의 사주 보면
          </span>
          <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--gold-600)', display: 'block', lineHeight: 1.3 }}>
            최대 1,000원 🎁
          </span>
        </div>
      </header>

      {/* 날짜 */}
      <p
        className="animate-fade-in"
        style={{
          margin: '0 0 24px',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--navy-300)',
          animationDelay: '0.05s',
        }}
      >
        📅 {dateStr}
      </p>

      {/* 오늘의 한마디 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{
          marginBottom: 28,
          padding: '20px 22px',
          animationDelay: '0.1s',
        }}
      >
        <p
          style={{
            margin: '0 0 6px',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--gold-600)',
            letterSpacing: '0.06em',
          }}
        >
          ✨ 오늘의 한마디
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--navy-700)',
            lineHeight: 1.55,
            letterSpacing: '-0.01em',
          }}
        >
          {getDailyMessage(today)}
        </p>
      </div>

      {/* 기능 카드 그리드 */}
      <div
        className="stagger-children"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
        }}
      >
        {FEATURES.map((feature) => (
          <button
            key={feature.key}
            type="button"
            onClick={() => {
              haptic();
              trackEvent('home_feature_clicked', { feature: feature.key, ready: feature.ready });
              if (feature.ready) {
                onSelect(feature.key);
              }
            }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '22px 18px',
              background: feature.gradient,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: feature.ready ? 'pointer' : 'default',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left',
              fontFamily: 'inherit',
              minHeight: 160,
              boxShadow: feature.ready
                ? '0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08)'
                : '0 2px 12px rgba(0,0,0,0.08)',
              opacity: feature.ready ? 1 : 0.65,
              overflow: 'hidden',
            }}
          >
            {/* 배경 일러스트 */}
            <div
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                pointerEvents: 'none',
                opacity: 0.12,
              }}
            >
              {feature.bgIcon}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 100%)',
                pointerEvents: 'none',
                borderRadius: 'inherit',
              }}
            />

            {/* 준비 중 태그 */}
            {feature.tag && (
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  ...(feature.tagSide === 'left' ? { left: 10 } : { right: 10 }),
                  padding: '4px 9px',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#fff',
                  background: feature.tagBg || 'rgba(255,255,255,0.18)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  zIndex: 1,
                }}
              >
                {feature.tag}
              </span>
            )}

            {/* 아이콘 */}
            <div
              style={{
                marginBottom: 12,
                filter: feature.ready ? 'none' : 'grayscale(0.3) opacity(0.7)',
              }}
            >
              {feature.icon}
            </div>

            {/* 타이틀 */}
            <p
              style={{
                margin: '0 0 6px',
                fontSize: 17,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {feature.title}
            </p>

            {/* 설명 */}
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
              }}
            >
              {feature.description}
            </p>
          </button>
        ))}
      </div>

      {/* 오늘의 띠별 운세 미리보기 */}
      <div
        className="animate-slide-up"
        style={{ marginTop: 24, animationDelay: '0.3s' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>
            🐲 오늘의 띠별 운세
          </p>
          <button
            onClick={() => { haptic(); onSelect('zodiac'); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--gold-600)',
              padding: '4px 0',
            }}
          >
            전체보기 →
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          {zodiacFortunes.slice(0, 6).map((z) => (
            <button
              key={z.animal}
              type="button"
              onClick={() => { haptic(); onSelect('zodiac'); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '12px 8px',
                background: '#fff',
                border: '1px solid rgba(15,23,42,0.06)',
                borderRadius: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: 22 }}>{z.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy-600)' }}>{z.animal}띠</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--navy-400)', lineHeight: 1.3, textAlign: 'center' }}>
                {z.fortune.length > 12 ? z.fortune.slice(0, 12) + '…' : z.fortune}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 궁합 바이럴 CTA */}
      <div
        className="animate-slide-up"
        style={{ marginTop: 24, animationDelay: '0.35s' }}
      >
        <button
          type="button"
          onClick={() => { haptic(); onSelect('compatibility'); }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '18px 20px',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.06) 0%, rgba(255, 245, 247, 1) 100%)',
            border: '1.5px solid rgba(244, 63, 94, 0.15)',
            borderRadius: 16,
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left',
            boxShadow: '0 2px 12px rgba(244, 63, 94, 0.08)',
          }}
        >
          <span style={{ fontSize: 28 }}>💕</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>
              친구에게 궁합 결과 보내기
            </p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--navy-400)' }}>
              연인·친구·가족과의 궁합을 확인하고 공유해보세요
            </p>
          </div>
          <span style={{ fontSize: 16, color: 'var(--navy-300)' }}>→</span>
        </button>
      </div>

      {/* 하단 안내 */}
      <p
        className="animate-fade-in"
        style={{
          marginTop: 20,
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
          marginTop: 20,
          minHeight: 80,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: bannerReady ? 'none' : '1.5px dashed var(--navy-200, #cbd5e1)',
          borderRadius: 12,
          background: bannerReady ? 'transparent' : 'rgba(0,0,0,0.02)',
          color: 'var(--navy-300)',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {!bannerReady && '🎯 배너 광고 영역 (테스트)'}
      </div>
    </div>
  );
}

/** 날짜 기반 오늘의 한마디 (매일 바뀜) */
function getDailyMessage(date: Date): string {
  const messages = [
    '작은 친절이 큰 행운을 불러오는 하루예요',
    '가까운 사람에게 따뜻한 말 한마디가 큰 복이 됩니다',
    '새로운 만남에 좋은 기운이 감도는 날이에요',
    '마음을 비우면 좋은 기회가 찾아옵니다',
    '오늘은 결단력이 빛나는 날, 망설이지 마세요',
    '주변을 돌아보면 감사할 일이 가득합니다',
    '차분한 마음으로 하루를 시작하면 좋은 일이 생겨요',
    '웃는 얼굴에 복이 온다는 말이 딱 맞는 날이에요',
    '오래된 인연에서 뜻밖의 도움을 받을 수 있어요',
    '작은 변화가 큰 전환점이 될 수 있는 하루예요',
    '오늘 하루 여유를 가지면 내일이 더 밝아집니다',
    '진심을 담은 대화가 관계를 더 깊게 만들어요',
    '자신을 믿으면 길이 열리는 하루예요',
    '소중한 것을 지키는 힘이 생기는 날입니다',
    '마음이 가는 대로 움직이면 좋은 결과가 있어요',
    '오늘은 작은 것에서 행복을 느끼기 좋은 날이에요',
    '기다리던 소식이 찾아올 수 있는 하루예요',
    '나를 위한 시간을 가져보세요, 좋은 에너지가 채워져요',
    '부드러운 말 한마디가 주변을 따뜻하게 합니다',
    '오늘의 노력이 내일의 열매가 되는 날이에요',
    '솔직한 마음이 통하는 하루가 될 거예요',
    '평소와 다른 선택이 행운을 가져다줄 수 있어요',
    '감사하는 마음이 더 큰 복을 부릅니다',
    '오늘은 건강에 신경 쓰면 운도 따라와요',
    '좋은 사람들과 함께하면 기운이 배가 됩니다',
    '지금 하고 있는 일에 집중하면 좋은 성과가 있어요',
    '여유로운 마음이 좋은 기회를 만들어줍니다',
    '오늘 베푼 선행이 며칠 뒤 돌아옵니다',
    '새로운 시작을 위한 좋은 에너지가 가득한 날이에요',
    '가족과 함께하는 시간이 행운을 키워줍니다',
    '오늘은 직감을 믿어도 좋은 날이에요',
  ];
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return messages[dayOfYear % messages.length];
}
