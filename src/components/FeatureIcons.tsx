type IconProps = {
  size?: number;
  className?: string;
  color?: string;
};

export function FortuneIcon({ size = 48, className, color }: IconProps) {
  const main = color || 'rgba(255,255,255,0.85)';
  const accent = color ? 'var(--gold-500)' : 'rgba(201,169,98,0.7)';
  const stroke = color || 'rgba(255,255,255,0.3)';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="22" stroke={stroke} strokeWidth="1.5" opacity={0.3} />
      <path d="M24 2a22 22 0 0 1 0 44 11 11 0 0 1 0-22 11 11 0 0 0 0-22z" fill={main} />
      <path d="M24 46a22 22 0 0 1 0-44 11 11 0 0 0 0 22 11 11 0 0 1 0 22z" fill={accent} />
      <circle cx="24" cy="13" r="3" fill={accent} />
      <circle cx="24" cy="35" r="3" fill={main} />
      <g stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity={0.5}>
        <line x1="24" y1="0" x2="24" y2="3" />
        <line x1="24" y1="45" x2="24" y2="48" />
        <line x1="0" y1="24" x2="3" y2="24" />
        <line x1="45" y1="24" x2="48" y2="24" />
      </g>
    </svg>
  );
}

export function DreamIcon({ size = 48, className, color }: IconProps) {
  const main = color || 'rgba(255,255,255,0.85)';
  const star = color ? 'var(--gold-500)' : 'rgba(251,191,36,0.9)';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <ellipse cx="20" cy="36" rx="14" ry="7" fill={color ? `${color}15` : 'rgba(255,255,255,0.12)'} />
      <ellipse cx="28" cy="34" rx="10" ry="6" fill={color ? `${color}10` : 'rgba(255,255,255,0.08)'} />
      <path d="M30 6a16 16 0 1 0 0 30 13 13 0 0 1 0-30z" fill={main} />
      <path d="M38 10l1.2 2.4 2.8.4-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 2.8-.4z" fill={star} />
      <path d="M40 22l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill={star} opacity={0.6} />
      <path d="M34 4l.5 1 1.1.2-.8.7.2 1.1-1-.5-1 .5.2-1.1-.8-.7 1.1-.2z" fill={star} opacity={0.5} />
    </svg>
  );
}

export function ZodiacIcon({ size = 48, className, color }: IconProps) {
  const accent = color || 'rgba(251,191,36,0.9)';
  const dotColor = color ? `${color}80` : 'rgba(255,255,255,0.5)';
  const lineColor = color || 'rgba(255,255,255,0.8)';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="21" stroke={accent} strokeWidth="1.5" strokeDasharray="4 3" opacity={0.4} />
      <circle cx="24" cy="24" r="14" stroke={accent} strokeWidth="1" opacity={0.25} />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const cx = 24 + 21 * Math.cos(angle);
        const cy = 24 + 21 * Math.sin(angle);
        return (
          <circle key={i} cx={cx} cy={cy} r={i === 0 ? 2.5 : 1.5} fill={i === 0 ? accent : dotColor} />
        );
      })}
      <path d="M20 16c2-3 8-3 8 1s-6 4-6 8 6 4 8 1" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="28" cy="16.5" r="2" fill={accent} />
    </svg>
  );
}

export function CompatibilityIcon({ size = 48, className, color }: IconProps) {
  const main = color || 'rgba(255,255,255,0.8)';
  const rose = color ? 'var(--rose-500)' : 'rgba(253,164,175,0.7)';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M24 42L6 24c-4-4-4-11 1-14s10-1 13 3l4 5" fill={main} />
      <path d="M24 42l18-18c4-4 4-11-1-14s-10-1-13 3l-4 5" fill={rose} />
      <line x1="24" y1="18" x2="24" y2="42" stroke={color ? `${color}30` : 'rgba(255,255,255,0.2)'} strokeWidth="0.8" />
      <circle cx="17" cy="22" r="2.5" fill={rose} />
      <circle cx="31" cy="22" r="2.5" fill={main} />
    </svg>
  );
}
