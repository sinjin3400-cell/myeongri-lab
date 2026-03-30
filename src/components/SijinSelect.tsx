import { useEffect, useState } from 'react';
import { SIJIN_OPTIONS, type SijinId } from '../sijin';
import type { UserInfo } from '../types';

type Props = {
  value: UserInfo;
  displayLine: string;
  onSelectSijin: (id: SijinId) => void;
  onSelectUnknown: () => void;
};

export function SijinSelect({
  value,
  displayLine,
  onSelectSijin,
  onSelectUnknown,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="toss-like-input"
        style={{
          textAlign: 'left',
          cursor: 'pointer',
          color: displayLine ? 'var(--navy-700)' : 'var(--navy-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={() => setOpen(!open)}
      >
        <span>{displayLine || '시간대를 선택해주세요'}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.25s',
            flexShrink: 0,
          }}
        >
          <path d="M4 6l4 4 4-4" stroke="var(--navy-300)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(13, 21, 32, 0.42)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="태어난 시간 선택"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              height: '60dvh',
              minHeight: 360,
              maxHeight: '60dvh',
              background: '#fff',
              borderRadius: 22,
              boxShadow: '0 -8px 28px rgba(26, 39, 68, 0.16)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'app-slide-up 0.22s ease',
            }}
          >
            <div style={{ padding: '10px 16px 6px', borderBottom: '1px solid rgba(26, 39, 68, 0.06)' }}>
              <div
                style={{
                  width: 38,
                  height: 4,
                  borderRadius: 999,
                  background: 'rgba(26, 39, 68, 0.18)',
                  margin: '0 auto 10px',
                }}
              />
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--navy-700)' }}>태어난 시간 선택</p>
            </div>

            <div
              className="hide-scrollbar"
              style={{
                flex: 1,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                padding: '8px 10px calc(env(safe-area-inset-bottom, 0px) + 12px)',
              }}
            >
              {SIJIN_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '13px 14px',
                    border: 'none',
                    background: value.birthSijin === s.id ? 'var(--gold-50)' : 'transparent',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 15,
                    fontWeight: value.birthSijin === s.id ? 600 : 400,
                    color: value.birthSijin === s.id ? 'var(--navy-700)' : 'var(--navy-500)',
                    transition: 'all 0.15s',
                    gap: 10,
                  }}
                  onClick={() => {
                    onSelectSijin(s.id);
                    setOpen(false);
                  }}
                >
                  <span style={{ fontSize: 17, opacity: 0.7 }}>{s.hanja}</span>
                  <span>{s.label}</span>
                  <span style={{ color: 'var(--navy-200)', fontSize: 13, marginLeft: 'auto' }}>{s.range}</span>
                </button>
              ))}
              <div style={{ borderTop: '1px solid rgba(26, 39, 68, 0.06)', margin: '6px 4px' }} />
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '13px 14px',
                  border: 'none',
                  background: value.birthTimeUnknown ? 'var(--gold-50)' : 'transparent',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 15,
                  fontWeight: value.birthTimeUnknown ? 600 : 400,
                  color: value.birthTimeUnknown ? 'var(--navy-700)' : 'var(--navy-400)',
                  transition: 'all 0.15s',
                }}
                onClick={() => {
                  onSelectUnknown();
                  setOpen(false);
                }}
              >
                🤔 모르겠어요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
