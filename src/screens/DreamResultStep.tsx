import { useState, useMemo } from 'react';
import { haptic } from '../utils/haptic';
import { PageHeader } from '../components/PageHeader';
import { useInterstitialAd, AD_IDS } from '../hooks/useAds';
import { trackEvent } from '../utils/analytics';
import type { DreamResult } from '../types';

type Tab = 'traditional' | 'psychological' | 'sajuLinked';

type Props = {
  result: DreamResult;
  userName?: string;
  onRestart: () => void;
  onHome: () => void;
};

const TYPE_STYLE: Record<DreamResult['type'], { bg: string; color: string; emoji: string }> = {
  길몽: { bg: 'rgba(34, 197, 94, 0.12)', color: '#059669', emoji: '🌟' },
  흉몽: { bg: 'rgba(220, 38, 38, 0.10)', color: '#b91c1c', emoji: '🌫️' },
  중립: { bg: 'rgba(100, 116, 139, 0.12)', color: '#475569', emoji: '🌙' },
};

export function DreamResultStep({ result, userName, onRestart, onHome }: Props) {
  const hasSaju = !!result.interpretation.sajuLinked;
  const [tab, setTab] = useState<Tab>('traditional');
  const [unlocked, setUnlocked] = useState(false);

  const { isLoaded: rewardLoaded, showAd } = useInterstitialAd(AD_IDS.REWARDED);

  const typeStyle = TYPE_STYLE[result.type];

  const visibleSets = useMemo(
    () => (unlocked ? result.luckyNumbers : result.luckyNumbers.slice(0, 1)),
    [unlocked, result.luckyNumbers],
  );

  const handleUnlock = async () => {
    haptic();
    trackEvent('dream_lotto_unlock_attempt', { rewardLoaded });
    if (!rewardLoaded) {
      // 광고 미준비 시 그냥 공개 (개발/네트워크 폴백)
      setUnlocked(true);
      return;
    }
    const rewarded = await showAd();
    if (rewarded) {
      trackEvent('dream_lotto_unlocked', {});
      setUnlocked(true);
    }
  };

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: 'traditional', label: '전통 해몽', show: !!result.interpretation.traditional },
    { key: 'psychological', label: '심리 해석', show: !!result.interpretation.psychological },
    { key: 'sajuLinked', label: '내 사주 결합', show: hasSaju },
  ];
  const visibleTabs = tabs.filter((t) => t.show);

  const activeText =
    tab === 'traditional'
      ? result.interpretation.traditional
      : tab === 'psychological'
        ? result.interpretation.psychological
        : (result.interpretation.sajuLinked || '');

  return (
    <div className="app-page" style={{ paddingBottom: 200 }}>
      <PageHeader title="꿈해몽 결과" subtitle={userName ? `${userName}님의 꿈 풀이` : '오늘의 꿈 풀이'} emoji="🌙" />

      {/* 요약 카드 */}
      <div
        className="premium-card animate-slide-up"
        style={{
          padding: '22px 20px',
          marginBottom: 18,
          background: 'linear-gradient(135deg, #2d1b69 0%, #4a2d8a 100%)',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            padding: '5px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            background: typeStyle.bg,
            color: '#fff',
            border: `1px solid ${typeStyle.color}`,
            marginBottom: 12,
          }}
        >
          {typeStyle.emoji} {result.type}
        </span>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 800, lineHeight: 1.5, letterSpacing: '-0.01em' }}>
          {result.summary}
        </p>
      </div>

      {/* 탭 */}
      {visibleTabs.length > 0 && (
        <div
          className="premium-card animate-slide-up"
          style={{ padding: 0, marginBottom: 16, animationDelay: '0.05s', overflow: 'hidden' }}
        >
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            {visibleTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => { haptic(); setTab(t.key); }}
                style={{
                  flex: 1,
                  padding: '14px 8px',
                  border: 'none',
                  background: tab === t.key ? 'rgba(167, 139, 250, 0.08)' : 'transparent',
                  color: tab === t.key ? '#6b21a8' : 'var(--navy-400)',
                  fontWeight: tab === t.key ? 800 : 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  borderBottom: tab === t.key ? '2px solid #a78bfa' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ padding: '18px 18px 20px' }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: 'var(--navy-600)', whiteSpace: 'pre-wrap' }}>
              {activeText || '해석 정보가 없어요.'}
            </p>
          </div>
        </div>
      )}

      {/* 사주 결합 안내 (사주 없는 경우) */}
      {!hasSaju && (
        <div
          className="premium-card"
          style={{
            padding: 14,
            marginBottom: 16,
            background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.08) 0%, rgba(255,255,255,0.95) 100%)',
            border: '1px dashed rgba(201, 169, 98, 0.4)',
          }}
        >
          <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--gold-600)' }}>
            🔮 더 정확한 해석을 원하시나요?
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--navy-400)', lineHeight: 1.55 }}>
            "오늘의 사주풀이"를 먼저 보고 오시면, 일주의 깊은 흐름과 결합한 개인화 꿈해몽을 받을 수 있어요.
          </p>
        </div>
      )}

      {/* 조언 카드 */}
      {result.advice && (
        <div
          className="premium-card gold-accent"
          style={{ padding: '16px 18px', marginBottom: 18 }}
        >
          <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: 'var(--gold-600)', letterSpacing: '0.06em' }}>
            ✨ 오늘의 조언
          </p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--navy-700)', lineHeight: 1.6 }}>
            {result.advice}
          </p>
        </div>
      )}

      {/* 키워드 분석 */}
      {result.keywords.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>
            🔑 꿈 속 키워드 → 행운 번호
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {result.keywords.map((kw) => (
              <div
                key={kw.word}
                className="premium-card"
                style={{ padding: '14px 16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>
                    {kw.word}
                  </span>
                  <span style={{ color: 'var(--navy-300)', fontSize: 13 }}>→</span>
                  {kw.numbers.map((n) => (
                    <span
                      key={n}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 800,
                        boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--navy-400)', lineHeight: 1.55 }}>
                  {kw.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 로또 번호 */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>
          🎰 행운의 로또 번호
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleSets.map((set, idx) => (
            <div
              key={idx}
              className="premium-card"
              style={{
                padding: '14px 16px',
                background: idx === 0
                  ? 'linear-gradient(135deg, rgba(201, 169, 98, 0.10) 0%, #fff 100%)'
                  : '#fff',
              }}
            >
              <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'var(--gold-600)' }}>
                세트 {idx + 1}
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {set.map((n) => (
                  <span
                    key={n}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#fff',
                      color: 'var(--navy-700)',
                      fontSize: 14,
                      fontWeight: 800,
                      border: '2px solid var(--gold-500)',
                      boxShadow: '0 1px 4px rgba(201, 169, 98, 0.25)',
                    }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!unlocked && (
          <button
            type="button"
            onClick={handleUnlock}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '14px 16px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              letterSpacing: '-0.01em',
            }}
          >
            🎬 광고 보고 4세트 더 받기
          </button>
        )}
      </div>

      {/* CTA */}
      <div className="app-footer-cta">
        <button className="btn-secondary" onClick={() => { haptic(); onRestart(); }}>
          다른 꿈 풀이하기 🌙
        </button>
        <button className="btn-primary" onClick={() => { haptic(); onHome(); }}>
          홈으로
        </button>
      </div>
    </div>
  );
}
