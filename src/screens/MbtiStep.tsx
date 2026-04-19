import { useRef, useEffect } from 'react';
import { haptic } from '../utils/haptic';
import { useTossBanner, AD_IDS } from '../hooks/useAds';
import { Analytics } from '@apps-in-toss/web-framework';
import type { MbtiType } from '../api';
import { MBTI_PROFILES } from '../data/mbtiProfiles';

type Props = {
  selected: MbtiType | null;
  onSelect: (m: MbtiType) => void;
  onSkip: () => void;
  onConfirm: () => void;
  onBack?: () => void;
  errorMessage: string | null;
};

const MBTI_ROWS: MbtiType[][] = [
  ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
  ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
  ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
];

export function MbtiStep({
  selected,
  onSelect,
  onSkip,
  onConfirm,
  onBack,
  errorMessage,
}: Props) {
  const selectedProfile = selected ? MBTI_PROFILES[selected] : null;

  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerReady || !bannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bannerRef.current, {
      theme: 'light',
      tone: 'blackAndWhite',
      variant: 'card',
    });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner]);

  return (
    <div className="app-page">
      {/* 헤더 */}
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        {onBack && (
          <button
            onClick={() => { haptic(); onBack(); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, color: 'var(--navy-700)', padding: '8px 12px 8px 0',
              fontFamily: 'inherit',
            }}
          >
            ‹
          </button>
        )}
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy-700)' }}>사주풀이</span>
        <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: 'var(--navy-300)' }}>2/4</span>
      </div>

      {/* 프로그레스 바 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--gold-500)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--gold-500)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(26,39,68,0.08)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(26,39,68,0.08)' }} />
      </div>

      {/* 섹션 라벨 + 타이틀 */}
      <div className="animate-fade-in" style={{ marginBottom: 8, animationDelay: '0.05s' }}>
        <p className="section-label" style={{ color: 'var(--gold-600)' }}>선택 정보</p>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: 'var(--navy-700)', lineHeight: 1.4, letterSpacing: '-0.02em' }}>
          MBTI를 알려주시면<br />더 정확해져요
        </h2>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--navy-400)', lineHeight: 1.5 }}>
          사주의 기운과 성향을 함께 풀어드려요.<br />모르셔도 괜찮아요.
        </p>
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div style={{
          padding: '12px 16px', borderRadius: 12,
          background: 'rgba(240, 68, 82, 0.08)', border: '1px solid rgba(240, 68, 82, 0.15)',
          marginBottom: 20,
        }}>
          <p style={{ margin: 0, fontSize: 14, color: '#e8627c', fontWeight: 500 }}>{errorMessage}</p>
        </div>
      )}

      {/* MBTI 4x4 그리드 */}
      <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, animationDelay: '0.1s' }}>
        {MBTI_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {row.map((m) => (
              <button
                key={m}
                type="button"
                className={`btn-chip ${selected === m ? 'selected' : ''}`}
                onClick={() => {
                  haptic();
                  try { Analytics.click({ log_name: 'mbti_select', mbti: m }); } catch (_) { /* noop */ }
                  onSelect(m);
                }}
                style={{ padding: '12px 6px', fontSize: 14 }}
              >
                {m}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* 선택된 MBTI 프로필 */}
      {selectedProfile && (
        <div className="premium-card gold-accent animate-fade-in" style={{ marginBottom: 24, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--green-500)' }}>{selected}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy-400)' }}>·</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy-600)' }}>{selectedProfile.nickname}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--navy-400)', lineHeight: 1.55 }}>
            {selectedProfile.values[0]} 성향. 사주의 기운과 잘 맞아요.
          </p>
        </div>
      )}

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <button
          onClick={() => { haptic(); onSkip(); }}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: 'rgba(26, 39, 68, 0.04)',
            border: '1.5px dashed rgba(26, 39, 68, 0.15)',
            borderRadius: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--navy-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          🤔  MBTI를 모르겠어요
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy-300)' }}>· 건너뛰기</span>
        </button>
        <button
          className="btn-primary"
          onClick={onConfirm}
          disabled={!selected}
        >
          다음 →
        </button>
      </div>

      {/* 하단 배너 광고 */}
      <div
        ref={bannerRef}
        style={{ marginTop: 20, minHeight: bannerReady ? 80 : 0, borderRadius: 12 }}
      />
    </div>
  );
}
