import { useState, useCallback, useEffect, useRef } from 'react';
import { haptic } from '../utils/haptic';
import { ResultSparkleDecor } from '../components/ResultSparkleDecor';
import { ScoreRing } from '../components/ScoreRing';
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
};

type FortuneSection = {
  key: 'overall' | 'love' | 'money' | 'health';
  detailKey: 'overallDetail' | 'loveDetail' | 'moneyDetail' | 'healthDetail';
  title: string;
  icon: string;
  gradient: string;
};

const SECTIONS: FortuneSection[] = [
  {
    key: 'overall',
    detailKey: 'overallDetail',
    title: '총운',
    icon: '☀️',
    gradient: 'linear-gradient(135deg, rgba(201, 169, 98, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)',
  },
  {
    key: 'love',
    detailKey: 'loveDetail',
    title: '애정운',
    icon: '💕',
    gradient: 'linear-gradient(135deg, rgba(232, 98, 124, 0.06) 0%, rgba(255, 255, 255, 0.9) 100%)',
  },
  {
    key: 'money',
    detailKey: 'moneyDetail',
    title: '금전운',
    icon: '✨',
    gradient: 'linear-gradient(135deg, rgba(91, 141, 239, 0.06) 0%, rgba(255, 255, 255, 0.9) 100%)',
  },
  {
    key: 'health',
    detailKey: 'healthDetail',
    title: '건강운',
    icon: '🌿',
    gradient: 'linear-gradient(135deg, rgba(56, 176, 126, 0.06) 0%, rgba(255, 255, 255, 0.9) 100%)',
  },
];

const CATEGORY_LABEL: Record<FortuneCategory, { title: string; icon: string }> = {
  overall: { title: '총운', icon: '☀️' },
  love: { title: '애정운', icon: '💕' },
  money: { title: '금전운', icon: '✨' },
  health: { title: '건강운', icon: '🌿' },
};

function AccordionCard({
  section,
  body,
  detail,
  badge,
}: {
  section: FortuneSection;
  body: string;
  detail?: string;
  badge?: { text: string; bg: string; color: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!detail;

  return (
    <section
      className={`premium-card ${open ? 'active' : ''}`}
      style={{ background: section.gradient, cursor: hasDetail ? 'pointer' : 'default' }}
      onClick={() => {
        if (hasDetail) {
          haptic();
          if (!open) trackFortuneCardExpanded(section.key);
          setOpen(!open);
        }
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--navy-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>{section.icon}</span>
            {section.title}
          </h2>
          {badge && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
                background: badge.bg,
                color: badge.color,
              }}
            >
              {badge.text}
            </span>
          )}
        </div>
        {hasDetail && (
          <span
            className="accordion-arrow"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500 }}
          >
            <span style={{ color: 'var(--navy-300)' }}>{open ? '접기' : '더보기'}</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'none' }}>
              <path
                d="M5 7l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>

      <p
        style={{
          margin: '14px 0 0',
          fontSize: 15,
          fontWeight: 400,
          color: 'var(--navy-500)',
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
        }}
      >
        {body}
      </p>

      {hasDetail && (
        <div className={`accordion-content ${open ? 'open' : ''}`}>
          <div
            style={{
              borderTop: '1px solid rgba(26, 39, 68, 0.06)',
              paddingTop: 14,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 400,
                color: 'var(--navy-400)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {detail}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function HighlightCard({
  type,
  category,
  summary,
  detail,
  gradient,
  periodLabel,
}: {
  type: 'best' | 'caution';
  category: FortuneCategory;
  summary: string;
  detail: string;
  gradient: string;
  periodLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const label = CATEGORY_LABEL[category];
  const badge = type === 'best'
    ? { text: `🌟 ${periodLabel} 가장 좋은 운`, bg: 'rgba(201, 169, 98, 0.15)', color: 'var(--gold-600)' }
    : { text: `🛡️ ${periodLabel} 조심할 운`, bg: 'rgba(232, 98, 124, 0.12)', color: '#c4566a' };

  return (
    <section
      className={`premium-card ${open ? 'active' : ''}`}
      style={{ background: gradient, cursor: 'pointer' }}
      onClick={() => {
        haptic();
        if (!open) trackFortuneCardExpanded(category);
        setOpen(!open);
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 700,
            background: badge.bg,
            color: badge.color,
          }}
        >
          {badge.text}
        </span>
        <span
          className="accordion-arrow"
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500 }}
        >
          <span style={{ color: 'var(--navy-300)' }}>{open ? '접기' : '상세보기'}</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'none' }}>
            <path d="M5 7l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <h2
        style={{
          margin: '0 0 12px',
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--navy-700)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>{label.icon}</span>
        {label.title}
      </h2>

      <p
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 400,
          color: 'var(--navy-500)',
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
        }}
      >
        {summary}
      </p>

      <div className={`accordion-content ${open ? 'open' : ''}`}>
        <div style={{ borderTop: '1px solid rgba(26, 39, 68, 0.06)', paddingTop: 14 }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 400,
              color: 'var(--navy-400)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}
          >
            {detail}
          </p>
        </div>
      </div>
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
}: Props) {
  const [showShare, setShowShare] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);
  const displayName = userName.trim() || '회원';
  const mbtiProfile = mbti ? MBTI_PROFILES[mbti] : null;
  const lucky = mergeLucky(highlight.lucky);

  // 광고
  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const { showAd: showInterstitial } = useInterstitialAd(AD_IDS.REWARDED);
  const bannerRef = useRef<HTMLDivElement>(null);
  const fullCardsRef = useRef<HTMLDivElement>(null);

  // 프로모션 포인트 지급
  const { grantReward } = usePromotion();
  const [rewardInfo, setRewardInfo] = useState<{ amount: number; isGolden: boolean } | null>(null);

  // 황금 열람권
  const { count: passCount, hasPass, usePass, addPasses } = usePremiumPass();

  // 앱인토스 전환지표: 운세 결과 화면 도달
  useEffect(() => {
    try { Analytics.impression({ log_name: 'fortune_result_view' }); } catch (_) { /* noop */ }
  }, []);

  // 배너 광고 부착 (fullResult 변경 시 ref가 새 DOM으로 이동하므로 재부착 필요)
  const hasFullResult = !!fullResult;
  useEffect(() => {
    if (!bannerReady || !bannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bannerRef.current, {
      theme: 'light',
      tone: 'blackAndWhite',
      variant: 'card',
    });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner, hasFullResult]);

  const periodLabel = period === 'today' ? '오늘' : period === 'tomorrow' ? '내일' : period === 'week' ? '이번 주' : '이번 달';

  const today = new Date();
  const targetDate = period === 'tomorrow'
    ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    : today;
  const dateStr = `${targetDate.getFullYear()}.${String(targetDate.getMonth() + 1).padStart(2, '0')}.${String(targetDate.getDate()).padStart(2, '0')}`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][targetDate.getDay()];

  const handleLoadFull = useCallback(async () => {
    setLoadingFull(true);
    haptic();
    trackFullFortuneClicked();
    try { Analytics.click({ log_name: 'hidden_fortune_unlock' }); } catch (_) { /* noop */ }
    // 열람권 있으면 광고 스킵
    if (usePass()) {
      await onLoadFull();
    } else {
      await Promise.all([showInterstitial(), onLoadFull()]);
    }
    setLoadingFull(false);

    // 숨겨진 운세 카드가 먼저 보이도록 스크롤
    requestAnimationFrame(() => {
      fullCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // 전체 운세 확인 완료 → 프로모션 포인트 지급
    const reward = await grantReward();
    if (reward.success) {
      trackRewardGranted(reward.amount, reward.isGolden);
      setRewardInfo({ amount: reward.amount, isGolden: reward.isGolden });
    }
  }, [onLoadFull, showInterstitial, grantReward]);

  const handleChangePeriodWithAd = useCallback(async (newPeriod: FortunePeriod) => {
    haptic();
    if (!usePass()) await showInterstitial();
    onChangePeriod(newPeriod);
  }, [onChangePeriod, showInterstitial, usePass]);

  const handleTomorrow = useCallback(async () => {
    haptic();
    if (!usePass()) await showInterstitial();
    onTomorrow();
  }, [onTomorrow, showInterstitial, usePass]);

  // 공유용 결과 조합
  const shareResult: FortuneResult = fullResult ?? {
    overall: highlight.bestCategory === 'overall' ? highlight.bestSummary : highlight.cautionCategory === 'overall' ? highlight.cautionSummary : '',
    love: highlight.bestCategory === 'love' ? highlight.bestSummary : highlight.cautionCategory === 'love' ? highlight.cautionSummary : '',
    money: highlight.bestCategory === 'money' ? highlight.bestSummary : highlight.cautionCategory === 'money' ? highlight.cautionSummary : '',
    health: highlight.bestCategory === 'health' ? highlight.bestSummary : highlight.cautionCategory === 'health' ? highlight.cautionSummary : '',
    summaryLine: highlight.summaryLine,
    lucky: highlight.lucky,
    score: highlight.score,
    mbtiInsight: highlight.mbtiInsight,
  };

  return (
    <div className="app-page">
      <ResultSparkleDecor />

      {/* 헤더 */}
      <header
        className="animate-fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 20,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--gold-500)',
            letterSpacing: '0.03em',
          }}
        >
          {dateStr} ({dayOfWeek}) · {displayName}님의 {periodLabel} 운세
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            color: 'var(--navy-700)',
            lineHeight: 1.3,
            letterSpacing: '-0.03em',
          }}
        >
          ✨ {periodLabel}의 운세가 도착했어요
        </h1>
        {mbtiProfile && (
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--navy-300)',
            }}
          >
            {mbtiProfile.emoji} {mbtiProfile.type} {mbtiProfile.nickname}의 시선으로 풀어봤어요
          </p>
        )}
      </header>

      {/* 기간 탭 (내일 운세에서는 숨김) */}
      {period !== 'tomorrow' && (
      <div className="tab-bar animate-fade-in" style={{ marginBottom: 20, animationDelay: '0.1s' }}>
        {(
          [
            ['today', '오늘'],
            ['week', '이번 주'],
            ['month', '이번 달'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`tab-item ${period === key ? 'active' : ''}`}
            onClick={() => {
              if (key === period) return;
              // 다른 기간으로 변경 시 리워드 광고 후 전환
              handleChangePeriodWithAd(key);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      )}

      {/* 점수 + 한줄 요약 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 20,
          padding: '20px 22px',
          animationDelay: '0.15s',
        }}
      >
        <ScoreRing score={highlight.score} size={88} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: '0 0 6px',
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--navy-700)',
              lineHeight: 1.4,
            }}
          >
            {highlight.summaryLine}
          </p>
          {highlight.mbtiInsight && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--gold-600)',
                lineHeight: 1.45,
              }}
            >
              {highlight.mbtiInsight}
            </p>
          )}
        </div>
      </div>

      {/* 행운 정보 (오늘 운세에서만 표시) */}
      {period === 'today' && (
        <div
          className="animate-slide-up"
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 24,
            overflowX: 'auto',
            paddingBottom: 4,
            animationDelay: '0.2s',
            flexWrap: 'wrap',
          }}
        >
          <div className="lucky-badge">
            <span className="lucky-color-dot" style={{ background: lucky.colorHex }} />
            행운색: {lucky.color}
          </div>
          <div className="lucky-badge">🔢 행운숫자: {lucky.number}</div>
          <div className="lucky-badge">🧭 행운방향: {lucky.direction}</div>
          <div className="lucky-badge">🍀 행운아이템: {lucky.item}</div>
        </div>
      )}

      {/* 하이라이트 카드 2개 */}
      {!fullResult && (
        <div
          className="stagger-children"
          style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}
        >
          <HighlightCard
            type="best"
            category={highlight.bestCategory}
            summary={highlight.bestSummary}
            detail={highlight.bestDetail}
            gradient="linear-gradient(135deg, rgba(201, 169, 98, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)"
            periodLabel={periodLabel}
          />
          <HighlightCard
            type="caution"
            category={highlight.cautionCategory}
            summary={highlight.cautionSummary}
            detail={highlight.cautionDetail}
            gradient="linear-gradient(135deg, rgba(232, 98, 124, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)"
            periodLabel={periodLabel}
          />

          {/* 나머지 운세 보기 버튼 */}
          <button
            className="btn-primary"
            style={{
              marginTop: 4,
              gap: 6,
              background: 'linear-gradient(135deg, #E08A30 0%, #D4556A 50%, #9B59B6 100%)',
              color: '#fff',
              fontSize: 16,
              boxShadow: '0 4px 14px rgba(212, 85, 106, 0.25)',
              opacity: loadingFull ? 0.7 : 1,
            }}
            disabled={loadingFull}
            onClick={handleLoadFull}
          >
            {loadingFull ? (
              <>운세를 펼치는 중... ✨</>
            ) : hasPass ? (
              <>🎫 황금 열람권으로 바로 보기 ({passCount}회 남음)</>
            ) : (
              <>숨겨진 2개의 운세가 더 있어요 ☝️👀</>
            )}
          </button>
        </div>
      )}

      {/* 포인트 지급 알림 */}
      {rewardInfo && (
        <div
          className="animate-slide-up"
          style={{
            marginBottom: 16,
            padding: '14px 18px',
            borderRadius: 14,
            background: rewardInfo.isGolden
              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
              : 'linear-gradient(135deg, rgba(56, 176, 126, 0.1), rgba(56, 176, 126, 0.05))',
            border: rewardInfo.isGolden
              ? '1.5px solid rgba(255, 215, 0, 0.5)'
              : '1px solid rgba(56, 176, 126, 0.2)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: rewardInfo.isGolden ? 17 : 14,
              fontWeight: 700,
              color: rewardInfo.isGolden ? '#fff' : '#38B07E',
              lineHeight: 1.5,
            }}
          >
            {rewardInfo.isGolden
              ? '🏆 축하합니다! 황금운세 1,000P가 지급되었어요!'
              : `🎉 ${rewardInfo.amount}P가 지급되었어요!`}
          </p>
        </div>
      )}

      {/* 전체 운세 카드들 — 새로운 운세 먼저, 이미 본 운세는 아래로 */}
      {fullResult && (
        <div
          ref={fullCardsRef}
          className="stagger-children"
          style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}
        >
          {(() => {
            const seenKeys = [highlight.bestCategory, highlight.cautionCategory];
            const newSections = SECTIONS.filter((s) => !seenKeys.includes(s.key));
            const seenSections = SECTIONS.filter((s) => seenKeys.includes(s.key));
            const sorted = [...newSections, ...seenSections];
            return sorted.map((sec, i) => {
              const isBest = sec.key === highlight.bestCategory;
              const isCaution = sec.key === highlight.cautionCategory;
              const badge = isBest
                ? { text: '✨ BEST', bg: 'rgba(201, 169, 98, 0.15)', color: 'var(--gold-600)' }
                : isCaution
                  ? { text: '⚠️ 주의', bg: 'rgba(232, 98, 124, 0.12)', color: '#c4566a' }
                  : null;
              // 좋은 운/조심할 운은 하이라이트 텍스트 유지
              const body = isBest ? highlight.bestSummary
                : isCaution ? highlight.cautionSummary
                : fullResult[sec.key];
              const detail = isBest ? highlight.bestDetail
                : isCaution ? highlight.cautionDetail
                : fullResult[sec.detailKey];
              return (
                <div key={sec.key}>
                  <AccordionCard
                    section={sec}
                    body={body}
                    detail={detail}
                    badge={badge}
                  />
                  {/* 2번째와 3번째 카드 사이에 배너 광고 */}
                  {i === 1 && (
                    <div
                      ref={bannerRef}
                      style={{ width: '100%', height: 96, marginTop: 14 }}
                    />
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* 공유 버튼 — 숨겨진 운세 버튼과 동일한 그라데이션 */}
      <button
        className="animate-fade-in"
        style={{
          width: '100%',
          marginBottom: 12,
          gap: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '15px 20px',
          fontSize: 16,
          fontWeight: 700,
          color: '#fff',
          border: 'none',
          borderRadius: 16,
          cursor: 'pointer',
          background: 'linear-gradient(135deg, var(--gold-500) 0%, var(--gold-600) 100%)',
          boxShadow: '0 4px 14px rgba(201, 169, 98, 0.3)',
          letterSpacing: '-0.01em',
        }}
        onClick={() => {
          haptic();
          trackShareButtonClicked();
          setShowShare(true);
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M13.5 6a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM4.5 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM13.5 16.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM6.44 10.24l5.13 2.77M11.56 5l-5.12 2.75"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        ✨ 친구에게 운세 공유하기
      </button>

      {/* 꿈해몽 크로스 진입 카드 (사주 정보 유지된 채로 이동) */}
      {onGoDream && (
        <button
          type="button"
          onClick={() => { haptic(); onGoDream(); }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 18px',
            marginBottom: 14,
            background: 'linear-gradient(135deg, #2d1b69 0%, #4a2d8a 100%)',
            border: 'none',
            borderRadius: 16,
            color: '#fff',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
          }}
        >
          <span style={{ fontSize: 28 }}>🌙</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 800, marginBottom: 2 }}>
              꿈해몽도 보러가실래요?
            </span>
            <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
              지금 본 사주 정보가 자동으로 결합돼서<br />더 정확한 꿈 풀이를 받을 수 있어요 ✨
            </span>
          </span>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }}>→</span>
        </button>
      )}

      {/* 배너 광고 (fullResult 없을 때 하단 표시) */}
      {!fullResult && (
        <div
          ref={bannerRef}
          style={{ width: '100%', height: 96, marginBottom: 16 }}
        />
      )}

      {/* CTA */}
      <div className="app-footer-cta">
        {period !== 'tomorrow' ? (
          <button className="btn-secondary" onClick={handleTomorrow}>
            내일 운세도 궁금해요 🔮
          </button>
        ) : (
          <button className="btn-secondary" onClick={onRestart}>
            오늘 운세 다시 보기 ☀️
          </button>
        )}
        <button className="btn-primary" onClick={onRestart}>
          처음부터 다시 보기
        </button>
      </div>

      {/* 공유 시트 */}
      {showShare && (
        <ShareSheet
          shareInfo={{
            title: `${displayName}님의 오늘 운세`,
            summaryLine: shareResult.summaryLine,
            score: shareResult.score,
            extraLine: `🍀 행운색: ${shareResult.lucky.color} | 행운숫자: ${shareResult.lucky.number}`,
            serverData: {
              n: displayName, sl: shareResult.summaryLine, sc: shareResult.score,
              bc: highlight.bestCategory, bs: highlight.bestSummary,
              cc: highlight.cautionCategory, cs: highlight.cautionSummary,
              lc: shareResult.lucky.color, ln: shareResult.lucky.number,
              ld: shareResult.lucky.direction, li: shareResult.lucky.item,
              ov: shareResult.overall, lo: shareResult.love,
              mo: shareResult.money, he: shareResult.health,
            },
          }}
          onClose={() => setShowShare(false)}
          onShareReward={() => addPasses(5)}
        />
      )}
    </div>
  );
}
