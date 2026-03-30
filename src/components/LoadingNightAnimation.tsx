import { useId } from 'react';

/** 로딩 — 신비로운 별·달·궤도 애니메이션 */
export function LoadingNightAnimation() {
  const id = useId().replace(/:/g, '');
  const sky = `loadSky-${id}`;
  const moon = `loadMoon-${id}`;
  const glow = `loadGlow-${id}`;

  return (
    <div style={{ width: 'min(260px, 80vw)', position: 'relative' }}>
      <svg
        viewBox="0 0 240 240"
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={sky} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#131e30" />
            <stop offset="100%" stopColor="#1a2744" />
          </linearGradient>
          <linearGradient id={moon} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff9f0" />
            <stop offset="100%" stopColor="#f0d4a8" />
          </linearGradient>
          <radialGradient id={glow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c9a962" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 배경 */}
        <rect width="240" height="240" rx="120" fill={`url(#${sky})`} />

        {/* 중앙 글로우 */}
        <circle cx="120" cy="120" r="80" fill={`url(#${glow})`} />

        {/* 궤도 원 3개 */}
        {[50, 70, 90].map((r, i) => (
          <circle
            key={i}
            cx="120"
            cy="120"
            r={r}
            fill="none"
            stroke="rgba(201, 169, 98, 0.12)"
            strokeWidth="1"
            strokeDasharray={`${3 + i} ${6 + i * 2}`}
            style={{
              animation: `app-spin-slow ${18 + i * 6}s linear infinite`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            }}
          />
        ))}

        {/* 궤도 위 움직이는 점들 */}
        {[
          { r: 50, dur: 6, color: '#c9a962', size: 4 },
          { r: 70, dur: 8, color: '#fff', size: 3 },
          { r: 90, dur: 10, color: '#e8d5a3', size: 3.5 },
        ].map(({ r, dur, color, size }, i) => (
          <circle
            key={i}
            cx="120"
            cy={120 - r}
            r={size}
            fill={color}
            opacity={0.9}
            style={{
              transformOrigin: '120px 120px',
              animation: `app-spin-slow ${dur}s linear infinite`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            }}
          />
        ))}

        {/* 달 */}
        <g
          style={{
            animation: 'app-float 3s ease-in-out infinite',
          }}
        >
          <circle cx="120" cy="110" r="28" fill={`url(#${moon})`} opacity="0.95" />
          <circle cx="132" cy="104" r="22" fill={`url(#${sky})`} />
        </g>

        {/* 별들 */}
        {[
          [40, 52, 2],
          [68, 38, 1.8],
          [190, 40, 2.2],
          [200, 190, 1.6],
          [45, 180, 2],
          [175, 55, 1.5],
          [55, 130, 1.4],
          [195, 130, 1.8],
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

        {/* 팔각별 */}
        <path
          d="M120 65l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"
          fill="#c9a962"
          opacity="0.8"
          style={{ animation: 'app-twinkle 2.5s ease-in-out infinite' }}
        />
      </svg>
    </div>
  );
}
