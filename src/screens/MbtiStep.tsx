import { generateHapticFeedback } from '@apps-in-toss/web-framework';
import { MbtiHeroIllustration } from '../components/MbtiHeroIllustration';
import type { MbtiType } from '../api';
import { MBTI_PROFILES } from '../data/mbtiProfiles';

type Props = {
  selected: MbtiType | null;
  onSelect: (m: MbtiType) => void;
  onSkip: () => void;
  onConfirm: () => void;
  errorMessage: string | null;
};

const MBTI_GROUPS = [
  { label: '분석형 NT', emoji: '🧠', types: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] as MbtiType[] },
  { label: '이상형 NF', emoji: '🦋', types: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] as MbtiType[] },
  { label: '안정형 SJ', emoji: '🛡️', types: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] as MbtiType[] },
  { label: '탐험형 SP', emoji: '🏄', types: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] as MbtiType[] },
];

export function MbtiStep({
  selected,
  onSelect,
  onSkip,
  onConfirm,
  errorMessage,
}: Props) {
  const selectedProfile = selected ? MBTI_PROFILES[selected] : null;

  return (
    <div className="app-page">
      {/* 히어로 */}
      <div className="animate-fade-in" style={{ marginBottom: 24 }}>
        <MbtiHeroIllustration />
      </div>

      {/* 헤더 */}
      <header
        className="animate-fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: 28,
          animationDelay: '0.1s',
        }}
      >
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
          나의 성격 유형은?
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--navy-400)',
            lineHeight: 1.6,
          }}
        >
          MBTI를 알려주시면 사주 해석을{' '}
          <span style={{ color: 'var(--gold-600)', fontWeight: 600 }}>
            나의 성격에 맞게
          </span>{' '}
          풀어드려요
        </p>
      </header>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            background: 'rgba(240, 68, 82, 0.08)',
            border: '1px solid rgba(240, 68, 82, 0.15)',
            marginBottom: 20,
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: '#e8627c', fontWeight: 500 }}>
            {errorMessage}
          </p>
        </div>
      )}

      {/* MBTI 그룹별 선택 */}
      <div
        className="stagger-children"
        style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 16 }}
      >
        {MBTI_GROUPS.map((group) => (
          <div key={group.label}>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--gold-500)',
                letterSpacing: '0.04em',
              }}
            >
              {group.emoji} {group.label}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
              }}
            >
              {group.types.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`btn-chip ${selected === m ? 'selected' : ''}`}
                  onClick={() => {
                    generateHapticFeedback({ type: 'softMedium' });
                    onSelect(m);
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 선택된 MBTI 미리보기 */}
      {selectedProfile && (
        <div
          className="premium-card gold-accent animate-fade-in"
          style={{ marginBottom: 20, padding: '16px 18px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>{selectedProfile.emoji}</span>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--navy-700)',
                }}
              >
                {selectedProfile.type} — {selectedProfile.nickname}
              </p>
            </div>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--navy-400)',
              lineHeight: 1.55,
            }}
          >
            핵심가치: {selectedProfile.values.join(' · ')}
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="app-footer-cta">
        <button
          className="btn-secondary"
          onClick={onSkip}
        >
          MBTI를 잘 모르겠어요 →
        </button>
        <button
          className="btn-primary"
          onClick={onConfirm}
          disabled={!selected}
          style={!selected ? { opacity: 0.85 } : {}}
        >
          {selected
            ? `${selected} 유형으로 운세 분석하기 ✨`
            : '먼저 MBTI를 선택해주세요'}
        </button>
      </div>
    </div>
  );
}
