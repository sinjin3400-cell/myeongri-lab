import { useEffect, useState } from 'react';
import { haptic } from '../utils/haptic';
import type { SharedProfile } from '../utils/userProfile';

type Props = {
  open: boolean;
  profile: SharedProfile | null;
  onAccept: () => void;
  onDecline: () => void;
};

const CALENDAR_LABEL: Record<string, string> = {
  solar: '양력',
  lunar: '음력',
  lunar_leap: '음력 윤달',
};

const GENDER_LABEL: Record<string, string> = {
  male: '남성',
  female: '여성',
  other: '기타',
};

export function AutofillSheet({ open, profile, onAccept, onDecline }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open || !profile) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, [open, profile]);

  if (!open || !profile || !visible) return null;

  const calLabel = profile.calendarType ? CALENDAR_LABEL[profile.calendarType] : '';
  const genderLabel = profile.gender ? GENDER_LABEL[profile.gender] : '';
  const birthDisplay = profile.birthYear ? `${profile.birthYear}년생` : '';
  const detailParts = [birthDisplay, calLabel, genderLabel].filter(Boolean);

  return (
    <>
      <div
        onClick={onDecline}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(13,21,32,0.45)',
          zIndex: 200,
          animation: 'sheet-dim-in 0.25s ease',
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed', left: 12, right: 12,
          top: 'calc(12px + env(safe-area-inset-top, 0px))',
          zIndex: 201,
          background: '#fff',
          borderRadius: 20,
          padding: '20px 22px 18px',
          boxShadow: '0 16px 40px rgba(13, 21, 32, 0.18), 0 4px 12px rgba(13, 21, 32, 0.08)',
          maxWidth: 460, margin: '0 auto',
          animation: 'sheet-slide-down 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 16 }}>👋</span>
          <p style={{
            margin: 0, fontSize: 13, fontWeight: 700,
            color: 'var(--gold-600)', letterSpacing: '0.02em',
          }}>
            이전 정보가 있어요
          </p>
        </div>
        <h3 style={{
          margin: '0 0 4px', fontSize: 17, fontWeight: 800,
          color: 'var(--navy-700)', letterSpacing: '-0.02em', lineHeight: 1.4,
        }}>
          {profile.name}님 정보로 시작할까요?
        </h3>
        {detailParts.length > 0 && (
          <p style={{
            margin: '0 0 16px', fontSize: 13, fontWeight: 500,
            color: 'var(--navy-400)', lineHeight: 1.55,
          }}>
            {detailParts.join(' · ')}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => { haptic(); onDecline(); }}
            style={{
              flex: 1, padding: '13px 14px',
              borderRadius: 12,
              background: '#fff',
              border: '1.5px solid rgba(26,39,68,0.10)',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
              color: 'var(--navy-500)', cursor: 'pointer',
            }}
          >
            다시 입력
          </button>
          <button
            type="button"
            onClick={() => { haptic(); onAccept(); }}
            style={{
              flex: 1.4, padding: '13px 14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1a2744 0%, #2a3a5c 100%)',
              border: 'none',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
              color: '#fff', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(26,39,68,0.20)',
            }}
          >
            그대로 시작
          </button>
        </div>
      </div>
    </>
  );
}
