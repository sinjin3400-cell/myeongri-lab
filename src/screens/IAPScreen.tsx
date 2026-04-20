import { useState } from 'react';
import { haptic } from '../utils/haptic';
import { NavBackButton } from '../components/NavBackButton';
import { usePremiumPass } from '../hooks/usePremiumPass';
import { useSubscription } from '../hooks/useSubscription';
import { useInterstitialAd, AD_IDS } from '../hooks/useAds';
import { useIAP, SKU } from '../hooks/useIAP';
import { trackEvent } from '../utils/analytics';

type Props = {
  onBack: () => void;
};

const PACKS = [
  { n: 3, price: 990, save: null, best: false, sku: SKU.PASS_3 },
  { n: 5, price: 1540, save: '220원 할인', best: false, sku: SKU.PASS_5 },
  { n: 10, price: 2750, save: '550원 할인', best: true, sku: SKU.PASS_10 },
] as const;

export function IAPScreen({ onBack }: Props) {
  const { count, addPasses } = usePremiumPass();
  const { isSubscribed, activate } = useSubscription();
  const { showAd: showRewardedAd } = useInterstitialAd(AD_IDS.REWARDED);
  const { purchaseConsumable, purchaseGoldenKey, loading: iapLoading } = useIAP();
  const [selectedPack, setSelectedPack] = useState(1);

  const handleSubscribe = () => {
    if (iapLoading) return;
    haptic();
    trackEvent('iap_subscribe_click');
    purchaseGoldenKey(
      () => {
        activate(`gk_${Date.now()}`);
      },
      () => trackEvent('iap_subscribe_error'),
    );
  };

  const handleBuyPack = () => {
    if (iapLoading) return;
    haptic();
    const pack = PACKS[selectedPack];
    trackEvent('iap_buy_pack', { n: pack.n, price: pack.price });
    purchaseConsumable(
      pack.sku,
      (amount) => addPasses(amount),
      () => trackEvent('iap_buy_pack_error', { n: pack.n }),
    );
  };

  const handleWatchAd = async () => {
    haptic();
    trackEvent('iap_watch_ad');
    await showRewardedAd();
    addPasses(1);
  };

  return (
    <div className="app-page" style={{ background: 'var(--cream-50)' }}>
      {/* 헤더: 뒤로가기 + 타이틀 + 보유 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <NavBackButton onClick={onBack} />
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy-700)' }}>
          열람권 구매
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: 12, fontWeight: 700,
          color: 'var(--gold-600)',
        }}>
          🎫 {count}장 보유
        </span>
      </div>

      {/* 섹션 헤더 */}
      <div style={{ marginBottom: 20, marginTop: 12 }}>
        <p style={{
          margin: '0 0 8px', fontSize: 11, fontWeight: 800,
          color: 'var(--gold-600)', letterSpacing: '0.06em',
        }}>
          PREMIUM
        </p>
        <h1 style={{
          margin: 0, fontSize: 24, fontWeight: 800,
          color: 'var(--navy-700)', lineHeight: '30.72px',
          letterSpacing: '-0.84px',
        }}>
          더 깊은 운세,<br/>더 많이 열어보세요
        </h1>
      </div>

      {/* 황금열쇠 구독 카드 */}
      <div style={{
        padding: '22px 20px', borderRadius: 24,
        background: 'linear-gradient(145deg, #fff9e5 0%, #fef0c2 50%, #f5d888 100%)',
        border: '1.5px solid #e9c768',
        position: 'relative', overflow: 'hidden',
        marginBottom: 16,
      }}>
        {/* shimmer overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 30%, transparent 70%, rgba(212,168,75,0.2) 100%)',
          pointerEvents: 'none', borderRadius: 'inherit',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, position: 'relative' }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14,
            background: 'linear-gradient(135deg, #fff 0%, #f5e1a8 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(212, 168, 75, 0.25)',
            fontSize: 26,
          }}>
            🗝️
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              display: 'inline-block', fontSize: 10, fontWeight: 800,
              color: '#8a6715', background: '#fff',
              padding: '3px 8px', borderRadius: 6,
              letterSpacing: '0.06em', marginBottom: 4,
              width: 'fit-content',
            }}>
              월간 무제한
            </span>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#6b4e0e', letterSpacing: '-0.02em' }}>
              황금열쇠
            </div>
          </div>
        </div>

        {/* 혜택 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, position: 'relative' }}>
          {[
            '사주·꿈·궁합 모든 프리미엄 운세 무제한',
            '내일·주간·월간 운세 광고 없이 바로',
            '황금 전용 운세 카드 & 상세 해설',
            '언제든 해지 가능',
          ].map(t => (
            <div key={t} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 13, fontWeight: 600, color: '#6b4e0e',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 100,
                background: '#d4a84b',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2.5 5.5L4.5 7.5L8.5 3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {t}
            </div>
          ))}
        </div>

        {/* 가격 */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 6,
          marginBottom: 6, position: 'relative',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#8a6715', textDecoration: 'line-through' }}>
            ₩4,400
          </span>
          <span style={{
            fontSize: 26, fontWeight: 800, color: '#6b4e0e',
            letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"',
          }}>
            ₩3,300
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#8a6715' }}>/월</span>
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 800,
            color: '#fff', background: '#d1577a',
            padding: '3px 8px', borderRadius: 6,
          }}>
            25% OFF
          </span>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, color: '#8a6715',
          marginBottom: 14, position: 'relative',
        }}>
          ✦ 첫 7일 무료 · 결제일 전 취소 가능
        </div>

        <button
          onClick={handleSubscribe}
          disabled={isSubscribed || iapLoading}
          style={{
            width: '100%', padding: '16px 22px', fontSize: 15, fontWeight: 700,
            background: isSubscribed
              ? 'linear-gradient(135deg, #38B07E 0%, #2d9469 100%)'
              : 'linear-gradient(135deg, #1a2744 0%, #2a3a5c 100%)',
            color: '#fff', border: 'none', borderRadius: 14,
            cursor: isSubscribed ? 'default' : iapLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(26,39,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            position: 'relative',
            opacity: iapLoading ? 0.7 : 1,
          }}
        >
          {isSubscribed
            ? '✅ 황금열쇠 이용 중'
            : iapLoading
              ? '결제 진행 중...'
              : <>🗝️ 황금열쇠 시작하기 <span style={{ color: '#d4a84b' }}>&rarr;</span></>
          }
        </button>
      </div>

      {/* 열람권 충전소 카드 */}
      <div style={{
        padding: '20px', borderRadius: 22,
        background: '#fff',
        border: '1px solid rgba(26,39,68,0.08)',
        boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--navy-50)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            🎫
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>열람권 충전소</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy-400)' }}>3장 ₩990부터 · 묶음 구매</div>
          </div>
          <div style={{
            marginLeft: 'auto', padding: '5px 10px',
            background: 'var(--gold-50)', borderRadius: 8,
            fontSize: 11, fontWeight: 800, color: 'var(--gold-600)',
          }}>
            보유 {count}장
          </div>
        </div>

        <div style={{
          fontSize: 12, fontWeight: 500, color: 'var(--navy-400)',
          marginBottom: 14, lineHeight: 1.6,
        }}>
          가볍게 한 번만 볼 때 좋아요. 원하는 만큼 고르세요.
        </div>

        {/* 팩 옵션 선택 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {PACKS.map((p, i) => {
            const sel = selectedPack === i;
            return (
              <button
                key={p.n}
                type="button"
                onClick={() => { haptic(); setSelectedPack(i); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 12,
                  background: sel ? 'var(--gold-50)' : '#fff',
                  border: sel ? '1.5px solid var(--gold-500)' : '1.5px solid rgba(26,39,68,0.08)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                {/* 라디오 */}
                <div style={{
                  width: 20, height: 20, borderRadius: 100,
                  border: sel ? '6px solid var(--gold-500)' : '1.5px solid var(--navy-200)',
                  background: sel ? '#fff' : 'transparent',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>{p.n}장</span>
                    {p.save && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, color: '#c4566a',
                        background: '#fbe8ed', padding: '2px 6px', borderRadius: 5,
                      }}>
                        {p.save}
                      </span>
                    )}
                    {p.best && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, color: '#fff',
                        background: '#d4a84b', padding: '2px 6px', borderRadius: 5,
                      }}>
                        BEST
                      </span>
                    )}
                  </div>
                </div>
                <span style={{
                  fontSize: 15, fontWeight: 800, color: 'var(--navy-700)',
                  fontFeatureSettings: '"tnum"',
                }}>
                  ₩{p.price.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleBuyPack}
          disabled={iapLoading}
          style={{
            width: '100%', padding: '16px 22px', fontSize: 15, fontWeight: 700,
            background: iapLoading
              ? 'var(--navy-200)'
              : 'linear-gradient(135deg, var(--gold-500) 0%, var(--gold-400) 100%)',
            color: '#fff', border: 'none', borderRadius: 14,
            cursor: iapLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            boxShadow: iapLoading ? 'none' : '0 6px 20px rgba(212, 168, 75, 0.22)',
          }}
        >
          {iapLoading ? '결제 진행 중...' : `${PACKS[selectedPack].n}장 구매하기 · ₩${PACKS[selectedPack].price.toLocaleString()}`}
        </button>

        {/* 광고 버튼 */}
        <button
          onClick={handleWatchAd}
          style={{
            width: '100%', marginTop: 10,
            padding: '14px 12px', borderRadius: 12,
            background: 'transparent',
            border: '1.5px dashed rgba(26,39,68,0.08)',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
            color: 'var(--navy-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 1l7 4-7 4V1z" fill="currentColor"/>
          </svg>
          광고 보고 무료 열람권 받기
        </button>
      </div>

      {/* 약관 안내 */}
      <p style={{
        margin: 0, fontSize: 12, fontWeight: 500,
        color: 'var(--navy-300)', textAlign: 'center',
        padding: '0 12px', lineHeight: 1.6,
      }}>
        구매 전 약관과 환불 정책을 확인해주세요.<br/>
        정기 결제는 언제든 해지 가능하며 다음 결제일 전 취소 시 요금이 청구되지 않아요.
      </p>
    </div>
  );
}
