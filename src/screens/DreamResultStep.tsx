import { useState, useMemo, useEffect, useRef } from 'react';
import { haptic } from '../utils/haptic';
import { ShareSheet } from '../components/ShareSheet';
import { useInterstitialAd, useTossBanner, AD_IDS } from '../hooks/useAds';
import { trackEvent } from '../utils/analytics';
import { Analytics } from '@apps-in-toss/web-framework';
import { usePremiumPass } from '../hooks/usePremiumPass';
import { useSubscription } from '../hooks/useSubscription';
import { PurchaseSheet } from '../components/PurchaseSheet';
import type { DreamResult } from '../types';

type Tab = 'traditional' | 'psychological' | 'sajuLinked';

type Props = {
  result: DreamResult;
  userName?: string;
  onRestart: () => void;
  onHome: () => void;
  onGoFortune?: () => void;
};

const TYPE_LABEL: Record<DreamResult['type'], { hanja: string; label: string; category: string }> = {
  길몽: { hanja: '吉', label: '길몽', category: '재물운 상승' },
  흉몽: { hanja: '凶', label: '흉몽', category: '주의 필요' },
  중립: { hanja: '中', label: '중립', category: '변화의 조짐' },
};

function getLottoBallGradient(n: number): string {
  if (n <= 10) return 'radial-gradient(circle at 30% 30%, #ffd166, #e8a008)';
  if (n <= 20) return 'radial-gradient(circle at 30% 30%, #73b9ff, #1a73e8)';
  if (n <= 30) return 'radial-gradient(circle at 30% 30%, #ff8a85, #c92a2a)';
  if (n <= 40) return 'radial-gradient(circle at 30% 30%, #b0b9c6, #495267)';
  return 'radial-gradient(circle at 30% 30%, #9ae6b4, #2f855a)';
}

export function DreamResultStep({ result, userName, onRestart, onHome, onGoFortune }: Props) {
  const hasSaju = !!result.interpretation.sajuLinked;
  const [tab, setTab] = useState<Tab>(hasSaju ? 'sajuLinked' : 'traditional');
  const [unlocked, setUnlocked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);

  const { isLoaded: rewardLoaded, showAd } = useInterstitialAd(AD_IDS.REWARDED);
  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const { count: passCount, hasPass, usePass, addPasses } = usePremiumPass();
  const { isSubscribed } = useSubscription();
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { Analytics.impression({ log_name: 'fortune_result_view', feature: 'dream' }); } catch (_) { /* noop */ }
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

  const typeInfo = TYPE_LABEL[result.type];

  const allUnlocked = unlocked || isSubscribed;
  const visibleSets = useMemo(
    () => (allUnlocked ? result.luckyNumbers : result.luckyNumbers.slice(0, 1)),
    [allUnlocked, result.luckyNumbers],
  );

  const handleUnlock = async () => {
    haptic();
    trackEvent('dream_lotto_unlock_attempt', { rewardLoaded });
    if (isSubscribed) {
      trackEvent('dream_lotto_unlocked', { method: 'subscription' });
      setUnlocked(true);
      return;
    }
    if (usePass()) {
      trackEvent('dream_lotto_unlocked', {});
      setUnlocked(true);
      return;
    }
    if (!hasPass) {
      setShowPurchase(true);
      return;
    }
    if (!rewardLoaded) {
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

  const hashtags = result.keywords.map((kw) => `#${kw.word}`);

  return (
    <div className="app-page" style={{ paddingBottom: 120, background: '#fefcf9' }}>
      <PurchaseSheet
        open={showPurchase}
        passCount={passCount}
        lockedCount={4}
        onClose={() => setShowPurchase(false)}
        onPurchased={() => {
          addPasses(1);
          setShowPurchase(false);
          trackEvent('dream_lotto_unlocked', {});
          setUnlocked(true);
        }}
      />
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
          꿈해몽
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
          {userName ? `${userName}님의 꿈 풀이` : '오늘의 꿈 풀이'}
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
          {result.summary}
        </h1>
      </header>

      {/* 히어로 카드 */}
      <div
        className="animate-slide-up"
        style={{
          padding: '22px 20px',
          marginBottom: 16,
          background: 'linear-gradient(180deg, #f1eefb 0%, #fff 60%)',
          border: '1px solid rgba(124, 106, 226, 0.18)',
          borderRadius: 22,
          boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 장식 SVG (우상단) */}
        <div style={{ position: 'absolute', top: -20, right: -10, opacity: 0.15 }}>
          <svg width="140" height="140" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#7c6ae2" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="24" cy="24" r="12" stroke="#7c6ae2" strokeWidth="1" />
            <path d="M24 14c-2 3-6 6-6 10a6 6 0 0012 0c0-4-4-7-6-10z" fill="#7c6ae2" opacity="0.4" />
          </svg>
        </div>

        <p style={{
          margin: '0 0 8px',
          fontSize: 12,
          fontWeight: 700,
          color: '#7c6ae2',
          letterSpacing: '0.06em',
          position: 'relative',
        }}>
          {typeInfo.hanja} · {typeInfo.label} · {typeInfo.category}
        </p>
        <p style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 500,
          color: '#455578',
          lineHeight: 1.7,
          letterSpacing: '-0.14px',
          position: 'relative',
        }}>
          "{result.advice}"
        </p>
      </div>

      {/* 탭 */}
      {visibleTabs.length > 0 && (
        <div
          className="animate-slide-up"
          style={{
            marginBottom: 16,
            animationDelay: '0.05s',
          }}
        >
          <div style={{
            display: 'flex',
            gap: 4,
            padding: 4,
            background: 'rgba(124, 106, 226, 0.08)',
            borderRadius: 12,
            marginBottom: 12,
          }}>
            {visibleTabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { haptic(); setTab(t.key); }}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: 9,
                    background: active ? '#fff' : 'transparent',
                    color: active ? 'var(--navy-700)' : '#97a2b8',
                    fontWeight: active ? 700 : 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    letterSpacing: '-0.13px',
                    transition: 'all 0.2s',
                    boxShadow: active ? '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)' : 'none',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* 해석 카드 */}
          <div style={{
            padding: '18px 20px',
            background: '#fff',
            border: '1px solid rgba(26,39,68,0.08)',
            borderRadius: 22,
            boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 4, height: 16, background: '#7c6ae2', borderRadius: 100, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--navy-700)' }}>
                {tab === 'traditional' ? '전통 해몽' : tab === 'psychological' ? '심리 해석' : '내 사주 결합 해석'}
              </p>
            </div>
            <p style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 500,
              lineHeight: '23.8px',
              color: '#455578',
              letterSpacing: '-0.14px',
              whiteSpace: 'pre-wrap',
            }}>
              {activeText || '해석 정보가 없어요.'}
            </p>

            {hashtags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: 'rgba(124, 106, 226, 0.1)',
                      color: '#5b49c8',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 사주 결합 안내 (사주 없는 경우) */}
      {!hasSaju && (
        <button
          type="button"
          onClick={() => {
            if (!onGoFortune) return;
            haptic();
            onGoFortune();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            padding: 14,
            marginBottom: 16,
            background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.10) 0%, rgba(255,255,255,0.95) 100%)',
            border: '1px dashed rgba(201, 169, 98, 0.45)',
            borderRadius: 22,
            cursor: onGoFortune ? 'pointer' : 'default',
            textAlign: 'left' as const,
            fontFamily: 'inherit',
            boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
          }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#b88a35' }}>
              더 정확한 해석을 원하시나요?
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#97a2b8', lineHeight: 1.55 }}>
              "오늘의 사주풀이"를 먼저 보고 오시면, 개인화 꿈해몽을 받을 수 있어요.
            </p>
          </div>
          {onGoFortune && (
            <span style={{ fontSize: 18, color: '#b88a35', flexShrink: 0 }}>→</span>
          )}
        </button>
      )}

      {/* 행운의 로또번호 */}
      <div
        className="animate-slide-up"
        style={{
          padding: '20px 18px',
          marginBottom: 16,
          background: 'linear-gradient(180deg, #fef9ec 0%, #fff 60%)',
          border: '1px solid rgba(212, 168, 75, 0.24)',
          borderRadius: 22,
          boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
          animationDelay: '0.1s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--navy-700)' }}>
            행운의 로또번호
          </p>
          <span style={{
            marginLeft: 'auto',
            fontSize: 10,
            fontWeight: 700,
            color: '#b88a35',
            padding: '3px 7px',
            background: '#fef9ec',
            borderRadius: 6,
          }}>
            5세트
          </span>
        </div>
        <p style={{
          margin: '0 0 16px',
          fontSize: 12,
          fontWeight: 500,
          color: '#97a2b8',
        }}>
          꿈의 기운을 담은 번호예요. 재미로만 참고하세요.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleSets.map((set, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 20,
                fontSize: 11,
                fontWeight: 800,
                color: '#97a2b8',
                fontFeatureSettings: '"tnum"',
              }}>
                #{idx + 1}
              </div>
              <div style={{ display: 'flex', gap: 6, flex: 1, justifyContent: 'space-between' }}>
                {set.map((n) => (
                  <span
                    key={n}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: 100,
                      background: getLottoBallGradient(n),
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 800,
                      fontFeatureSettings: '"tnum"',
                      letterSpacing: '-0.14px',
                      boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!allUnlocked && (
          <button
            type="button"
            onClick={handleUnlock}
            style={{
              marginTop: 14,
              width: '100%',
              padding: '14px 16px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #9b85e3 0%, #7c6ae2 100%)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(124, 106, 226, 0.3)',
              letterSpacing: '-0.14px',
            }}
          >
            {hasPass ? `황금 열람권으로 바로 보기 (${passCount}회 남음)` : '광고 보고 4세트 더 받기'}
          </button>
        )}
      </div>

      {/* 배너 광고 */}
      <div
        ref={bannerRef}
        style={{
          marginBottom: 16,
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
        {!bannerReady && '배너 광고 영역'}
      </div>

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
        꿈풀이 공유하기
      </button>

      {/* 하단 CTA */}
      <div className="app-footer-cta">
        <button className="btn-primary" onClick={() => { haptic(); onRestart(); }}>
          다른 꿈 풀이하기
        </button>
        <button className="btn-secondary" onClick={() => { haptic(); onHome(); }}>
          홈으로 돌아가기
        </button>
      </div>

      {/* 공유 시트 */}
      {showShare && (
        <ShareSheet
          shareInfo={{
            title: `${userName ?? '회원'}님의 꿈해몽 결과`,
            summaryLine: result.summary,
            extraLine: `${typeInfo.hanja} ${result.type} · ${result.advice}`,
            serverData: {
              n: userName ?? '회원',
              sl: result.summary,
              sc: 0,
              bc: 'overall' as const,
              bs: `${result.type} — ${result.advice}`,
              cc: 'overall' as const,
              cs: result.interpretation.traditional?.slice(0, 50) ?? '',
              lc: '', ln: 0, ld: '', li: '',
            },
          }}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
