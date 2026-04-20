import { useState, useCallback, useEffect, useRef } from 'react';
import { haptic } from '../utils/haptic';
import { NavBackButton } from '../components/NavBackButton';
import { FloatingHomeButton } from '../components/FloatingHomeButton';
import { ResultSparkleDecor } from '../components/ResultSparkleDecor';
import { SemiCircleGauge } from '../components/SemiCircleGauge';
import { ShareSheet } from '../components/ShareSheet';
import type { FortuneResult, FortuneHighlight, FortunePeriod, FortuneCategory } from '../types';
import type { MbtiType } from '../api';
import { MBTI_PROFILES } from '../data/mbtiProfiles';
import { mergeLucky } from '../utils/lucky';
import { useTossBanner, useInterstitialAd, AD_IDS } from '../hooks/useAds';
import { usePromotion } from '../hooks/usePromotion';
import { trackFullFortuneClicked, trackFortuneCardExpanded, trackShareButtonClicked, trackRewardGranted } from '../utils/analytics';
import { Analytics } from '@apps-in-toss/web-framework';
import { usePremiumPass } from '../hooks/usePremiumPass';
import { useSubscription } from '../hooks/useSubscription';
import { PurchaseSheet } from '../components/PurchaseSheet';
import { Toast } from '../components/Toast';

type Props = {
  highlight: FortuneHighlight;
  fullResult: FortuneResult | null;
  onLoadFull: () => Promise<void>;
  userName: string;
  mbti: MbtiType | null;
  period: FortunePeriod;
  onChangePeriod: (p: FortunePeriod) => void;
  onRestart: () => void;
  onTomorrow: () => void;
  onGoDream?: () => void;
  onIAP?: () => void;
};

type CategoryInfo = {
  key: FortuneCategory;
  title: string;
  icon: string;
  score: number;
  color: string;
};

function deriveCategoryScores(
  overall: number,
  bestCat: FortuneCategory,
  cautionCat: FortuneCategory,
): CategoryInfo[] {
  const base: { key: FortuneCategory; title: string; icon: string; color: string }[] = [
    { key: 'overall', title: '총운', icon: '☀️', color: '#d4a84b' },
    { key: 'love', title: '애정운', icon: '💕', color: '#d1577a' },
    { key: 'money', title: '금전운', icon: '✨', color: '#4b7ba5' },
    { key: 'health', title: '건강운', icon: '🌿', color: '#5a9a7a' },
  ];

  const day = new Date().getDate();
  return base.map((b, i) => {
    let score: number;
    if (b.key === bestCat) {
      score = Math.min(95, overall + 8 + (day % 5));
    } else if (b.key === cautionCat) {
      score = Math.max(40, overall - 12 - (day % 7));
    } else {
      const offset = ((day * 3 + i * 7) % 11) - 5;
      score = Math.max(45, Math.min(90, overall + offset));
    }
    return { ...b, score };
  });
}

function MiniScoreRing({ score, color, size = 40 }: { score: number; color: string; size?: number }) {
  const sw = 4;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef1f7" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color: 'var(--navy-700)', fontFeatureSettings: '"tnum"',
      }}>
        {score}
      </span>
    </div>
  );
}

function DetailCard({
  cat,
  summary,
  detail,
  badge,
  locked,
  onUnlock,
  unlocking,
}: {
  cat: CategoryInfo;
  summary: string;
  detail?: string;
  badge?: { text: string; bg: string; color: string } | null;
  locked: boolean;
  onUnlock?: () => void;
  unlocking?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!detail;

  if (locked) {
    return (
      <section className="premium-card" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', minHeight: 260, padding: '18px 20px' }} onClick={onUnlock}>
        {/* 제목 영역 — 블러 없이 노출 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, position: 'relative', zIndex: 2 }}>
          <div style={{ width: 4, height: 16, background: 'var(--gold-500)', borderRadius: 100 }} />
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy-700)' }}>{cat.title} 상세</div>
        </div>
        {/* 내용 영역 — 약한 블러 */}
        <div style={{ filter: 'blur(2.5px)', pointerEvents: 'none', userSelect: 'none' }}>
          <p style={{ margin: '0 0 14px', fontSize: 14, color: 'var(--navy-500)', lineHeight: 1.7 }}>
            오늘의 {cat.title}에는 특별한 기운이 감지되고 있어요. 당신의 사주와 오행이 만들어내는 독특한 흐름을 확인해보세요. 주변 환경의 변화에 민감하게 반응하는 하루가 될 거예요.
          </p>
          <div style={{ borderTop: '1px solid rgba(26,39,68,0.06)', paddingTop: 14 }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--navy-400)', lineHeight: 1.7 }}>
              자세한 운세 내용과 실천 조언이 준비되어 있어요. 잠금을 해제하고 오늘 하루를 더 잘 준비해보세요. 작은 행동 하나가 큰 변화의 시작점이 될 수 있어요. 평소와 다른 선택이 뜻밖의 결과를 가져올 수 있습니다.
            </p>
          </div>
        </div>
        {/* 열람 버튼 오버레이 — 카드 정중앙 */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 40, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.7) 55%, rgba(255,255,255,0.35) 100%)',
        }}>
          <div style={{
            padding: '13px 30px', borderRadius: 14,
            background: 'var(--navy-700)',
            color: '#fff', fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(26,39,68,0.22)',
            opacity: unlocking ? 0.7 : 1,
            letterSpacing: '-0.01em',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#fff" strokeWidth="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {unlocking ? '열람 중...' : '운세 열람하기'}
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--navy-400)', fontWeight: 500 }}>
            열람권 1장 또는 광고 시청
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`premium-card ${open ? 'active' : ''}`}
      style={{ cursor: hasDetail ? 'pointer' : 'default', padding: '18px 20px' }}
      onClick={() => { if (hasDetail) { haptic(); if (!open) trackFortuneCardExpanded(cat.key); setOpen(!open); } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 4, height: 16, background: 'var(--gold-500)', borderRadius: 100 }} />
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy-700)' }}>{cat.title} 상세</div>
        {badge && (
          <span style={{
            marginLeft: 'auto', padding: '2px 8px', borderRadius: 6,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
            background: badge.bg, color: badge.color,
          }}>
            {badge.text}
          </span>
        )}
        {!badge && hasDetail && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500 }}>
            <span style={{ color: 'var(--navy-300)' }}>{open ? '접기' : '상세보기'}</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'none' }}>
              <path d="M5 7l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#455578', lineHeight: 1.7, letterSpacing: '-0.01em', whiteSpace: 'pre-wrap' }}>{summary}</p>
      {hasDetail && (
        <>
          <div className={`accordion-content ${open ? 'open' : ''}`}>
            <div style={{ borderTop: '1px solid rgba(26,39,68,0.06)', paddingTop: 14 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: '#455578', lineHeight: 1.7, whiteSpace: 'pre-wrap', opacity: 0.8 }}>{detail}</p>
            </div>
          </div>
          <div style={{
            marginTop: 14, display: 'flex', justifyContent: 'center',
          }}>
            <span style={{
              padding: '6px 16px', borderRadius: 20,
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
              color: 'var(--navy-400)',
              background: 'rgba(26,39,68,0.04)',
              border: '1px solid rgba(26,39,68,0.06)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              transition: 'all 0.2s',
            }}>
              {open ? '접기' : '상세보기'}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'none' }}>
                <path d="M4 5.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </>
      )}
    </section>
  );
}

export function ResultStep({
  highlight,
  fullResult,
  onLoadFull,
  userName,
  mbti,
  period,
  onChangePeriod,
  onRestart,
  onTomorrow,
  onGoDream,
  onIAP,
}: Props) {
  const [showShare, setShowShare] = useState(false);
  const [unlockedCards, setUnlockedCards] = useState<Set<FortuneCategory>>(new Set());
  const [unlockingCard, setUnlockingCard] = useState<FortuneCategory | null>(null);
  const displayName = userName.trim() || '회원';
  const mbtiProfile = mbti ? MBTI_PROFILES[mbti] : null;
  const lucky = mergeLucky(highlight.lucky);
  const categories = deriveCategoryScores(highlight.score, highlight.bestCategory, highlight.cautionCategory);

  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const { showAd: showInterstitialAd } = useInterstitialAd(AD_IDS.INTERSTITIAL);
  const { showAd: showRewardedAd } = useInterstitialAd(AD_IDS.REWARDED);
  const bannerRef = useRef<HTMLDivElement>(null);
  const bottomBannerRef = useRef<HTMLDivElement>(null);

  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const { grantReward } = usePromotion();
  const [rewardInfo, setRewardInfo] = useState<{ amount: number; isGolden: boolean } | null>(null);
  const { count: passCount, hasPass, usePass, addPasses } = usePremiumPass();
  const { isSubscribed } = useSubscription();
  const [capToastMsg, setCapToastMsg] = useState('');
  const [capToastVisible, setCapToastVisible] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [pendingUnlockCat, setPendingUnlockCat] = useState<FortuneCategory | null>(null);
  const lockedCardRef = useRef<HTMLDivElement>(null);
  const scrollToLockedCard = () => {
    lockedCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    try { Analytics.impression({ log_name: 'fortune_result_view' }); } catch (_) { /* noop */ }
    if (period === 'today') {
      import('../utils/streak').then(m => m.saveTodayScore(highlight.score));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasFullResult = !!fullResult;
  useEffect(() => {
    if (!bannerReady || !bannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bannerRef.current, { theme: 'light', tone: 'blackAndWhite', variant: 'card' });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner, hasFullResult]);

  useEffect(() => {
    if (!bannerReady || !bottomBannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bottomBannerRef.current, { theme: 'light', tone: 'blackAndWhite', variant: 'card' });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner]);

  const periodLabel = period === 'today' ? '오늘' : period === 'tomorrow' ? '내일' : period === 'week' ? '이번 주' : '이번 달';

  const today = new Date();
  const targetDate = period === 'tomorrow'
    ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    : today;
  const dateStr = `${targetDate.getFullYear()}.${String(targetDate.getMonth() + 1).padStart(2, '0')}.${String(targetDate.getDate()).padStart(2, '0')}`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][targetDate.getDay()];

  const completeUnlock = useCallback(async (cat: FortuneCategory) => {
    setUnlockedCards(prev => new Set(prev).add(cat));
    setUnlockingCard(null);

    const allUnlocked = new Set(unlockedCards);
    allUnlocked.add(cat);
    allUnlocked.add(highlight.bestCategory);
    allUnlocked.add(highlight.cautionCategory);
    if (allUnlocked.size >= 4) {
      try { Analytics.click({ log_name: 'full_fortune_view' }); } catch (_) { /* noop */ }
      const reward = await grantReward();
      if (reward.success) { trackRewardGranted(reward.amount, reward.isGolden); setRewardInfo({ amount: reward.amount, isGolden: reward.isGolden }); }
      const reviewCount = parseInt(localStorage.getItem('reviewPromptCount') || '0');
      const lastReview = localStorage.getItem('lastReviewPrompt');
      const todayKey = new Date().toDateString();
      if (reviewCount >= 1 && lastReview !== todayKey) { setTimeout(() => setShowReviewPrompt(true), 3000); localStorage.setItem('lastReviewPrompt', todayKey); }
      localStorage.setItem('reviewPromptCount', String(reviewCount + 1));
    }
  }, [grantReward, unlockedCards, highlight.bestCategory, highlight.cautionCategory]);

  const doUnlock = useCallback(async (cat: FortuneCategory) => {
    setUnlockingCard(cat);
    try {
      if (!fullResult) {
        trackFullFortuneClicked();
        if (usePass()) { await onLoadFull(); } else { await Promise.all([showInterstitialAd(), onLoadFull()]); }
      } else {
        if (!usePass()) await showRewardedAd();
      }
    } catch { /* proceed with unlock even on error */ }
    await completeUnlock(cat);
  }, [fullResult, onLoadFull, showInterstitialAd, showRewardedAd, usePass, completeUnlock]);

  const handleUnlockCard = useCallback(async (cat: FortuneCategory) => {
    haptic();
    try { Analytics.click({ log_name: 'card_unlock', category: cat }); } catch (_) { /* noop */ }
    if (!hasPass) {
      setPendingUnlockCat(cat);
      setShowPurchase(true);
      return;
    }
    await doUnlock(cat);
  }, [hasPass, doUnlock]);

  const handleChangePeriodWithAd = useCallback(async (newPeriod: FortunePeriod) => {
    haptic();
    if (isSubscribed) {
      if (newPeriod === 'tomorrow') { onTomorrow(); return; }
      onChangePeriod(newPeriod);
      return;
    }
    if (newPeriod === 'tomorrow') { if (!usePass()) await showRewardedAd(); onTomorrow(); return; }
    if (!usePass()) await showRewardedAd();
    onChangePeriod(newPeriod);
  }, [isSubscribed, onChangePeriod, onTomorrow, showRewardedAd, usePass]);

  const shareResult: FortuneResult = fullResult ?? {
    overall: highlight.bestCategory === 'overall' ? highlight.bestSummary : highlight.cautionCategory === 'overall' ? highlight.cautionSummary : '',
    love: highlight.bestCategory === 'love' ? highlight.bestSummary : highlight.cautionCategory === 'love' ? highlight.cautionSummary : '',
    money: highlight.bestCategory === 'money' ? highlight.bestSummary : highlight.cautionCategory === 'money' ? highlight.cautionSummary : '',
    health: highlight.bestCategory === 'health' ? highlight.bestSummary : highlight.cautionCategory === 'health' ? highlight.cautionSummary : '',
    summaryLine: highlight.summaryLine, lucky: highlight.lucky, score: highlight.score, mbtiInsight: highlight.mbtiInsight,
  };

  const isCardLocked = (key: FortuneCategory): boolean => {
    if (isSubscribed) return false;
    if (key === highlight.bestCategory || key === highlight.cautionCategory) return false;
    return !unlockedCards.has(key);
  };

  const getCardText = (key: FortuneCategory): { summary: string; detail?: string } => {
    if (key === highlight.bestCategory) return { summary: highlight.bestSummary, detail: highlight.bestDetail };
    if (key === highlight.cautionCategory) return { summary: highlight.cautionSummary, detail: highlight.cautionDetail };
    if (fullResult) {
      const dk: Record<FortuneCategory, 'overallDetail' | 'loveDetail' | 'moneyDetail' | 'healthDetail'> = {
        overall: 'overallDetail', love: 'loveDetail', money: 'moneyDetail', health: 'healthDetail',
      };
      return { summary: fullResult[key], detail: fullResult[dk[key]] };
    }
    return { summary: '운세 내용을 불러오고 있어요...' };
  };

  // 구독자이거나 언락된 카드가 있는데 데이터 없으면 자동 로딩
  const needsFullLoad = !fullResult && (
    isSubscribed ||
    Array.from(unlockedCards).some(k => k !== highlight.bestCategory && k !== highlight.cautionCategory)
  );
  useEffect(() => {
    if (needsFullLoad) {
      onLoadFull();
    }
  }, [needsFullLoad, onLoadFull]);

  const getBadge = (key: FortuneCategory) => {
    if (key === highlight.bestCategory) return { text: 'BEST', bg: 'rgba(209,87,122,0.1)', color: 'rgb(196,86,106)' };
    if (key === highlight.cautionCategory) return { text: '주의', bg: 'rgba(75,123,165,0.1)', color: '#4b7ba5' };
    return null;
  };

  const sortedCategories = [
    ...categories.filter(c => c.key === highlight.bestCategory),
    ...categories.filter(c => c.key === highlight.cautionCategory),
    ...categories.filter(c => c.key !== highlight.bestCategory && c.key !== highlight.cautionCategory),
  ];

  // 분야별 운세 카드용 요약 텍스트
  const getCategorySummaryShort = (key: FortuneCategory): string => {
    if (key === highlight.bestCategory) return highlight.bestSummary.split(/[.!]/)[0];
    if (key === highlight.cautionCategory) return highlight.cautionSummary.split(/[.!]/)[0];
    if (fullResult) return fullResult[key].split(/[.!]/)[0];
    return '';
  };

  return (
    <div className="app-page">
      <Toast message={capToastMsg} visible={capToastVisible} onDone={() => setCapToastVisible(false)} duration={3000} />
      <PurchaseSheet
        open={showPurchase}
        passCount={passCount}
        lockedCount={sortedCategories.filter(c => isCardLocked(c.key)).length}
        onClose={() => {
          setShowPurchase(false);
          setPendingUnlockCat(null);
        }}
        onPurchased={async () => {
          setShowPurchase(false);
          const cat = pendingUnlockCat;
          setPendingUnlockCat(null);
          if (!cat) return;
          setUnlockingCard(cat);
          try {
            if (!fullResult) {
              trackFullFortuneClicked();
              await onLoadFull();
            }
          } catch { /* ignore */ }
          await completeUnlock(cat);
        }}
      />
      <ResultSparkleDecor />

      {/* 헤더: ‹ 사주풀이 + 공유 아이콘 */}
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <NavBackButton onClick={onRestart} />
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-700)', letterSpacing: '-0.02em' }}>사주풀이</span>
        <button
          onClick={() => { haptic(); trackShareButtonClicked(); setShowShare(true); }}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0 8px 12px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v12M12 3l-4 4M12 3l4 4M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" stroke="var(--navy-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 날짜 + 이름 */}
      <p className="animate-fade-in" style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 500, color: '#97a2b8', lineHeight: 1.5 }}>
        {dateStr} ({dayOfWeek}) · {displayName}님의 {periodLabel} 운세
      </p>

      {/* 요약 문장 (큰 타이틀) */}
      <h1 className="animate-fade-in" style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: 'var(--navy-700)', lineHeight: 1.28, letterSpacing: '-0.035em' }}>
        {highlight.summaryLine.replace(/[.!]+$/, '').replace(/😊|💕|🌿|✨|💫|🌙|🔮|⚡|🎉|💪|❤️|🎁|💖|🍀/g, '').trim()}
      </h1>

      {/* MBTI 서브텍스트 */}
      {mbtiProfile && (
        <p className="animate-fade-in" style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 500, color: '#455578', letterSpacing: '-0.01em' }}>
          {mbtiProfile.type} · {mbtiProfile.nickname}의 시선으로 풀어봤어요
        </p>
      )}
      {!mbtiProfile && <div style={{ marginBottom: 16 }} />}

      {/* 기간 탭 (4개: 오늘, 내일, 이번 주, 이번 달) */}
      <div className="tab-bar animate-fade-in" style={{ marginBottom: 20, animationDelay: '0.1s' }}>
        {([
          ['today', '오늘'],
          ['tomorrow', '내일'],
          ['week', '이번 주'],
          ['month', '이번 달'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`tab-item ${period === key ? 'active' : ''}`}
            onClick={() => { if (key !== period) handleChangePeriodWithAd(key); }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 반원 게이지 + 한줄 요약 카드 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{ padding: '20px 20px 8px', marginBottom: 16, animationDelay: '0.15s' }}
      >
        <SemiCircleGauge score={highlight.score} size={240} />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', fontSize: 10, color: 'var(--navy-300)', fontFeatureSettings: '"tnum"', marginTop: -14 }}>
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
        <div style={{
          marginTop: 14, padding: '12px 14px', borderRadius: 12,
          background: 'var(--gold-50)', border: '1px solid rgba(212,168,75,0.2)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-600)', letterSpacing: '0.06em', marginBottom: 4 }}>✦ 한 줄 요약</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-700)', letterSpacing: '-0.01em', lineHeight: 1.5 }}>
            {highlight.summaryLine}
          </div>
        </div>
      </div>

      {/* 분야별 운세 — 스와이프 카드 */}
      <div className="animate-slide-up" style={{ marginBottom: 24, animationDelay: '0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>분야별 운세</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy-400)' }}>← 옆으로 넘겨보세요</div>
        </div>
        <div style={{
          display: 'flex', gap: 10, overflowX: 'auto',
          scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
          padding: '0 0 4px',
        }}>
          {categories.sort((a, b) => b.score - a.score).map((cat) => (
            <div
              key={cat.key}
              style={{
                flex: '0 0 160px', padding: '18px 16px',
                borderRadius: 16, background: '#fff',
                border: '1px solid rgba(26,39,68,0.08)',
                boxShadow: 'rgba(26,39,68,0.04) 0 1px 2px, rgba(26,39,68,0.02) 0 1px 1px',
                scrollSnapAlign: 'start',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-500)' }}>{cat.title}</div>
                <MiniScoreRing score={cat.score} color={cat.color} size={40} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-700)', lineHeight: 1.55, letterSpacing: '-0.01em' }}>
                {getCategorySummaryShort(cat.key) || `${cat.title}의 기운이 흐르는 하루`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 오늘의 행운 카드 */}
      {period === 'today' && (
        <div
          className="premium-card animate-slide-up"
          style={{ padding: '14px 18px', marginBottom: 24, animationDelay: '0.25s' }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy-700)', marginBottom: 14 }}>오늘의 행운</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 100,
                  background: lucky.colorHex, boxShadow: 'inset 0 -4px 6px rgba(0,0,0,0.2)',
                }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--navy-400)', marginBottom: 2 }}>색상</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--navy-700)' }}>{lucky.color}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'var(--gold-500)', color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800,
                }}>
                  {lucky.number}
                </div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--navy-400)', marginBottom: 2 }}>숫자</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--navy-700)' }}>{lucky.number}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="11" stroke="var(--navy-600)" strokeWidth="1.4" />
                  <path d="M14 7L17 15L14 13L11 15L14 7Z" fill="var(--gold-500)" transform="rotate(45 14 14)" />
                  <text x="14" y="5.5" fontSize="5" fontWeight="800" fill="var(--navy-700)" textAnchor="middle">N</text>
                </svg>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--navy-400)', marginBottom: 2 }}>방향</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--navy-700)' }}>{lucky.direction}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(201,169,98,0.12)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>🍀</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--navy-400)', marginBottom: 2 }}>아이템</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--navy-700)' }}>{lucky.item.split('(')[0].trim()}</div>
            </div>
          </div>
        </div>
      )}

      {/* 상세 운세 카드들 (best/caution 무료, 나머지 잠금) */}
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        {sortedCategories.map((cat, i) => {
          const locked = isCardLocked(cat.key);
          const { summary, detail } = getCardText(cat.key);
          const isFirstLocked = locked && !sortedCategories.slice(0, i).some(c => isCardLocked(c.key));
          return (
            <div key={cat.key} ref={isFirstLocked ? lockedCardRef : undefined}>
              <DetailCard
                cat={cat} summary={summary} detail={detail}
                badge={getBadge(cat.key)} locked={locked}
                onUnlock={() => handleUnlockCard(cat.key)}
                unlocking={unlockingCard === cat.key}
              />
              {i === 1 && (
                <div ref={bannerRef} style={{ width: '100%', minHeight: bannerReady ? 96 : 0, marginTop: 14, borderRadius: 12 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* 포인트 지급 알림 */}
      {rewardInfo && (
        <div className="animate-slide-up" style={{
          marginBottom: 16, padding: '14px 18px', borderRadius: 14, textAlign: 'center',
          background: rewardInfo.isGolden ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'linear-gradient(135deg, rgba(56,176,126,0.1), rgba(56,176,126,0.05))',
          border: rewardInfo.isGolden ? '1.5px solid rgba(255,215,0,0.5)' : '1px solid rgba(56,176,126,0.2)',
        }}>
          <p style={{ margin: 0, fontSize: rewardInfo.isGolden ? 17 : 14, fontWeight: 700, color: rewardInfo.isGolden ? '#fff' : '#38B07E', lineHeight: 1.5 }}>
            {rewardInfo.isGolden ? '🏆 축하합니다! 황금운세 1,000P가 지급되었어요!' : `🎉 ${rewardInfo.amount}P가 지급되었어요!`}
          </p>
        </div>
      )}

      {/* CTA 버튼 영역 */}
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        <button
          style={{
            width: '100%', gap: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px 22px', fontSize: 16, fontWeight: 700, color: '#fff',
            border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
            background: 'linear-gradient(135deg, #d4a84b 0%, #b88a35 100%)',
            boxShadow: 'rgba(212,168,75,0.22) 0 6px 20px',
          }}
          onClick={() => { haptic(); trackShareButtonClicked(); setShowShare(true); }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v12M12 3l-4 4M12 3l4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 15v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          운세 공유하기
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { haptic(); trackShareButtonClicked(); setShowShare(true); }}
            style={{
              flex: 1, padding: '14px 12px', fontSize: 14, fontWeight: 700,
              color: 'var(--navy-700)', background: '#fff',
              border: '1.5px solid rgba(26,39,68,0.08)', borderRadius: 14,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" stroke="var(--navy-700)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            링크 복사
          </button>
          <button
            onClick={() => { haptic(); onIAP?.(); }}
            style={{
              flex: 1, padding: '14px 12px', fontSize: 14, fontWeight: 800,
              color: '#8a6715',
              background: 'linear-gradient(135deg, #fff9e5 0%, #fef0c2 100%)',
              border: '1.5px solid #e9c768', borderRadius: 14,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 0 10px rgba(212, 168, 75, 0.25), 0 2px 6px rgba(212, 168, 75, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            🎫 열람권 충전소
          </button>
        </div>
      </div>

      {hasPass && (
        <p className="animate-fade-in" style={{ textAlign: 'center', margin: '12px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--gold-600)' }}>
          🎫 열람권 {passCount}장 보유 중
        </p>
      )}

      {/* 보조 CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, marginBottom: 8, padding: '8px 0' }}>
        {onGoDream && (
          <button onClick={() => { haptic(); onGoDream(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--navy-500)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            🌙 꿈해몽 보러가기
          </button>
        )}
        <button onClick={onRestart}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: 'var(--navy-300)', padding: '10px 16px' }}>
          처음부터 다시 보기
        </button>
      </div>

      {/* 하단 배너 광고 */}
      <div ref={bottomBannerRef} style={{ width: '100%', minHeight: bannerReady ? 96 : 0, marginBottom: 16, borderRadius: 12 }} />

      {/* 리뷰 유도 */}
      {showReviewPrompt && (
        <div className="animate-fade-in" style={{ marginBottom: 16, padding: '16px 20px', borderRadius: 14, background: 'rgba(201,169,98,0.06)', border: '1px solid rgba(201,169,98,0.12)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 20 }}>⭐</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: 'var(--navy-600)' }}>명리연구소가 도움이 됐나요?</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--navy-400)' }}>별점 한 줄이면 큰 힘이 돼요</p>
          </div>
          <button onClick={() => { haptic(); setShowReviewPrompt(false); try { window.location.href = 'intoss://myeongri-lab/review'; } catch { /* noop */ } }}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, color: 'var(--gold-600)', background: 'rgba(201,169,98,0.12)', border: 'none', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>리뷰 쓰기</button>
          <button onClick={() => setShowReviewPrompt(false)}
            style={{ background: 'none', border: 'none', fontSize: 14, color: 'var(--navy-300)', cursor: 'pointer', padding: '4px 2px' }}>✕</button>
        </div>
      )}

      <FloatingHomeButton onClick={onRestart} />

      {showShare && (
        <ShareSheet
          shareInfo={{
            title: `${displayName}님의 오늘 운세`, summaryLine: shareResult.summaryLine, score: shareResult.score,
            extraLine: `🍀 행운색: ${shareResult.lucky.color} | 행운숫자: ${shareResult.lucky.number}`,
            serverData: {
              n: displayName, sl: shareResult.summaryLine, sc: shareResult.score,
              bc: highlight.bestCategory, bs: highlight.bestSummary, cc: highlight.cautionCategory, cs: highlight.cautionSummary,
              lc: shareResult.lucky.color, ln: shareResult.lucky.number, ld: shareResult.lucky.direction, li: shareResult.lucky.item,
              ov: shareResult.overall, lo: shareResult.love, mo: shareResult.money, he: shareResult.health,
            },
          }}
          onClose={() => setShowShare(false)}
          onShareReward={() => {
            const { capped } = addPasses(1);
            if (capped) { setCapToastMsg('🎫 열람권 한도(99개)가 가득 찼어요!'); setCapToastVisible(true); }
          }}
        />
      )}
    </div>
  );
}
