import { LogoMark } from './LogoMark';

type Props = {
  title: string;
  subtitle?: string;
  emoji?: string;
  centered?: boolean;
};

/**
 * 통일된 페이지 헤더 — 명리연구소 프리미엄 톤
 * 좌측 로고 + 우측 타이틀/서브타이틀 + 골드 디바이더
 */
export function PageHeader({ title, subtitle, emoji, centered = false }: Props) {
  if (centered) {
    return (
      <header
        className="animate-fade-in"
        style={{ textAlign: 'center', marginBottom: 24 }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <LogoMark size={36} />
          {emoji && <span style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</span>}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            color: 'var(--navy-700)',
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--gold-600)',
              letterSpacing: '0.02em',
            }}
          >
            {subtitle}
          </p>
        )}
        <div
          style={{
            margin: '14px auto 0',
            width: 56,
            height: 2,
            borderRadius: 999,
            background: 'linear-gradient(90deg, transparent 0%, var(--gold-500) 50%, transparent 100%)',
          }}
        />
      </header>
    );
  }

  return (
    <header
      className="animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 22,
        paddingBottom: 16,
        borderBottom: '1px solid rgba(201, 169, 98, 0.18)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'linear-gradient(135deg, var(--gold-50) 0%, #fff 100%)',
          border: '1px solid rgba(201, 169, 98, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(201, 169, 98, 0.12)',
          flexShrink: 0,
        }}
      >
        <LogoMark size={32} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--navy-700)',
            letterSpacing: '-0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {emoji && <span style={{ fontSize: 22 }}>{emoji}</span>}
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--gold-600)',
              letterSpacing: '0.02em',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
