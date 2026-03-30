import { useEffect, useRef, useState } from 'react';
import { TextField } from '@toss/tds-mobile';
import type { UserInfo } from '../types';
import { SIJIN_OPTIONS, type SijinId } from '../sijin';

const ROW_MIN_HEIGHT = 48;
const VISIBLE_ROWS = 4.5;
const LIST_MAX_HEIGHT = Math.round(ROW_MIN_HEIGHT * VISIBLE_ROWS);

const PANEL_SHADOW =
  '0 4px 24px rgba(0, 23, 51, 0.1), 0 0 1px rgba(0, 27, 55, 0.08)';

function SelectChevron({ open }: { open: boolean }) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        color: '#8b95a1',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

type Props = {
  value: UserInfo;
  onSelectSijin: (id: SijinId) => void;
  onSelectUnknown: () => void;
  displayLine: string;
};

export function SijinSelect({
  value,
  onSelectSijin,
  onSelectUnknown,
  displayLine,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const isSelectedSijin = (id: SijinId) =>
    !value.birthTimeUnknown && value.birthSijin === id;
  const isUnknownSelected = value.birthTimeUnknown;

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%' }}>
      <TextField.Button
        type="button"
        variant="box"
        placeholder="시간대를 골라주세요 (몰라도 괜찮아요)"
        value={displayLine || undefined}
        right={<SelectChevron open={open} />}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      />
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            marginTop: 6,
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid rgba(0, 27, 55, 0.08)',
            boxShadow: PANEL_SHADOW,
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f2f4f6',
              fontSize: 15,
              fontWeight: 700,
              color: '#191f28',
              letterSpacing: '-0.02em',
            }}
          >
            태어난 시간대를 골라주세요
          </div>
          <div
            style={{
              maxHeight: LIST_MAX_HEIGHT,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {SIJIN_OPTIONS.map((s) => {
              const selected = isSelectedSijin(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onSelectSijin(s.id);
                    setOpen(false);
                  }}
                  style={{
                    width: '100%',
                    minHeight: ROW_MIN_HEIGHT,
                    textAlign: 'left',
                    padding: '12px 16px',
                    border: 'none',
                    borderBottom: '1px solid #f2f4f6',
                    background: selected ? 'rgba(49, 130, 246, 0.12)' : '#ffffff',
                    color: selected ? '#1b64da' : '#191f28',
                    fontSize: 16,
                    fontWeight: selected ? 600 : 400,
                    fontFamily: 'inherit',
                    lineHeight: 1.45,
                    cursor: 'pointer',
                  }}
                >
                  {`${s.label}(${s.hanja}) ${s.range}`}
                </button>
              );
            })}
            <button
              type="button"
              role="option"
              aria-selected={isUnknownSelected}
              onClick={() => {
                onSelectUnknown();
                setOpen(false);
              }}
              style={{
                width: '100%',
                minHeight: ROW_MIN_HEIGHT,
                textAlign: 'left',
                padding: '12px 16px',
                border: 'none',
                background: isUnknownSelected
                  ? 'rgba(49, 130, 246, 0.12)'
                  : '#ffffff',
                color: isUnknownSelected ? '#1b64da' : '#333d4b',
                fontSize: 16,
                fontWeight: isUnknownSelected ? 600 : 400,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              모르겠어요
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
