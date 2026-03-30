import { useEffect, useRef, useState } from 'react';
import { Text } from '@toss/tds-mobile';
import { LoadingNightAnimation } from '../components/LoadingNightAnimation';

const MESSAGES = [
  '생년월일로 사주를 분석하고 있어요 🔮',
  'MBTI 성향과 연결하는 중이에요 ✨',
  '나만의 오늘 운세를 완성하고 있어요 🌙',
] as const;

type Props = {
  onRun: () => Promise<void>;
};

export function LoadingStep({ onRun }: Props) {
  const [idx, setIdx] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length);
    }, 2200);
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
      <LoadingNightAnimation />
      <Text
        key={idx}
        className="app-fade-line"
        typography="t3"
        fontWeight="bold"
        color="var(--app-midnight)"
        style={{ marginTop: 28, textAlign: 'center', lineHeight: 1.45 }}
      >
        {MESSAGES[idx]}
      </Text>
      <Text
        typography="t6"
        color="#6b7684"
        style={{
          marginTop: 12,
          textAlign: 'center',
          maxWidth: 300,
          lineHeight: 1.55,
        }}
      >
        잠시만 기다려 주세요. 곧 따뜻한 말로 풀어드릴게요.
      </Text>
    </div>
  );
}
