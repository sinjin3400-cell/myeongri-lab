import { useEffect, useRef, useState } from 'react';
import { haptic } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { Analytics } from '@apps-in-toss/web-framework';
import { SemiCircleGauge } from '../components/SemiCircleGauge';
import { ShareSheet } from '../components/ShareSheet';
import { useTossBanner, useInterstitialAd, AD_IDS } from '../hooks/useAds';
import type { CompatResult, CompatInput, AppFeature } from '../types';

type Props = {
  result: CompatResult;
  input?: CompatInput;
  onRestart: () => void;
  onHome: () => void;
  onSelectFeature?: (feature: AppFeature) => void;
};

export function CompatResultStep({ result, input, onRestart, onHome }: Props) {
  const [showShare, setShowShare] = useState(false);

  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const bannerRef = useRef<HTMLDivElement>(null);

  const { showAd: showInterstitialAd } = useInterstitialAd(AD_IDS.INTERSTITIAL);
  useEffect(() => { showInterstitialAd(); }, []);

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

  const loveScore = result.loveScore ?? Math.max(40, Math.min(100, result.score + 3));
  const moneyScore = result.moneyScore ?? Math.max(40, Math.min(100, result.score - 4));
  const commScore = result.commScore ?? Math.max(40, Math.min(100, result.score + 1));

  const p1Name = input?.person1?.name || '나';
  const p2Name = input?.person2?.name || '상대';
  const p1Year = input?.person1?.birthYear || '';
  const p2Year = input?.person2?.birthYear || '';
  const p1GenderLabel = input?.person1?.gender === 'female' ? '여' : input?.person1?.gender === 'male' ? '남' : '';
  const p2GenderLabel = input?.person2?.gender === 'female' ? '여' : input?.person2?.gender === 'male' ? '남' : '';

  const relationLabel = result.elementRelation ? `${result.elementRelation} 관계` : '연인 궁합';

  const subScores = [
    { key: 'love', label: '애정 궁합', desc: '깊은 정서적 연결', value: loveScore, color: '#d1577a' },
    { key: 'money', label: '재물 궁합', desc: '안정적인 흐름', value: moneyScore, color: '#d4a84b' },
    { key: 'communication', label: '소통 궁합', desc: '편안한 대화', value: commScore, color: '#4b7ba5' },
  ];

  return (
    <div className="app-page" style={{ paddingBottom: 120, background: '#fefcf9' }}>
      {/* 헤더: 뒤로가기 + 타이틀 + 스텝 */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <button
          onClick={() => { haptic(); onRestart(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: 'var(--navy-700)', padding: '8px 12px 8px 0',
            fontFamily: 'inherit',
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy-700)' }}>
          궁합보기
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: 'var(--navy-300)' }}>
          3/3
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--gold-500)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--gold-500)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--gold-500)' }} />
      </div>

      {/* 날짜 + 이름 */}
      <header className="animate-fade-in" style={{ marginBottom: 16 }}>
        <p style={{
          margin: '0 0 4px',
          fontSize: 12,
          fontWeight: 500,
          color: '#97a2b8',
          lineHeight: '18px',
        }}>
          {p1Name} × {p2Name} · {relationLabel}
        </p>
        <h1 style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 800,
          color: 'var(--navy-700)',
          letterSpacing: '-0.84px',
          lineHeight: '30.72px',
          whiteSpace: 'pre-line',
        }}>
          {result.summaryLine}
        </h1>
      </header>

      {/* 두 사람 + 점수 카드 */}
      <div
        className="animate-slide-up"
        style={{
          padding: '22px 20px 16px',
          marginBottom: 16,
          background: 'linear-gradient(180deg, #fbe8ed 0%, #fff 55%)',
          border: '1px solid rgba(209, 87, 122, 0.18)',
          borderRadius: 22,
          boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
        }}
      >
        {/* 두 사람 원형 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 100,
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800,
              color: '#2a3a5c',
            }}>
              {p1Name}
            </div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#455578' }}>
              {p1Year}{p1GenderLabel ? ` · ${p1GenderLabel}` : ''}
            </p>
          </div>

          <span style={{ fontSize: 22, color: '#d1577a' }}>♥</span>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 100,
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800,
              color: '#d1577a',
            }}>
              {p2Name}
            </div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#455578' }}>
              {p2Year}{p2GenderLabel ? ` · ${p2GenderLabel}` : ''}
            </p>
          </div>
        </div>

        <SemiCircleGauge score={result.score} size={200} label="종합 궁합" />
      </div>

      {/* 분야별 궁합 카드 */}
      <div
        className="animate-slide-up"
        style={{
          padding: 18,
          marginBottom: 16,
          background: '#fff',
          border: '1px solid rgba(26,39,68,0.08)',
          borderRadius: 22,
          boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
          animationDelay: '0.1s',
        }}
      >
        <p style={{
          margin: '0 0 14px',
          fontSize: 13,
          fontWeight: 800,
          color: 'var(--navy-700)',
        }}>
          분야별 궁합
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {subScores.map((s) => (
            <div key={s.key}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--navy-700)' }}>
                    {s.label}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: '#6a7896' }}>
                    {s.desc}
                  </p>
                </div>
                <span style={{
                  fontSize: 18, fontWeight: 800,
                  color: s.color,
                  fontFeatureSettings: '"tnum"',
                }}>
                  {s.value}
                </span>
              </div>
              <div style={{
                height: 6, borderRadius: 100,
                background: '#f1f3f8',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${s.value}%`,
                  height: '100%',
                  background: s.color,
                  borderRadius: 100,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 관계 조언 */}
      {result.advice && (
        <div
          className="animate-slide-up"
          style={{
            padding: '18px 20px',
            marginBottom: 16,
            background: '#fff',
            border: '1px solid rgba(26,39,68,0.08)',
            borderRadius: 22,
            boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
            animationDelay: '0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 4, height: 16, background: '#d1577a', borderRadius: 100, flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--navy-700)' }}>관계 조언</p>
          </div>
          <p style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 500,
            color: '#455578',
            lineHeight: '23.8px',
            letterSpacing: '-0.14px',
            whiteSpace: 'pre-line',
          }}>
            {result.advice}
          </p>
          {result.keywords && result.keywords.length > 0 && (
            <div style={{
              marginTop: 14,
              padding: '10px 12px',
              background: '#fdf8f1',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              color: '#2a3a5c',
            }}>
              💡 이번 주 함께하기 좋은 활동: {result.keywords.slice(0, 3).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* 공유 버튼 */}
      <button
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          marginBottom: 14,
          padding: '16px 22px',
          fontSize: 16,
          fontWeight: 700,
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          cursor: 'pointer',
          fontFamily: 'inherit',
          letterSpacing: '-0.32px',
          background: 'linear-gradient(135deg, #d4a84b 0%, #b88a35 100%)',
          boxShadow: '0 6px 20px rgba(212, 168, 75, 0.22)',
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
        {p2Name}에게 결과 보내기
      </button>

      {/* 하단 배너 광고 */}
      <div
        ref={bannerRef}
        style={{
          marginTop: 8, minHeight: 80,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          border: bannerReady ? 'none' : '1.5px dashed var(--navy-200, #cbd5e1)',
          borderRadius: 12,
          background: bannerReady ? 'transparent' : 'rgba(0,0,0,0.02)',
          color: 'var(--navy-300)', fontSize: 12, fontWeight: 600,
        }}
      >
        {!bannerReady && '배너 광고 영역 (테스트)'}
      </div>

      {/* 하단 CTA */}
      <div className="app-footer-cta">
        <button className="btn-primary" onClick={() => { haptic(); onRestart(); }}>
          다른 궁합 보기
        </button>
        <button className="btn-secondary" onClick={() => { haptic(); onHome(); }}>
          홈으로 돌아가기
        </button>
      </div>

      {/* 공유 시트 */}
      {showShare && (
        <ShareSheet
          shareInfo={{
            title: `${p1Name} × ${p2Name} 궁합`,
            summaryLine: result.summaryLine,
            score: result.score,
            extraLine: `${p1Name} × ${p2Name} · ${result.elementRelation ?? ''} 관계`,
            serverData: {
              n: `${p1Name} × ${p2Name}`,
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
