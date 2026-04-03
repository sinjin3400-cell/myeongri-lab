import { useEffect, useRef, useState } from 'react';
import { LoadingNightAnimation } from '../components/LoadingNightAnimation';
import { useTossBanner, AD_IDS } from '../hooks/useAds';

const MESSAGES = [
  '사주팔자를 펼치고 있어요 🔮',
  '천간과 지지의 흐름을 읽는 중 ✨',
  '오행의 균형을 살펴보고 있어요 🌿',
  '일주와 일진의 관계를 분석 중 🔥',
  'MBTI 성향과 연결하고 있어요 🧠',
  '오늘의 일진과 대조하는 중 🌙',
  '운세 에너지를 모으고 있어요 ⚡',
  '맞춤 운세를 완성하고 있어요 💫',
] as const;

const GOLDEN_MESSAGE = '오늘의 황금운세를 가지신 분께 1,000P를 드려요! 🎁';

type Props = {
  onRun: () => Promise<void>;
};

export function LoadingStep({ onRun }: Props) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showGolden, setShowGolden] = useState(false);
  const ran = useRef(false);

  // 배너 광고
  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerReady || !bannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bannerRef.current, {
      theme: 'light',
      tone: 'blackAndWhite',
      variant: 'card',
    });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner]);

  // 일반 메시지 순환 + 중간에 황금운세 문구 3초간 표시
  useEffect(() => {
    let goldenShown = false;
    const t = window.setInterval(() => {
      setIdx((prev) => {
        const next = (prev + 1) % MESSAGES.length;
        // 4번째 메시지 후 황금운세 문구 표시 (한 번만)
        if (next === 4 && !goldenShown) {
          goldenShown = true;
          setShowGolden(true);
          setTimeout(() => setShowGolden(false), 3000);
        }
        return next;
      });
    }, 1200);
    return () => clearInterval(t);
  }, []);

  // 프로그레스 바 - 초반 빠르게, 후반 느리게
  useEffect(() => {
    const t = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p;
        if (p < 40) return p + Math.random() * 12 + 4;
        if (p < 70) return p + Math.random() * 6 + 2;
        return p + Math.random() * 2 + 0.5;
      });
    }, 300);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void onRun();
  }, [onRun]);

  return (
    <div
      className="app-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        paddingTop: 40,
        paddingBottom: 40,
      }}
    >
      {/* 애니메이션 */}
      <div className="animate-fade-in">
        <LoadingNightAnimation />
      </div>

      {/* 메시지 */}
      {showGolden ? (
        <p
          key="golden"
          className="app-fade-line"
          style={{
            marginTop: 28,
            textAlign: 'center',
            lineHeight: 1.55,
            fontSize: 17,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #B8860B, #8B6914, #A0522D)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.01em',
            textShadow: '0 0 20px rgba(184, 134, 11, 0.15)',
          }}
        >
          {GOLDEN_MESSAGE}
        </p>
      ) : (
        <p
          key={idx}
          className="app-fade-line"
          style={{
            marginTop: 28,
            textAlign: 'center',
            lineHeight: 1.45,
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--navy-700)',
            letterSpacing: '-0.02em',
          }}
        >
          {MESSAGES[idx]}
        </p>
      )}

      {/* 프로그레스 바 */}
      <div
        style={{
          width: 200,
          height: 4,
          borderRadius: 2,
          background: 'rgba(26, 39, 68, 0.06)',
          marginTop: 20,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 2,
            background: 'linear-gradient(90deg, var(--gold-500), var(--gold-300))',
            width: `${Math.min(progress, 95)}%`,
            transition: 'width 0.5s ease-out',
          }}
        />
      </div>

      {/* 서브 텍스트 */}
      <p
        style={{
          marginTop: 16,
          textAlign: 'center',
          maxWidth: 280,
          lineHeight: 1.55,
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--navy-200)',
        }}
      >
        동양 철학과 현대 심리학이 만나는 순간,
        <br />
        조금만 기다려주세요
      </p>

      {/* 배너 광고 */}
      <div
        ref={bannerRef}
        style={{
          width: '100%',
          maxWidth: 320,
          height: 96,
          marginTop: 32,
        }}
      />
    </div>
  );
}
