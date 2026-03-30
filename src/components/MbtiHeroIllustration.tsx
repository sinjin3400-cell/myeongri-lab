import { useId } from 'react';

/** MBTI 선택 화면 — 별자리 뇌 일러스트 */
export function MbtiHeroIllustration() {
  const id = useId().replace(/:/g, '');
  const bg = `mbtiBg-${id}`;
  const orb = `mbtiOrb-${id}`;

  return (
    <svg
      viewBox="0 0 300 180"
      width="100%"
      height="auto"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={bg} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a2744" />
          <stop offset="100%" stopColor="#2d446c" />
        </linearGradient>
        <radialGradient id={orb} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#c9a962" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="300" height="180" rx="20" fill={`url(#${bg})`} />

      {/* 중앙 글로우 */}
      <circle cx="150" cy="85" r="60" fill={`url(#${orb})`} />

      {/* 뇌 심볼 — 두 반구 */}
      <ellipse cx="150" cy="85" rx="40" ry="36" fill="none" stroke="#c9a962" strokeWidth="1.5" opacity="0.5" />
      <path d="M150 55v60" stroke="#c9a962" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />

      {/* 왼쪽 반구 — 감성 */}
      <circle cx="132" cy="78" r="4" fill="#e8d5a3" opacity="0.8" />
      <circle cx="125" cy="95" r="3" fill="#c9a962" opacity="0.6" />
      <path d="M125 95 L132 78 L140 90" fill="none" stroke="#c9a962" strokeWidth="0.8" opacity="0.4" />

      {/* 오른쪽 반구 — 분석 */}
      <circle cx="168" cy="78" r="4" fill="#fff" opacity="0.8" />
      <circle cx="175" cy="95" r="3" fill="#e8d5a3" opacity="0.6" />
      <path d="M175 95 L168 78 L160 90" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.3" />

      {/* 연결선 */}
      <path d="M132 78 Q150 68 168 78" fill="none" stroke="#c9a962" strokeWidth="0.8" opacity="0.35" />

      {/* 궤도 위 점들 — MBTI 4문자 대표 */}
      {[
        [90, 50, 'E'],
        [210, 50, 'I'],
        [90, 130, 'S'],
        [210, 130, 'N'],
      ].map(([x, y, label], i) => (
        <g key={i}>
          <circle
            cx={x as number}
            cy={y as number}
            r="14"
            fill="rgba(201, 169, 98, 0.15)"
            stroke="#c9a962"
            strokeWidth="1"
            opacity="0.7"
          />
          <text
            x={x as number}
            y={(y as number) + 5}
            textAnchor="middle"
            fill="#c9a962"
            fontSize="11"
            fontWeight="700"
            fontFamily="'Pretendard Variable', sans-serif"
          >
            {label as string}
          </text>
        </g>
      ))}

      {/* 별들 */}
      {[
        [40, 30],
        [260, 25],
        [30, 150],
        [270, 140],
        [150, 20],
        [50, 90],
        [250, 90],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={1.2 + (i % 3) * 0.5}
          fill={i % 2 === 0 ? '#c9a962' : '#fff'}
          opacity={0.6 + (i % 3) * 0.15}
          style={{
            animation: `app-twinkle ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </svg>
  );
}
