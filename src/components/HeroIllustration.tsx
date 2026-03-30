import { useId } from 'react';

/** 별·달·밤하늘 히어로 — Deep Navy + Gold + Cream */
export function HeroIllustration() {
  const id = useId().replace(/:/g, '');
  const sky = `heroSky-${id}`;
  const moon = `heroMoon-${id}`;
  const glow = `heroGlow-${id}`;
  const shimmer = `heroShimmer-${id}`;

  return (
    <svg
      viewBox="0 0 320 200"
      width="100%"
      height="auto"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={sky} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a2744" />
          <stop offset="40%" stopColor="#233558" />
          <stop offset="100%" stopColor="#2d446c" />
        </linearGradient>
        <linearGradient id={moon} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff9f0" />
          <stop offset="100%" stopColor="#f0d4a8" />
        </linearGradient>
        <radialGradient id={shimmer} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9a962" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
        </radialGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 배경 */}
      <rect width="320" height="200" rx="20" fill={`url(#${sky})`} />

      {/* 별 구름띠 */}
      <path
        d="M0 130 Q80 115 160 125 Q240 135 320 120 L320 200 L0 200Z"
        fill="rgba(201, 169, 98, 0.06)"
      />

      {/* 은하수 */}
      <path
        d="M52 118 L88 96 L124 108 L158 82 L198 94 L238 72"
        fill="none"
        stroke="rgba(201, 169, 98, 0.25)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="3 5"
      />

      {/* 별자리 라인 */}
      <path
        d="M88 96 L96 58 L132 48"
        fill="none"
        stroke="rgba(201, 169, 98, 0.18)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* 별들 */}
      {[
        [52, 118, 2.2, '#c9a962'],
        [88, 96, 2.8, '#fff'],
        [124, 108, 2, '#c9a962'],
        [158, 82, 3, '#fff'],
        [198, 94, 2.4, '#c9a962'],
        [238, 72, 2.6, '#fff'],
        [96, 58, 2, '#c9a962'],
        [132, 48, 2.5, '#e8d5a3'],
        [268, 44, 1.8, '#fff'],
        [246, 130, 2, '#c9a962'],
        [72, 52, 1.6, '#fff'],
        [210, 148, 2.2, '#e8d5a3'],
        [30, 82, 1.4, '#fff'],
        [180, 48, 1.8, '#c9a962'],
        [290, 90, 1.5, '#fff'],
      ].map(([cx, cy, r, fill], i) => (
        <circle
          key={i}
          cx={cx as number}
          cy={cy as number}
          r={r as number}
          fill={fill as string}
          opacity={0.9}
          style={{
            animation: `app-twinkle ${2 + (i % 4) * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}

      {/* 달 글로우 */}
      <circle cx="220" cy="56" r="50" fill={`url(#${shimmer})`} />

      {/* 달 */}
      <g filter={`url(#${glow})`} transform="translate(220, 56)">
        <circle cx="0" cy="0" r="32" fill={`url(#${moon})`} opacity="0.95" />
        <circle cx="12" cy="-5" r="26" fill={`url(#${sky})`} opacity="1" />
      </g>

      {/* 팔각별 장식 */}
      <path
        d="M40 64l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"
        fill="#c9a962"
        opacity="0.8"
        style={{ animation: 'app-twinkle 3s ease-in-out infinite' }}
      />
      <path
        d="M278 160l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"
        fill="#e8d5a3"
        opacity="0.7"
        style={{ animation: 'app-twinkle 2.5s ease-in-out infinite', animationDelay: '0.5s' }}
      />
      <path
        d="M60 155l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"
        fill="#c9a962"
        opacity="0.6"
        style={{ animation: 'app-twinkle 2.8s ease-in-out infinite', animationDelay: '1s' }}
      />

      {/* 궤도 원 */}
      <circle
        cx="220"
        cy="56"
        r="48"
        fill="none"
        stroke="rgba(201, 169, 98, 0.12)"
        strokeWidth="1"
        strokeDasharray="4 8"
        style={{ animation: 'app-spin-slow 30s linear infinite' }}
      />
    </svg>
  );
}
