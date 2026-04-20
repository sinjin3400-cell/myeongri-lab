import { haptic } from '../utils/haptic';

type Props = {
  onClick: () => void;
};

export function NavBackButton({ onClick }: Props) {
  return (
    <button
      onClick={() => { haptic(); onClick(); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 12,
        background: 'rgba(26, 39, 68, 0.06)',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        marginRight: 10,
        flexShrink: 0,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M15 6l-6 6 6 6" stroke="var(--navy-600)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
