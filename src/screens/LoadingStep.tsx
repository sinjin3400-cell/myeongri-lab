import { useEffect, useRef, useState } from 'react';
import { LoadingNightAnimation } from '../components/LoadingNightAnimation';

const MESSAGES = [
  '사주팔자를 펼치고 있어요 🔮',
  '천간과 지지의 흐름을 읽는 중이에요 ✨',
  '오행의 균형을 살펴보고 있어요 🌿',
  'MBTI 성향과 연결하고 있어요 🧠',
  '오늘의 일진과 대조하는 중이에요 🌙',
  '나만의 맞춤 운세를 완성하고 있어요 💫',
] as const;

type Props = {
  onRun: () => Promise<void>;
};

export function LoadingStep({ onRun }: Props) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // 가짜 프로그레스 바
  useEffect(() => {
    const t = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + Math.random() * 8 + 2;
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
    </div>
  );
}
