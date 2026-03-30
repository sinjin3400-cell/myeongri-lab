import { useId } from 'react';

/** 별·달·구름 부드러운 애니메이션 */
export function LoadingNightAnimation() {
  const id = useId().replace(/:/g, '');
  const sky = `loadSky-${id}`;
  const moon = `loadMoon-${id}`;

  return (
    <div
      style={{
        width: 'min(260px, 80vw)',
        position: 'relative',
      }}
    >
      <svg
        viewBox="0 0 240 200"
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={sky} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5f0eb" />
            <stop offset="100%" stopColor="#dce4f2" />
          </linearGradient>
          <linearGradient id={moon} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff8ee" />
            <stop offset="100%" stopColor="#f0d4a8" />
          </linearGradient>
        </defs>
        <rect width="240" height="200" rx="28" fill={`url(#${sky})`} />
        {/* 구름 */}
        <g
          style={{
            animation: 'app-float 3.2s ease-in-out infinite',
          }}
        >
          <ellipse cx="72" cy="148" rx="38" ry="16" fill="#fff" opacity="0.92" />
          <ellipse cx="100" cy="142" rx="28" ry="14" fill="#fff" opacity="0.88" />
          <ellipse cx="168" cy="152" rx="44" ry="18" fill="#fff" opacity="0.9" />
        </g>
        {/* 달 */}
        <g
          style={{
            animation: 'app-float 2.6s ease-in-out infinite',
            animationDelay: '-0.5s',
          }}
          transform="translate(158, 36)"
        >
          <circle cx="0" cy="0" r="28" fill={`url(#${moon})`} opacity="0.95" />
          <circle cx="12" cy="-4" r="22" fill={`url(#${sky})`} />
        </g>
        {/* 별들 */}
        {[
          [40, 52, 2.5],
          [68, 38, 2],
          [120, 28, 2.8],
          [200, 48, 2],
          [52, 88, 1.8],
          [190, 92, 2.2],
        ].map(([cx, cy, r], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={i % 2 === 0 ? '#c9a962' : '#fff'}
            style={{
              animation: `app-twinkle ${2 + (i % 3) * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 120 100"
            to="360 120 100"
            dur="14s"
            repeatCount="indefinite"
          />
          <circle
            cx="120"
            cy="100"
            r="32"
            fill="none"
            stroke="rgba(201, 169, 98, 0.35)"
            strokeWidth="2"
            strokeDasharray="6 10"
          />
        </g>
      </svg>
    </div>
  );
}
