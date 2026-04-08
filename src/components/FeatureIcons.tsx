/** 홈화면 기능 카드용 SVG 아이콘 */

type IconProps = {
  size?: number;
  className?: string;
};

/** 사주풀이 — 태극+팔괘 모티브 */
export function FortuneIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 외곽 원 */}
      <circle cx="24" cy="24" r="22" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      {/* 태극 */}
      <path
        d="M24 2a22 22 0 0 1 0 44 11 11 0 0 1 0-22 11 11 0 0 0 0-22z"
        fill="rgba(255,255,255,0.85)"
      />
      <path
        d="M24 46a22 22 0 0 1 0-44 11 11 0 0 0 0 22 11 11 0 0 1 0 22z"
        fill="rgba(201,169,98,0.7)"
      />
      {/* 태극 눈 */}
      <circle cx="24" cy="13" r="3" fill="rgba(201,169,98,0.8)" />
      <circle cx="24" cy="35" r="3" fill="rgba(255,255,255,0.9)" />
      {/* 팔괘 장식 — 상하좌우 바 */}
      <g stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
        <line x1="24" y1="0" x2="24" y2="3" />
        <line x1="24" y1="45" x2="24" y2="48" />
        <line x1="0" y1="24" x2="3" y2="24" />
        <line x1="45" y1="24" x2="48" y2="24" />
      </g>
    </svg>
  );
}

/** 꿈해몽 — 달+별+구름 */
export function DreamIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 구름 */}
      <ellipse cx="20" cy="36" rx="14" ry="7" fill="rgba(255,255,255,0.12)" />
      <ellipse cx="28" cy="34" rx="10" ry="6" fill="rgba(255,255,255,0.08)" />
      {/* 초승달 */}
      <path
        d="M30 6a16 16 0 1 0 0 30 13 13 0 0 1 0-30z"
        fill="rgba(255,255,255,0.85)"
      />
      {/* 별 — 큰 별 */}
      <path
        d="M38 10l1.2 2.4 2.8.4-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 2.8-.4z"
        fill="rgba(251,191,36,0.9)"
      />
      {/* 별 — 작은 별 */}
      <path
        d="M40 22l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z"
        fill="rgba(251,191,36,0.6)"
      />
      <path
        d="M34 4l.5 1 1.1.2-.8.7.2 1.1-1-.5-1 .5.2-1.1-.8-.7 1.1-.2z"
        fill="rgba(251,191,36,0.5)"
      />
      {/* 반짝임 */}
      <circle cx="42" cy="16" r="0.8" fill="rgba(255,255,255,0.6)" />
      <circle cx="36" cy="28" r="0.6" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

/** 띠별운세 — 12지신 원형 + 용 실루엣 */
export function ZodiacIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 외곽 원 */}
      <circle cx="24" cy="24" r="21" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* 내부 원 */}
      <circle cx="24" cy="24" r="14" stroke="rgba(251,191,36,0.25)" strokeWidth="1" />
      {/* 12개 점 (12지신 자리) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const cx = 24 + 21 * Math.cos(angle);
        const cy = 24 + 21 * Math.sin(angle);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={i === 0 ? 2.5 : 1.5}
            fill={i === 0 ? 'rgba(251,191,36,0.9)' : 'rgba(255,255,255,0.5)'}
          />
        );
      })}
      {/* 중앙 용 심볼 (간결한 S 곡선) */}
      <path
        d="M20 16c2-3 8-3 8 1s-6 4-6 8 6 4 8 1"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* 용 머리 장식 */}
      <circle cx="28" cy="16.5" r="2" fill="rgba(251,191,36,0.8)" />
      <circle cx="20" cy="26" r="1" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

/** 궁합보기 — 음양 하트 */
export function CompatibilityIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 하트 왼쪽 (음) */}
      <path
        d="M24 42L6 24c-4-4-4-11 1-14s10-1 13 3l4 5"
        fill="rgba(255,255,255,0.8)"
        stroke="none"
      />
      {/* 하트 오른쪽 (양) */}
      <path
        d="M24 42l18-18c4-4 4-11-1-14s-10-1-13 3l-4 5"
        fill="rgba(253,164,175,0.7)"
        stroke="none"
      />
      {/* 중앙 구분선 */}
      <line
        x1="24" y1="18" x2="24" y2="42"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.8"
      />
      {/* 음양 점 */}
      <circle cx="17" cy="22" r="2.5" fill="rgba(253,164,175,0.8)" />
      <circle cx="31" cy="22" r="2.5" fill="rgba(255,255,255,0.9)" />
      {/* 반짝임 */}
      <g fill="rgba(255,255,255,0.5)">
        <circle cx="12" cy="14" r="1" />
        <circle cx="36" cy="14" r="1" />
        <circle cx="24" cy="8" r="0.8" />
      </g>
    </svg>
  );
}
