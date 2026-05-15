import { haptic } from '../utils/haptic';

type Props = {
  onUse: () => void;
  label?: string;
};

export function SavedDataButton({ onUse, label = '저장된 정보 사용' }: Props) {
  return (
    <button
      type="button"
      onClick={() => { haptic(); onUse(); }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 999,
        background: 'rgba(212, 175, 55, 0.10)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--gold-600)',
        cursor: 'pointer',
        transition: 'background 0.15s',
        alignSelf: 'flex-start',
      }}
      onMouseDown={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.18)'; }}
      onMouseUp={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.10)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.10)'; }}
    >
      <span style={{ fontSize: 14 }}>📥</span>
      {label}
    </button>
  );
}
