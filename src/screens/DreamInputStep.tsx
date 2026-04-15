import { useState } from 'react';
import { haptic } from '../utils/haptic';
import { PageHeader } from '../components/PageHeader';
import { Analytics } from '@apps-in-toss/web-framework';
import type { DreamInput, UserInfo } from '../types';

type Props = {
  value: DreamInput;
  onChange: (v: DreamInput) => void;
  onNext: () => void;
  onBack: () => void;
  /** 사주 정보 자동 재사용 가능 여부 (App.tsx에서 info 채워졌는지로 판단) */
  hasSajuInfo: boolean;
  userInfo?: UserInfo | null;
};

const MIN_LEN = 5;
const MAX_LEN = 500;

const PLACEHOLDER_EXAMPLE = `예) 하늘을 날다가 황금빛 문을 열었는데, 문 뒤에 넓은 꽃밭이 펼쳐져 있었어요. 누군가 손을 흔들고 있었는데 잠에서 깼어요.`;

export function DreamInputStep({ value, onChange, onNext, onBack, hasSajuInfo, userInfo }: Props) {
  const [touched, setTouched] = useState(false);

  const text = value.text;
  const trimmedLen = text.trim().length;
  const isValid = trimmedLen >= MIN_LEN;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    haptic();
    try { Analytics.click({ log_name: 'dream_submit' }); } catch (_) { /* noop */ }
    onNext();
  };

  return (
    <div className="app-page" style={{ paddingBottom: 200 }}>
      <PageHeader title="꿈해몽" subtitle="간밤의 꿈이 알려주는 메시지" emoji="🌙" />

      {/* 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--navy-700)', letterSpacing: '-0.02em' }}>
          🌙 간밤에 꾼 꿈을<br />자유롭게 들려주세요
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--navy-400)', lineHeight: 1.55 }}>
          AI가 한국 전통 해몽과 심리학을 더해<br />꿈의 의미와 행운의 번호를 풀어드려요
        </p>
      </div>

      {/* 입력 텍스트영역 */}
      <div
        className="premium-card"
        style={{
          padding: 16,
          marginBottom: 14,
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.06) 0%, rgba(255,255,255,0.95) 100%)',
        }}
      >
        <textarea
          value={text}
          onChange={(e) => onChange({ ...value, text: e.target.value.slice(0, MAX_LEN) })}
          placeholder={PLACEHOLDER_EXAMPLE}
          rows={7}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--navy-700)',
            background: 'transparent',
            fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: touched && !isValid ? '#dc2626' : 'var(--navy-300)' }}>
            {touched && !isValid ? `최소 ${MIN_LEN}자 이상 입력해 주세요` : `${trimmedLen} / ${MAX_LEN}`}
          </span>
        </div>
      </div>

      {/* 안내 문구 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          marginBottom: 18,
          padding: '12px 14px',
          background: 'rgba(167, 139, 250, 0.06)',
          borderRadius: 12,
          border: '1px solid rgba(167, 139, 250, 0.12)',
        }}
      >
        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--navy-400)', lineHeight: 1.6 }}>
          장소, 인물, 느낌 등 <span style={{ color: 'var(--navy-600)', fontWeight: 600 }}>기억나는 만큼 자유롭게</span> 적어주세요.
          한 줄이어도 괜찮아요 — 자세할수록 더 깊은 풀이를 받을 수 있어요 ✨
        </p>
      </div>

      {/* 사주 결합 토글 */}
      <div
        className="premium-card"
        style={{
          padding: 14,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: hasSajuInfo
            ? 'linear-gradient(135deg, rgba(201, 169, 98, 0.08) 0%, rgba(255,255,255,0.95) 100%)'
            : 'rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--navy-700)' }}>
            🔮 내 사주와 결합해서 해석
          </p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--navy-400)', lineHeight: 1.5 }}>
            {hasSajuInfo
              ? `${userInfo?.name || ''}님의 사주 정보가 자동으로 반영돼요`
              : '먼저 "오늘의 사주풀이"를 보고 오면 활성화돼요'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!hasSajuInfo) return;
            haptic();
            onChange({ ...value, useSaju: !value.useSaju });
          }}
          aria-label="사주 결합 토글"
          style={{
            width: 44,
            height: 26,
            borderRadius: 13,
            border: 'none',
            background: value.useSaju && hasSajuInfo ? 'var(--gold-500)' : 'rgba(0,0,0,0.15)',
            position: 'relative',
            cursor: hasSajuInfo ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
            opacity: hasSajuInfo ? 1 : 0.5,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: value.useSaju && hasSajuInfo ? 21 : 3,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          />
        </button>
      </div>

      {/* CTA */}
      <div className="app-footer-cta">
        <button className="btn-secondary" onClick={() => { haptic(); onBack(); }}>
          홈으로
        </button>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!isValid}
          style={{ opacity: isValid ? 1 : 0.5 }}
        >
          꿈 풀이 시작하기 ✨
        </button>
      </div>
    </div>
  );
}
