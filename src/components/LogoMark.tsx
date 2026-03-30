/**
 * 명리연구소 — 원형 나침반 + 음양 심볼 로고
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="50" cy="50" r="46" stroke="var(--navy-700)" strokeWidth="3.5" />
      <circle cx="50" cy="50" r="40" stroke="var(--gold-500)" strokeWidth="1.5" opacity="0.88" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="50"
          y1="6"
          x2="50"
          y2="13"
          stroke="var(--gold-500)"
          strokeWidth="2.2"
          strokeLinecap="round"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      <polygon points="50,4 53.5,11.5 46.5,11.5" fill="var(--gold-500)" />
      <g transform="translate(50 50)">
        <path
          fill="var(--navy-700)"
          d="M0 -15 A15 15 0 1 1 0 15 A7.5 7.5 0 1 0 0 0 A7.5 7.5 0 1 1 0 -15Z"
        />
        <path
          fill="var(--gold-500)"
          d="M0 15 A15 15 0 1 1 0 -15 A7.5 7.5 0 1 0 0 0 A7.5 7.5 0 1 1 0 15Z"
        />
        <circle cx="0" cy="-7.5" r="3.2" fill="var(--gold-500)" />
        <circle cx="0" cy="7.5" r="3.2" fill="var(--navy-700)" />
      </g>
    </svg>
  );
}
