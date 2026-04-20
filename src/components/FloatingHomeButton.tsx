import { haptic } from '../utils/haptic';

type Props = {
  onClick: () => void;
};

export function FloatingHomeButton({ onClick }: Props) {
  return (
    <button
      onClick={() => { haptic(); onClick(); }}
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 20px',
        borderRadius: 100,
        border: '1px solid rgba(26, 39, 68, 0.1)',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(26, 39, 68, 0.1)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--navy-500)',
        zIndex: 100,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z" stroke="var(--navy-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V14h6v7" stroke="var(--navy-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      홈으로
    </button>
  );
}
