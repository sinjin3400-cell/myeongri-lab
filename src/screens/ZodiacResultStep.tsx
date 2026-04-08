import { haptic } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { ScoreRing } from '../components/ScoreRing';
import type { ZodiacResult, AppFeature } from '../types';

type Props = {
  result: ZodiacResult;
  userName: string;
  onRestart: () => void;
  onHome: () => void;
  onSelectFeature?: (feature: AppFeature) => void;
};

const CATEGORY_META: Record<string, { icon: string; gradient: string }> = {
  overall: { icon: '🌟', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)' },
  love:    { icon: '💕', gradient: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)' },
  money:   { icon: '💰', gradient: 'linear-gradient(135deg, #854d0e 0%, #ca8a04 100%)' },
  health:  { icon: '💪', gradient: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)' },
  work:    { icon: '💼', gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' },
};

export function ZodiacResultStep({ result, userName, onRestart, onHome, onSelectFeature }: Props) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  const meta = CATEGORY_META[result.primaryCategory] ?? CATEGORY_META.overall;

  const recommendations: { key: AppFeature; icon: string; title: string; desc: string }[] = [
    { key: 'fortune', icon: '🔮', title: '오늘의 사주풀이', desc: '내 사주로 보는 자세한 운세' },
    { key: 'compatibility', icon: '💞', title: '궁합 보기', desc: '소중한 사람과 나의 궁합' },
    { key: 'dream', icon: '💭', title: '꿈해몽', desc: '간밤의 꿈 풀이 (준비 중)' },
  ];

  return (
    <div className="app-page" style={{ paddingBottom: 120 }}>
      {/* 헤더 */}
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--navy-300)', fontWeight: 600 }}>
          📅 {dateStr} 띠별 운세
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 36 }}>{result.emoji}</span>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--navy-700)' }}>
            {userName}님의 {result.animal}띠 운세
          </h1>
        </div>
      </header>

      {/* 점수 + 요약 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{ textAlign: 'center', padding: '24px 20px', marginBottom: 20 }}
      >
        <ScoreRing score={result.score} size={100} />
        <p style={{ margin: '12px 0 0', fontSize: 17, fontWeight: 700, color: 'var(--navy-700)', lineHeight: 1.5 }}>
          {result.summaryLine}
        </p>
      </div>

      {/* 단일 핵심 운세 카드 */}
      <div
        className="premium-card animate-slide-up"
        style={{ padding: '22px 22px', animationDelay: '0.1s' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: meta.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}
          >
            {meta.icon}
          </span>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--navy-700)', letterSpacing: '-0.02em' }}>
            {result.primaryTitle}
          </h2>
        </div>

        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.75, color: 'var(--navy-600)', whiteSpace: 'pre-line' }}>
          {result.primaryBody}
        </p>

        {result.primaryDetail && (
          <p style={{ margin: '14px 0 0', fontSize: 14.5, lineHeight: 1.75, color: 'var(--navy-500)', whiteSpace: 'pre-line' }}>
            {result.primaryDetail}
          </p>
        )}
      </div>

      {/* 특별 조언 */}
      {result.advice && (
        <div
          className="premium-card animate-slide-up"
          style={{
            marginTop: 14, padding: '18px 20px',
            background: 'linear-gradient(135deg, rgba(201,169,98,0.08) 0%, rgba(201,169,98,0.02) 100%)',
            animationDelay: '0.2s',
          }}
        >
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--gold-600)', letterSpacing: '0.04em' }}>
            💡 오늘의 특별 조언
          </p>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--navy-600)', whiteSpace: 'pre-line' }}>
            {result.advice}
          </p>
        </div>
      )}

      {/* 다른 기능 추천 CTA */}
      <div
        className="animate-slide-up"
        style={{ marginTop: 24, animationDelay: '0.3s' }}
      >
        <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--navy-600)', textAlign: 'center' }}>
          ✨ 명리연구소의 다른 기능도 만나보세요
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recommendations.map((rec) => (
            <button
              key={rec.key}
              type="button"
              onClick={() => {
                haptic();
                trackEvent('zodiac_cta_click', { feature: rec.key });
                if (onSelectFeature) onSelectFeature(rec.key);
                else onHome();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                background: '#fff',
                border: '1.5px solid var(--navy-100)',
                borderRadius: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ fontSize: 26 }}>{rec.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>
                  {rec.title}
                </p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--navy-400)' }}>
                  {rec.desc}
                </p>
              </div>
              <span style={{ fontSize: 16, color: 'var(--navy-300)' }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="app-footer-cta">
        <button className="btn-primary" onClick={() => { haptic(); onRestart(); }}>
          {result.emoji} 다른 띠 보기
        </button>
        <button className="btn-secondary" onClick={() => { haptic(); onHome(); }}>
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
