import { useEffect, useRef } from 'react';
import { haptic } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { ScoreRing } from '../components/ScoreRing';
import { useTossBanner, AD_IDS } from '../hooks/useAds';
import type { ZodiacResult, AppFeature } from '../types';

type Props = {
  result: ZodiacResult;
  userName: string;
  onRestart: () => void;
  onHome: () => void;
  onSelectFeature?: (feature: AppFeature) => void;
};

function elementLabel(el: string): string {
  const map: Record<string, string> = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' };
  return map[el] ?? el;
}

const CATEGORY_META: Record<string, { icon: string; gradient: string }> = {
  overall: { icon: '🌟', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)' },
  love:    { icon: '💕', gradient: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)' },
  money:   { icon: '💰', gradient: 'linear-gradient(135deg, #854d0e 0%, #ca8a04 100%)' },
  health:  { icon: '💪', gradient: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)' },
  work:    { icon: '💼', gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' },
};

export function ZodiacResultStep({ result, userName, onRestart, onHome, onSelectFeature }: Props) {
  // 하단 배너 광고
  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const bannerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!bannerReady || !bannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bannerRef.current, {
      theme: 'light', tone: 'blackAndWhite', variant: 'card',
    });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner]);

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  const meta = CATEGORY_META[result.primaryCategory] ?? CATEGORY_META.overall;

  const recommendations: { key: AppFeature; icon: string; title: string; desc: string; iconBg: string; tag?: string; tagColor?: string }[] = [
    { key: 'fortune', icon: '🔮', title: '오늘의 사주풀이', desc: '내 사주로 보는 자세한 운세',
      iconBg: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)' },
    { key: 'compatibility', icon: '💞', title: '궁합 보기', desc: '소중한 사람과 나의 궁합',
      iconBg: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)' },
    { key: 'dream', icon: '💭', title: '꿈해몽', desc: '간밤의 꿈 풀이',
      iconBg: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
      tag: '준비 중', tagColor: '#6366f1' },
  ];

  return (
    <div className="app-page" style={{ paddingBottom: 120 }}>
      {/* 헤더 */}
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 22 }}>
        <p style={{
          display: 'inline-block',
          margin: '0 0 10px',
          padding: '4px 12px',
          fontSize: 11.5,
          fontWeight: 700,
          color: 'var(--gold-700)',
          background: 'var(--gold-50)',
          border: '1px solid rgba(201,169,98,0.3)',
          borderRadius: 999,
          letterSpacing: '0.04em',
        }}>
          📅 {dateStr} 띠별 운세
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 32 }}>{result.emoji}</span>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--navy-700)', letterSpacing: '-0.03em' }}>
            {userName}님의 {result.animal}띠 운세
          </h1>
        </div>
        <div style={{
          margin: '14px auto 0',
          width: 56, height: 2, borderRadius: 999,
          background: 'linear-gradient(90deg, transparent 0%, var(--gold-500) 50%, transparent 100%)',
        }} />
      </header>

      {/* 점수 + 띠 정보 + 키워드 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{ padding: '22px 20px 20px', marginBottom: 20 }}
      >
        {/* 좌: 점수링 / 우: 띠 캐릭터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ flexShrink: 0 }}>
            <ScoreRing score={result.score} size={92} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 38, lineHeight: 1 }}>{result.emoji}</span>
              <div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--navy-700)', letterSpacing: '-0.02em' }}>
                  {result.animal}띠
                </p>
                {result.element && (
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--gold-600)' }}>
                    오행 · {result.element}({elementLabel(result.element)})
                  </p>
                )}
              </div>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 500, color: 'var(--navy-400)', lineHeight: 1.5 }}>
              오늘은 {result.animal}띠에게 의미 있는 하루예요
            </p>
          </div>
        </div>

        {/* 한줄 요약 */}
        <p style={{
          margin: '16px 0 0',
          fontSize: 15.5, fontWeight: 700,
          color: 'var(--navy-700)', lineHeight: 1.55,
          textAlign: 'center',
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.55)',
          borderRadius: 12,
        }}>
          {result.summaryLine}
        </p>

        {/* 오늘의 키워드 */}
        {result.keywords && result.keywords.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            justifyContent: 'center', marginTop: 12,
          }}>
            {result.keywords.slice(0, 4).map((kw, i) => (
              <span
                key={i}
                style={{
                  padding: '5px 11px',
                  fontSize: 12, fontWeight: 700,
                  color: 'var(--gold-700, #854d0e)',
                  background: 'rgba(201,169,98,0.18)',
                  border: '1px solid rgba(201,169,98,0.35)',
                  borderRadius: 999,
                }}
              >
                #{kw}
              </span>
            ))}
          </div>
        )}
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
                padding: '16px 18px',
                background: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                borderRadius: 18,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 6px 18px rgba(15,23,42,0.06)',
              }}
            >
              <span
                style={{
                  width: 44, height: 44, borderRadius: 13,
                  background: rec.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(30,41,59,0.18)',
                }}
              >
                {rec.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--navy-700)' }}>
                    {rec.title}
                  </p>
                  {rec.tag && (
                    <span style={{
                      padding: '2px 7px', fontSize: 10, fontWeight: 700,
                      color: rec.tagColor, background: `${rec.tagColor}15`,
                      border: `1px solid ${rec.tagColor}33`,
                      borderRadius: 6, letterSpacing: '0.02em',
                    }}>{rec.tag}</span>
                  )}
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, fontWeight: 500, color: 'var(--navy-400)' }}>
                  {rec.desc}
                </p>
              </div>
              <span style={{
                width: 26, height: 26, borderRadius: 999,
                background: 'rgba(15,23,42,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: 'var(--navy-400)', fontWeight: 700,
                flexShrink: 0,
              }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 배너 광고 */}
      <div
        ref={bannerRef}
        style={{
          marginTop: 22,
          minHeight: 80,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // 토스 SDK가 없는 환경(웹 미리보기 등)에서 배너 영역이 보이도록 placeholder
          border: bannerReady ? 'none' : '1.5px dashed var(--navy-200, #cbd5e1)',
          borderRadius: 12,
          background: bannerReady ? 'transparent' : 'rgba(0,0,0,0.02)',
          color: 'var(--navy-300)',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {!bannerReady && '🎯 배너 광고 영역 (테스트)'}
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
