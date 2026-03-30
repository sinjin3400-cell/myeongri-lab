import { useState } from 'react';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';
import { ResultSparkleDecor } from '../components/ResultSparkleDecor';
import { ScoreRing } from '../components/ScoreRing';
import { ShareSheet } from '../components/ShareSheet';
import type { FortuneResult, FortunePeriod } from '../types';
import type { MbtiType } from '../api';
import { MBTI_PROFILES } from '../data/mbtiProfiles';
import { mergeLucky } from '../utils/lucky';

type Props = {
  result: FortuneResult;
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

function AccordionCard({
  section,
  body,
  detail,
}: {
  section: FortuneSection;
  body: string;
  detail?: string;
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

export function ResultStep({
  result,
  userName,
  mbti,
  period,
  onChangePeriod,
  onRestart,
  onTomorrow,
}: Props) {
  const [showShare, setShowShare] = useState(false);
  const displayName = userName.trim() || '회원';
  const mbtiProfile = mbti ? MBTI_PROFILES[mbti] : null;
  const lucky = mergeLucky(result.lucky);

  const periodLabel = period === 'today' ? '오늘' : period === 'week' ? '이번 주' : '이번 달';

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

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
        <ScoreRing score={result.score} size={88} />
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
            {result.summaryLine}
          </p>
          {result.mbtiInsight && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--gold-600)',
                lineHeight: 1.45,
              }}
            >
              {result.mbtiInsight}
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
          <span
            className="lucky-color-dot"
            style={{ background: lucky.colorHex }}
          />
          행운색: {lucky.color}
        </div>
        <div className="lucky-badge">
          🔢 행운숫자: {lucky.number}
        </div>
        <div className="lucky-badge">
          🧭 행운방향: {lucky.direction}
        </div>
        <div className="lucky-badge">
          🍀 행운아이템: {lucky.item}
        </div>
      </div>

      {/* 운세 카드들 — 아코디언 */}
      <div
        className="stagger-children"
        style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}
      >
        {SECTIONS.map((sec) => (
          <AccordionCard
            key={sec.key}
            section={sec}
            body={result[sec.key]}
            detail={result[sec.detailKey]}
          />
        ))}
      </div>

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
          result={result}
          userName={displayName}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
