export function SemiCircleGauge({ score, size = 240, label = '종합 운세' }: { score: number; size?: number; label?: string }) {
  const scale = size / 240;
  const w = size;
  const h = Math.round(130 * scale);
  const cx = w / 2;
  const cy = Math.round(120 * scale);
  const r = Math.round(112 * scale);
  const strokeW = Math.round(16 * scale);

  const arcD = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  const circ = Math.PI * r;
  const dashOffset = circ - (score / 100) * circ;

  const ticks = [0, 25, 50, 75, 100];
  const tickLines = ticks.map((t) => {
    const angle = Math.PI * (1 - t / 100);
    const inR = r - Math.round(6 * scale);
    const outR = r + Math.round(10 * scale);
    const ix = cx + inR * Math.cos(angle);
    const iy = cy - inR * Math.sin(angle);
    const ox = cx + outR * Math.cos(angle);
    const oy = cy - outR * Math.sin(angle);
    return { t, ix, iy, ox, oy };
  });

  const gradId = `gaugeGrad-${size}`;
  const fontSize = Math.round(42 * scale);
  const unitSize = Math.round(18 * scale);
  const labelSize = Math.round(11 * scale);
  const topOffset = Math.round(28 * scale);

  return (
    <div style={{ position: 'relative', width: w, height: h, margin: '0 auto' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#b88a35" />
            <stop offset="50%" stopColor="#d4a84b" />
            <stop offset="100%" stopColor="#e0be70" />
          </linearGradient>
        </defs>

        <path d={arcD} fill="none" stroke="#eef1f7" strokeWidth={strokeW} strokeLinecap="round" />
        <path d={arcD} fill="none" stroke={`url(#${gradId})`} strokeWidth={strokeW} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />

        {tickLines.map(({ t, ix, iy, ox, oy }) => (
          <line key={t} x1={ix} y1={iy} x2={ox} y2={oy} stroke="#c2cad8" strokeWidth={1} />
        ))}
      </svg>

      <div style={{
        position: 'absolute', left: '50%', top: topOffset,
        transform: 'translateX(-50%)', textAlign: 'center',
      }}>
        <div style={{ fontSize: labelSize, fontWeight: 600, color: 'rgb(151,162,184)', letterSpacing: '0.08em' }}>{label}</div>
        <div style={{ fontSize, fontWeight: 800, color: 'var(--navy-700)', fontFeatureSettings: '"tnum"', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
          {score}<span style={{ fontSize: unitSize, fontWeight: 700, color: 'rgb(151,162,184)' }}>점</span>
        </div>
      </div>
    </div>
  );
}
