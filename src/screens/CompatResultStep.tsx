import { useEffect, useRef, useState } from 'react';
import { haptic } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { Analytics } from '@apps-in-toss/web-framework';
import { ScoreRing } from '../components/ScoreRing';
import { ShareSheet } from '../components/ShareSheet';
import { useTossBanner, AD_IDS } from '../hooks/useAds';
import type { CompatResult, AppFeature } from '../types';

type Props = {
  result: CompatResult;
  onRestart: () => void;
  onHome: () => void;
  onSelectFeature?: (feature: AppFeature) => void;
};

type CardKey = 'overall' | 'love' | 'money' | 'communication';

const CARD_META: { key: CardKey; icon: string; title: string; gradient: string }[] = [
  { key: 'overall', icon: '🌟', title: '전체 궁합', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)' },
  { key: 'love', icon: '💕', title: '애정 궁합', gradient: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)' },
  { key: 'money', icon: '💰', title: '재물 궁합', gradient: 'linear-gradient(135deg, #854d0e 0%, #ca8a04 100%)' },
  { key: 'communication', icon: '💬', title: '소통 궁합', gradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' },
];

export function CompatResultStep({ result, onRestart, onHome, onSelectFeature }: Props) {
  const recommendations: { key: AppFeature; icon: string; title: string; desc: string; iconBg: string; tag?: string; tagColor?: string }[] = [
    { key: 'fortune', icon: '🔮', title: '오늘의 사주풀이', desc: '내 사주로 보는 자세한 운세',
      iconBg: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)' },
    { key: 'zodiac', icon: '🐲', title: '띠별 운세', desc: '내 띠로 보는 오늘의 운세',
      iconBg: 'linear-gradient(135deg, #854d0e 0%, #ca8a04 100%)' },
    { key: 'dream', icon: '💭', title: '꿈해몽', desc: '간밤의 꿈 풀이',
      iconBg: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' },
  ];

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);

  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const bannerRef = useRef<HTMLDivElement>(null);

  // 앱인토스 전환지표: 궁합 결과 화면 도달
  useEffect(() => {
    try { Analytics.impression({ log_name: 'fortune_result_view', feature: 'compat' }); } catch (_) { /* noop */ }
  }, []);

  useEffect(() => {
    if (!bannerReady || !bannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bannerRef.current, {
      theme: 'light', tone: 'blackAndWhite', variant: 'card',
    });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner]);

  const scoreLabel = result.score >= 85 ? '최고의 궁합!' :
    result.score >= 70 ? '아주 좋은 궁합이에요' :
    result.score >= 55 ? '서로 노력하면 더 좋아져요' : '서로를 이해하는 게 중요해요';

  // sub-score fallback (없으면 전체 점수 ±5 변동)
  const loveScore = result.loveScore ?? Math.max(40, Math.min(100, result.score + 3));
  const moneyScore = result.moneyScore ?? Math.max(40, Math.min(100, result.score - 4));
  const commScore = result.commScore ?? Math.max(40, Math.min(100, result.score + 1));

  const subScores = [
    { label: '애정', value: loveScore, color: '#e11d48', icon: '💕' },
    { label: '재물', value: moneyScore, color: '#ca8a04', icon: '💰' },
    { label: '소통', value: commScore, color: '#6366f1', icon: '💬' },
  ];

  const relationBadge = result.elementRelation
    ? {
        '상생': { label: '상생 관계', color: '#15803d', bg: 'rgba(34,197,94,0.15)' },
        '상극': { label: '상극 관계', color: '#b91c1c', bg: 'rgba(225,29,72,0.12)' },
        '중성': { label: '중성 관계', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
      }[result.elementRelation]
    : null;

  return (
    <div className="app-page" style={{ paddingBottom: 120 }}>
      {/* 헤더 */}
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 22 }}>
        <p style={{
          display: 'inline-block',
          margin: '0 0 10px',
          padding: '4px 12px',
          fontSize: 11.5,
          fontWeight: 700,
          color: 'var(--gold-700)',
          background: 'var(--gold-50)',
          border: '1px solid rgba(201,169,98,0.3)',
          borderRadius: 999,
          letterSpacing: '0.04em',
        }}>
          💞 우리 사이 궁합 결과
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 36 }}>{result.person1Emoji}</span>
            <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 700, color: 'var(--navy-600)' }}>
              {result.person1Animal}띠
            </p>
          </div>
          <span style={{ fontSize: 22, color: '#e11d48', fontWeight: 800, marginTop: -10 }}>♥</span>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 36 }}>{result.person2Emoji}</span>
            <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 700, color: 'var(--navy-600)' }}>
              {result.person2Animal}띠
            </p>
          </div>
        </div>
        <div style={{
          margin: '14px auto 0',
          width: 56, height: 2, borderRadius: 999,
          background: 'linear-gradient(90deg, transparent 0%, var(--gold-500) 50%, transparent 100%)',
        }} />
      </header>

      {/* 점수 + 두 사람 + 서브 점수 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{ padding: '22px 20px 20px', marginBottom: 22 }}
      >
        {/* 좌: 점수링 / 우: 두 사람 + 관계 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ flexShrink: 0 }}>
            <ScoreRing score={result.score} size={96} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 30 }}>{result.person1Emoji}</span>
              <span style={{ fontSize: 16, color: '#e11d48', fontWeight: 800 }}>♥</span>
              <span style={{ fontSize: 30 }}>{result.person2Emoji}</span>
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--navy-700)', letterSpacing: '-0.02em' }}>
              {result.person1Animal}띠 × {result.person2Animal}띠
            </p>
            {relationBadge && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 800,
                  color: relationBadge.color,
                  background: relationBadge.bg,
                  borderRadius: 999,
                }}
              >
                {relationBadge.label}
              </span>
            )}
            <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 600, color: 'var(--gold-600)' }}>
              {scoreLabel}
            </p>
          </div>
        </div>

        {/* 한줄 요약 */}
        <p style={{
          margin: '14px 0 0',
          fontSize: 15.5, fontWeight: 700,
          color: 'var(--navy-700)', lineHeight: 1.55,
          textAlign: 'center',
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.55)',
          borderRadius: 12,
        }}>
          {result.summaryLine}
        </p>

        {/* 서브 점수 막대 */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {subScores.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, width: 16 }}>{s.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy-600)', width: 28 }}>
                {s.label}
              </span>
              <div
                style={{
                  flex: 1, height: 8, borderRadius: 999,
                  background: 'rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${s.value}%`,
                    height: '100%',
                    background: s.color,
                    borderRadius: 999,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: s.color, width: 26, textAlign: 'right' }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* 키워드 */}
        {result.keywords && result.keywords.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            justifyContent: 'center', marginTop: 14,
          }}>
            {result.keywords.slice(0, 4).map((kw, i) => (
              <span
                key={i}
                style={{
                  padding: '5px 11px',
                  fontSize: 12, fontWeight: 700,
                  color: 'var(--gold-700, #854d0e)',
                  background: 'rgba(201,169,98,0.18)',
                  border: '1px solid rgba(201,169,98,0.35)',
                  borderRadius: 999,
                }}
              >
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 궁합 카드 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {CARD_META.map((card, i) => {
          const body = result[card.key];
          const detail = card.key === 'overall' ? result.overallDetail : undefined;
          const isExpanded = expandedCard === card.key;

          return (
            <div
              key={card.key}
              className={`premium-card animate-slide-up${isExpanded ? ' active' : ''}`}
              style={{ animationDelay: `${0.15 + i * 0.05}s`, overflow: 'hidden' }}
            >
              <button
                type="button"
                onClick={() => {
                  haptic();
                  trackEvent('compat_card_expand', { card: card.key });
                  setExpandedCard(isExpanded ? null : card.key);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '16px 18px',
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <span
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: card.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}
                >
                  {card.icon}
                </span>
                <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: 'var(--navy-700)' }}>
                  {card.title}
                </span>
                <span style={{ fontSize: 12, color: 'var(--navy-300)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  ▼
                </span>
              </button>

              <div className={`accordion-content${isExpanded ? ' open' : ''}`}>
                <div style={{ padding: '0 18px 16px' }}>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--navy-600)', whiteSpace: 'pre-line' }}>
                    {body}
                  </p>
                  {detail && (
                    <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.7, color: 'var(--navy-400)', whiteSpace: 'pre-line' }}>
                      {detail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 관계 조언 */}
      {result.advice && (
        <div
          className="premium-card animate-slide-up"
          style={{
            marginTop: 14, padding: '18px 20px',
            background: 'linear-gradient(135deg, rgba(159,18,57,0.06) 0%, rgba(225,29,72,0.03) 100%)',
            animationDelay: '0.4s',
          }}
        >
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#e11d48', letterSpacing: '0.04em' }}>
            💡 관계를 더 좋게 만드는 조언
          </p>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--navy-600)', whiteSpace: 'pre-line' }}>
            {result.advice}
          </p>
        </div>
      )}

      {/* 다른 기능 추천 CTA */}
      <div className="animate-slide-up" style={{ marginTop: 24, animationDelay: '0.45s' }}>
        <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--navy-600)', textAlign: 'center' }}>
          ✨ 명리연구소의 다른 기능도 만나보세요
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recommendations.map((rec) => (
            <button
              key={rec.key}
              type="button"
              onClick={() => {
                haptic();
                trackEvent('compat_cta_click', { feature: rec.key });
                if (onSelectFeature) onSelectFeature(rec.key);
                else onHome();
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px',
                background: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                borderRadius: 18,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 6px 18px rgba(15,23,42,0.06)',
              }}
            >
              <span
                style={{
                  width: 44, height: 44, borderRadius: 13,
                  background: rec.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(30,41,59,0.18)',
                }}
              >
                {rec.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>
                    {rec.title}
                  </p>
                  {rec.tag && (
                    <span style={{
                      padding: '2px 7px', fontSize: 10, fontWeight: 700,
                      color: rec.tagColor, background: `${rec.tagColor}15`,
                      border: `1px solid ${rec.tagColor}33`,
                      borderRadius: 6, letterSpacing: '0.02em',
                    }}>{rec.tag}</span>
                  )}
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, fontWeight: 500, color: 'var(--navy-400)' }}>
                  {rec.desc}
                </p>
              </div>
              <span style={{
                width: 26, height: 26, borderRadius: 999,
                background: 'rgba(15,23,42,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: 'var(--navy-400)', fontWeight: 700,
                flexShrink: 0,
              }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 배너 광고 */}
      <div
        ref={bannerRef}
        style={{
          marginTop: 22, minHeight: 80,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          border: bannerReady ? 'none' : '1.5px dashed var(--navy-200, #cbd5e1)',
          borderRadius: 12,
          background: bannerReady ? 'transparent' : 'rgba(0,0,0,0.02)',
          color: 'var(--navy-300)', fontSize: 12, fontWeight: 600,
        }}
      >
        {!bannerReady && '🎯 배너 광고 영역 (테스트)'}
      </div>

      {/* 공유 버튼 */}
      <button
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          marginTop: 20,
          marginBottom: 14,
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
        onClick={() => { haptic(); setShowShare(true); }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M13.5 6a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM4.5 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM13.5 16.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM6.44 10.24l5.13 2.77M11.56 5l-5.12 2.75"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        ✨ 친구에게 결과 공유하기
      </button>

      {/* 하단 CTA */}
      <div className="app-footer-cta">
        <button className="btn-primary" onClick={() => { haptic(); onRestart(); }}>
          다른 궁합 보기 💕
        </button>
        <button className="btn-secondary" onClick={() => { haptic(); onHome(); }}>
          홈으로 돌아가기
        </button>
      </div>

      {/* 공유 시트 */}
      {showShare && (
        <ShareSheet
          shareInfo={{
            title: `${result.person1Animal}띠 × ${result.person2Animal}띠 궁합`,
            summaryLine: result.summaryLine,
            score: result.score,
            extraLine: `💕 ${result.person1Emoji} × ${result.person2Emoji} · ${result.elementRelation ?? ''} 관계`,
            serverData: {
              n: `${result.person1Animal}띠 × ${result.person2Animal}띠`,
              sl: result.summaryLine,
              sc: result.score,
              bc: 'love' as const,
              bs: result.summaryLine,
              cc: 'overall' as const,
              cs: `${result.elementRelation ?? ''} 관계`,
              lc: '', ln: 0, ld: '', li: '',
            },
          }}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
