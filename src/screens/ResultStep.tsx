import { useState, useCallback } from 'react';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';
import { ResultSparkleDecor } from '../components/ResultSparkleDecor';
import { ScoreRing } from '../components/ScoreRing';
import { ShareSheet } from '../components/ShareSheet';
import type { FortuneResult, FortuneHighlight, FortunePeriod, FortuneCategory } from '../types';
import type { MbtiType } from '../api';
import { MBTI_PROFILES } from '../data/mbtiProfiles';
import { mergeLucky } from '../utils/lucky';

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
          generateHapticFeedback({ type: 'softMedium' });
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
            className={`accordion-arrow ${open ? 'open' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500 }}
          >
            <span style={{ color: 'var(--navy-300)' }}>{open ? '접기' : '더보기'}</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
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
}: {
  type: 'best' | 'caution';
  category: FortuneCategory;
  summary: string;
  detail: string;
  gradient: string;
}) {
  const [open, setOpen] = useState(false);
  const label = CATEGORY_LABEL[category];
  const badge = type === 'best'
    ? { text: '오늘 가장 좋은 운', bg: 'rgba(201, 169, 98, 0.15)', color: 'var(--gold-600)' }
    : { text: '오늘 조심할 운', bg: 'rgba(232, 98, 124, 0.12)', color: '#c4566a' };

  return (
    <section
      className={`premium-card ${open ? 'active' : ''}`}
      style={{ background: gradient, cursor: 'pointer' }}
      onClick={() => {
        generateHapticFeedback({ type: 'softMedium' });
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
          className={`accordion-arrow ${open ? 'open' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500 }}
        >
          <span style={{ color: 'var(--navy-300)' }}>{open ? '접기' : '상세보기'}</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
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
}: Props) {
  const [showShare, setShowShare] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);
  const displayName = userName.trim() || '회원';
  const mbtiProfile = mbti ? MBTI_PROFILES[mbti] : null;
  const lucky = mergeLucky(highlight.lucky);

  const periodLabel = period === 'today' ? '오늘' : period === 'week' ? '이번 주' : '이번 달';

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  const handleLoadFull = useCallback(async () => {
    setLoadingFull(true);
    generateHapticFeedback({ type: 'softMedium' });
    await onLoadFull();
    setLoadingFull(false);
  }, [onLoadFull]);

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

      {/* 기간 탭 */}
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
              generateHapticFeedback({ type: 'softMedium' });
              onChangePeriod(key);
            }}
          >
            {label}
          </button>
        ))}
      </div>

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

      {/* 행운 정보 */}
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
          />
          <HighlightCard
            type="caution"
            category={highlight.cautionCategory}
            summary={highlight.cautionSummary}
            detail={highlight.cautionDetail}
            gradient="linear-gradient(135deg, rgba(232, 98, 124, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)"
          />

          {/* 나머지 운세 보기 버튼 */}
          <button
            className="btn-primary"
            style={{
              marginTop: 4,
              gap: 6,
              background: 'linear-gradient(135deg, #FFB347 0%, #FF6B6B 50%, #C471ED 100%)',
              color: '#fff',
              fontSize: 16,
              boxShadow: '0 4px 16px rgba(255, 107, 107, 0.3)',
              opacity: loadingFull ? 0.7 : 1,
            }}
            disabled={loadingFull}
            onClick={handleLoadFull}
          >
            {loadingFull ? (
              <>운세를 펼치는 중... ✨</>
            ) : (
              <>숨겨진 2개의 운세가 더 있어요 ☝️👀</>
            )}
          </button>
        </div>
      )}

      {/* 전체 운세 카드들 — 새로운 운세 먼저, 이미 본 운세는 아래로 */}
      {fullResult && (
        <div
          className="stagger-children"
          style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}
        >
          {(() => {
            const seenKeys = [highlight.bestCategory, highlight.cautionCategory];
            const newSections = SECTIONS.filter((s) => !seenKeys.includes(s.key));
            const seenSections = SECTIONS.filter((s) => seenKeys.includes(s.key));
            const sorted = [...newSections, ...seenSections];
            return sorted.map((sec) => {
              const badge = sec.key === highlight.bestCategory
                ? { text: '✨ BEST', bg: 'rgba(201, 169, 98, 0.15)', color: 'var(--gold-600)' }
                : sec.key === highlight.cautionCategory
                  ? { text: '⚠️ 주의', bg: 'rgba(232, 98, 124, 0.12)', color: '#c4566a' }
                  : null;
              return (
                <AccordionCard
                  key={sec.key}
                  section={sec}
                  body={fullResult[sec.key]}
                  detail={fullResult[sec.detailKey]}
                  badge={badge}
                />
              );
            });
          })()}
        </div>
      )}

      {/* 공유 버튼 */}
      <button
        className="btn-secondary animate-fade-in"
        style={{ marginBottom: 12, gap: 8 }}
        onClick={() => {
          generateHapticFeedback({ type: 'softMedium' });
          setShowShare(true);
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M13.5 6a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM4.5 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM13.5 16.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM6.44 10.24l5.13 2.77M11.56 5l-5.12 2.75"
            stroke="var(--navy-400)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        친구에게 운세 공유하기
      </button>

      {/* CTA */}
      <div className="app-footer-cta">
        <button className="btn-secondary" onClick={onTomorrow}>
          내일 운세도 궁금해요 🔮
        </button>
        <button className="btn-primary" onClick={onRestart}>
          처음부터 다시 보기
        </button>
      </div>

      {/* 공유 시트 */}
      {showShare && (
        <ShareSheet
          result={shareResult}
          userName={displayName}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
