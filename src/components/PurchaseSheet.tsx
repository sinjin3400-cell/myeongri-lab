import { haptic } from '../utils/haptic';
import { useInterstitialAd, AD_IDS } from '../hooks/useAds';
import { useIAP, SKU } from '../hooks/useIAP';
import { usePremiumPass } from '../hooks/usePremiumPass';
import { useSubscription } from '../hooks/useSubscription';
import { trackEvent } from '../utils/analytics';
import { AdBadge } from './AdBadge';
import { Analytics } from '@apps-in-toss/web-framework';

type Props = {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
  passCount: number;
  lockedCount?: number;
};

export function PurchaseSheet({ open, onClose, onPurchased, passCount, lockedCount = 2 }: Props) {
  const { showAd: showRewardedAd } = useInterstitialAd(AD_IDS.REWARDED, 'rewarded');
  const { purchaseConsumable, purchaseGoldenKey, loading: iapLoading } = useIAP();
  const { addPasses } = usePremiumPass();
  const { activate } = useSubscription();

  if (!open) return null;

  const handleSubscribe = () => {
    if (iapLoading) return;
    haptic();
    trackEvent('purchase_sheet_subscribe');
    purchaseGoldenKey(
      () => {
        activate(`gk_${Date.now()}`);
        onPurchased?.();
      },
      () => trackEvent('purchase_sheet_subscribe_error'),
    );
  };

  const handleBuy3 = () => {
    if (iapLoading) return;
    haptic();
    trackEvent('purchase_sheet_buy_3');
    purchaseConsumable(
      SKU.PASS_3,
      (amount) => {
        const { added } = addPasses(amount);
        if (added > 0) {
          try { Analytics.click({ log_name: 'pass_granted', source: 'iap_pass_3', amount: added }); } catch (_) { /* noop */ }
          trackEvent('pass_granted', { source: 'iap_pass_3', amount: added });
        }
        onPurchased?.();
      },
      () => trackEvent('purchase_sheet_buy_error'),
    );
  };

  const handleWatchAd = async () => {
    haptic();
    trackEvent('purchase_sheet_watch_ad');
    await showRewardedAd();
    const { added } = addPasses(1);
    if (added > 0) {
      try { Analytics.click({ log_name: 'pass_granted', source: 'rewarded_ad', amount: added }); } catch (_) { /* noop */ }
      trackEvent('pass_granted', { source: 'rewarded_ad', amount: added });
    }
    onPurchased?.();
  };

  return (
    <>
      {/* 딤 배경 */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(13,21,32,0.5)',
          zIndex: 100,
          animation: 'sheet-dim-in 0.25s ease',
        }}
      />

      {/* 바텀시트 */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 101,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: `10px 22px calc(16px + env(safe-area-inset-bottom, 0px))`,
        animation: 'sheet-slide-up 0.3s ease',
        maxWidth: 480, margin: '0 auto',
      }}>
        {/* 핸들 */}
        <div style={{
          width: 36, height: 4, borderRadius: 100,
          background: 'var(--navy-100)',
          margin: '0 auto 16px',
        }} />

        {/* 보유 티켓 상태 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 100,
            background: 'var(--gold-50)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>
            🎫
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy-400)' }}>
            보유 열람권 <span style={{ color: '#c4566a', fontWeight: 800 }}>{passCount}장</span>
          </div>
        </div>

        <h2 style={{
          margin: '0 0 6px', fontSize: 24, fontWeight: 800,
          color: 'var(--navy-700)', lineHeight: '30.72px',
          letterSpacing: '-0.84px',
        }}>
          숨겨진 운세 {lockedCount}개가<br/>더 있어요
        </h2>
        <p style={{
          margin: '0 0 20px', fontSize: 14, fontWeight: 500,
          color: 'var(--navy-400)', lineHeight: 1.5,
        }}>
          애정·금전운 상세 해설을 열어드릴게요.
        </p>

        {/* 황금열쇠 (Primary) */}
        <div style={{
          padding: '16px 18px', borderRadius: 24,
          background: 'linear-gradient(145deg, #fff9e5 0%, #fef0c2 50%, #f5d888 100%)',
          border: '1.5px solid #e9c768',
          position: 'relative', overflow: 'hidden',
          marginBottom: 10,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 30%, transparent 70%, rgba(212,168,75,0.2) 100%)',
            pointerEvents: 'none', borderRadius: 'inherit',
          }} />

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 12, position: 'relative',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              🗝️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#6b4e0e' }}>
                황금열쇠 · 월간 무제한
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#8a6715', marginTop: 2 }}>
                월간 무제한 이용
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 16, fontWeight: 800, color: '#6b4e0e',
                fontFeatureSettings: '"tnum"',
              }}>
                ₩3,300
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#8a6715' }}>/월</div>
            </div>
          </div>
          <button
            onClick={handleSubscribe}
            style={{
              width: '100%', padding: '14px 16px', fontSize: 14, fontWeight: 700,
              background: 'linear-gradient(135deg, #1a2744 0%, #2a3a5c 100%)',
              color: '#fff', border: 'none', borderRadius: 14,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              position: 'relative',
            }}
          >
            황금열쇠로 무제한 이용하기 <span style={{ color: '#d4a84b' }}>&rarr;</span>
          </button>
        </div>

        {/* 열람권 3장 (Secondary) */}
        <button
          onClick={handleBuy3}
          disabled={iapLoading}
          style={{
            width: '100%', padding: '14px 16px', marginBottom: 10,
            borderRadius: 14,
            background: iapLoading ? 'var(--navy-50)' : '#fff',
            border: '1.5px solid rgba(26,39,68,0.08)',
            cursor: iapLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🎫</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-700)' }}>
              {iapLoading ? '결제 진행 중...' : '열람권 3장 구매'}
            </span>
          </span>
          <span style={{
            fontSize: 14, fontWeight: 800, color: 'var(--navy-700)',
            fontFeatureSettings: '"tnum"',
          }}>
            ₩990
          </span>
        </button>

        {/* 광고 보기 (Tertiary) */}
        <button
          onClick={handleWatchAd}
          style={{
            width: '100%', padding: '14px 16px',
            background: 'transparent', border: 'none',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
            color: 'var(--navy-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer',
          }}
        >
          <AdBadge variant="light" />
          <span>보고 무료로 받기</span>
        </button>

        <p style={{
          margin: '4px 0 0', fontSize: 12, fontWeight: 500,
          color: 'var(--navy-300)', textAlign: 'center',
        }}>
          언제든 해지 가능 · 약관에 동의하고 구매
        </p>
      </div>
    </>
  );
}
