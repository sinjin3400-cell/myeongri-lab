import { useEffect, useRef, useState } from 'react';
import { LoadingNightAnimation } from '../components/LoadingNightAnimation';
import { useTossBanner, AD_IDS } from '../hooks/useAds';

const STEPS = [
  { label: '사주 팔자 구성', duration: 2200 },
  { label: '오행 균형 분석', duration: 2400 },
  { label: 'MBTI 기운 매칭', duration: 2000 },
  { label: '운세 문장 정리', duration: 3000 },
] as const;

type Props = {
  onRun: () => Promise<void>;
};

export function LoadingStep({ onRun }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const ran = useRef(false);

  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerReady || !bannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bannerRef.current, {
      theme: 'dark',
      tone: 'blackAndWhite',
      variant: 'card',
    });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner]);

  useEffect(() => {
    let step = 0;
    const advance = () => {
      if (step < STEPS.length - 1) {
        step += 1;
        setActiveStep(step);
        setTimeout(advance, STEPS[step].duration);
      }
    };
    setTimeout(advance, STEPS[0].duration);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p;
        if (p < 30) return p + Math.random() * 10 + 5;
        if (p < 60) return p + Math.random() * 6 + 2;
        return p + Math.random() * 2 + 0.5;
      });
    }, 400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void onRun();
  }, [onRun]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '40px 24px',
        background: 'linear-gradient(180deg, #131e30 0%, #1a2744 40%, #1f2f52 100%)',
      }}
    >
      {/* 천체 애니메이션 */}
      <div className="animate-fade-in" style={{ marginBottom: 32 }}>
        <LoadingNightAnimation />
      </div>

      {/* 타이틀 */}
      <h2
        className="animate-fade-in"
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: '#f0e6d3',
          textAlign: 'center',
          letterSpacing: '-0.02em',
          marginBottom: 8,
          animationDelay: '0.2s',
        }}
      >
        사주를 분석하고 있어요
      </h2>
      <p
        className="animate-fade-in"
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'rgba(194, 202, 216, 0.6)',
          textAlign: 'center',
          marginBottom: 32,
          animationDelay: '0.3s',
        }}
      >
        동양 철학과 현대 심리학이 만나는 순간
      </p>

      {/* 단계별 진행 표시 */}
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: 280,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          animationDelay: '0.4s',
        }}
      >
        {STEPS.map((s, i) => {
          const done = i < activeStep;
          const current = i === activeStep;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: done || current ? 1 : 0.35,
                transition: 'opacity 0.5s ease',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: done
                    ? 'var(--gold-500)'
                    : current
                    ? 'rgba(212, 168, 75, 0.2)'
                    : 'rgba(255,255,255,0.06)',
                  color: done ? '#1a2744' : current ? 'var(--gold-400)' : 'rgba(255,255,255,0.3)',
                  border: current ? '1.5px solid var(--gold-500)' : 'none',
                  transition: 'all 0.5s ease',
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: done || current ? 600 : 500,
                  color: done
                    ? 'var(--gold-400)'
                    : current
                    ? '#f0e6d3'
                    : 'rgba(194, 202, 216, 0.4)',
                  transition: 'color 0.5s ease',
                }}
              >
                {s.label}
              </span>
              {current && (
                <span
                  style={{
                    marginLeft: 'auto',
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: 'var(--gold-500)',
                    animation: 'app-twinkle 1.2s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 프로그레스 바 */}
      <div
        style={{
          width: '100%',
          maxWidth: 280,
          height: 3,
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.06)',
          marginTop: 28,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 2,
            background: 'linear-gradient(90deg, var(--gold-500), var(--gold-300))',
            width: `${Math.min(progress, 95)}%`,
            transition: 'width 0.6s ease-out',
          }}
        />
      </div>

      {/* 배너 광고 */}
      <div
        ref={bannerRef}
        style={{
          width: '100%',
          maxWidth: 320,
          minHeight: bannerReady ? 96 : 0,
          marginTop: 36,
          borderRadius: 12,
        }}
      />
    </div>
  );
}
