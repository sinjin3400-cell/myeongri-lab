type Props = {
  variant?: 'dark' | 'light';
};

export function AdBadge({ variant = 'dark' }: Props) {
  const isDark = variant === 'dark';
  return (
    <span
      aria-label="광고"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        borderRadius: 5,
        background: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(26,39,68,0.08)',
        color: isDark ? '#fff' : 'var(--navy-500)',
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.06em',
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path d="M2 1l7 4-7 4V1z" fill="currentColor" />
      </svg>
      광고
    </span>
  );
}
