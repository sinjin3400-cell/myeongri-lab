import { useState } from 'react';
import { haptic } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { ScoreRing } from '../components/ScoreRing';
import type { CompatResult } from '../types';

type Props = {
  result: CompatResult;
  onRestart: () => void;
  onHome: () => void;
};

type CardKey = 'overall' | 'love' | 'money' | 'communication';

const CARD_META: { key: CardKey; icon: string; title: string; gradient: string }[] = [
  { key: 'overall', icon: '🌟', title: '전체 궁합', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)' },
  { key: 'love', icon: '💕', title: '애정 궁합', gradient: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)' },
  { key: 'money', icon: '💰', title: '재물 궁합', gradient: 'linear-gradient(135deg, #854d0e 0%, #ca8a04 100%)' },
  { key: 'communication', icon: '💬', title: '소통 궁합', gradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' },
];

export function CompatResultStep({ result, onRestart, onHome }: Props) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const scoreLabel = result.score >= 85 ? '최고의 궁합!' :
    result.score >= 70 ? '아주 좋은 궁합이에요' :
    result.score >= 55 ? '서로 노력하면 더 좋아져요' : '서로를 이해하는 게 중요해요';

  return (
    <div className="app-page" style={{ paddingBottom: 120 }}>
      {/* 헤더 — 두 띠 */}
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 40 }}>{result.person1Emoji}</span>
            <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--navy-500)' }}>
              {result.person1Animal}띠
            </p>
          </div>
          <span style={{ fontSize: 28, color: 'var(--gold-500)' }}>×</span>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 40 }}>{result.person2Emoji}</span>
            <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--navy-500)' }}>
              {result.person2Animal}띠
            </p>
          </div>
        </div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--navy-700)' }}>
          궁합 결과
        </h1>
      </header>

      {/* 점수 + 요약 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{ textAlign: 'center', padding: '24px 20px', marginBottom: 24 }}
      >
        <ScoreRing score={result.score} size={110} />
        <p style={{ margin: '8px 0 4px', fontSize: 14, fontWeight: 600, color: 'var(--gold-600)' }}>
          {scoreLabel}
        </p>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--navy-700)', lineHeight: 1.5 }}>
          {result.summaryLine}
        </p>
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

      {/* 하단 CTA */}
      <div className="app-footer-cta">
        <button className="btn-primary" onClick={() => { haptic(); onRestart(); }}>
          다른 궁합 보기 💕
        </button>
        <button className="btn-secondary" onClick={() => { haptic(); onHome(); }}>
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
