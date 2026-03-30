/** 원형 점수 게이지 */
export function ScoreRing({
  score,
  size = 100,
}: {
  score: number;
  size?: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#c9a962';
    if (s >= 60) return '#3d5a8a';
    return '#8aa4cc';
  };

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* 트랙 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(26, 39, 68, 0.06)"
          strokeWidth={strokeWidth}
        />
        {/* 게이지 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      <div className="score-text">
        <span
          style={{
            fontSize: size * 0.28,
            fontWeight: 800,
            color: getColor(score),
            letterSpacing: '-0.03em',
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: size * 0.12,
            fontWeight: 600,
            color: '#8aa4cc',
            marginTop: -2,
          }}
        >
          점
        </span>
      </div>
    </div>
  );
}
