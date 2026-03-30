import { useId } from 'react';

/** 별·달·밤하늘 히어로 (크림·소프트 네이비) */
export function HeroIllustration() {
  const id = useId().replace(/:/g, '');
  const sky = `heroSky-${id}`;
  const moon = `heroMoon-${id}`;
  const glow = `heroGlow-${id}`;

  return (
    <svg
      viewBox="0 0 320 200"
      width="100%"
      height="auto"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={sky} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fdf8f3" />
          <stop offset="45%" stopColor="#e8ecf7" />
          <stop offset="100%" stopColor="#d4dce8" />
        </linearGradient>
        <linearGradient id={moon} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff9f0" />
          <stop offset="100%" stopColor="#ffe4c4" />
        </linearGradient>
        <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="320" height="200" rx="24" fill={`url(#${sky})`} />
      <path
        d="M52 118 L88 96 L124 108 L158 82 L198 94 L238 72"
        fill="none"
        stroke="#9aa8c2"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="3 5"
        opacity="0.85"
      />
      <path
        d="M88 96 L96 58 L132 48"
        fill="none"
        stroke="#b8c4d9"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
      {[
        [52, 118, 2.2],
        [88, 96, 2.8],
        [124, 108, 2],
        [158, 82, 3],
        [198, 94, 2.4],
        [238, 72, 2.6],
        [96, 58, 2],
        [132, 48, 2.5],
        [268, 44, 1.8],
        [246, 130, 2],
        [72, 52, 1.6],
        [210, 148, 2.2],
      ].map(([cx, cy, r], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill={i % 3 === 0 ? '#fff' : '#e8eef8'}
          opacity={0.95}
        />
      ))}
      <g filter={`url(#${glow})`} transform="translate(200, 36)">
        <circle cx="0" cy="0" r="36" fill={`url(#${moon})`} opacity="0.95" />
        <circle cx="14" cy="-6" r="30" fill={`url(#${sky})`} opacity="1" />
      </g>
      <path
        d="M40 64l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"
        fill="#c9d6ea"
        opacity="0.9"
      />
      <path
        d="M278 160l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"
        fill="#b8c8e0"
        opacity="0.85"
      />
    </svg>
  );
}
