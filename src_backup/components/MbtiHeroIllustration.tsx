import { useId } from 'react';

/** 뇌·심리 느낌 귀여운 일러스트 */
export function MbtiHeroIllustration() {
  const id = useId().replace(/:/g, '');
  const bg = `mbtiBg-${id}`;
  const brain = `mbtiBrain-${id}`;

  return (
    <svg
      viewBox="0 0 280 180"
      width="100%"
      height="auto"
      style={{ maxWidth: 260, display: 'block', margin: '0 auto' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={bg} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f0ff" />
          <stop offset="50%" stopColor="#fef6f0" />
          <stop offset="100%" stopColor="#e8eef8" />
        </linearGradient>
        <linearGradient id={brain} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffd6e8" />
          <stop offset="100%" stopColor="#e8b4d4" />
        </linearGradient>
      </defs>
      <rect width="280" height="180" rx="22" fill={`url(#${bg})`} />
      <ellipse
        cx="140"
        cy="96"
        rx="54"
        ry="46"
        fill={`url(#${brain})`}
        stroke="#c9a962"
        strokeWidth="1.5"
        opacity="0.96"
      />
      <path
        d="M140 62v68"
        stroke="#b888a8"
        strokeWidth="1.2"
        strokeDasharray="4 5"
        opacity="0.65"
      />
      <ellipse cx="118" cy="88" rx="5" ry="6" fill="#1a2744" />
      <ellipse cx="162" cy="88" rx="5" ry="6" fill="#1a2744" />
      <circle cx="120" cy="86" r="1.8" fill="#fff" />
      <circle cx="164" cy="86" r="1.8" fill="#fff" />
      <path
        d="M128 110q12 9 24 0"
        fill="none"
        stroke="#1a2744"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="52" cy="48" r="3" fill="#c9a962" opacity="0.9" />
      <circle cx="228" cy="56" r="2.5" fill="#7eb8ff" opacity="0.85" />
      <path
        d="M220 124l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"
        fill="#c9a962"
        opacity="0.75"
      />
    </svg>
  );
}
