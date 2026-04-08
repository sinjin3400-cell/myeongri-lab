import { useEffect, useState, useRef } from 'react';

type Props = {
  title: string;
  messages: string[];
  onRun: () => Promise<void>;
};

export function SimpleLoadingStep({ title, messages, onRun }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    onRun();
  }, [onRun]);

  // 메시지 순환
  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length);
    }, 1400);
    return () => clearInterval(timer);
  }, [messages.length]);

  // 프로그레스 바
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return 95;
        return p + (p < 60 ? 3 : 1);
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '0 28px',
        background: 'var(--app-bg)',
        gap: 20,
        textAlign: 'center',
      }}
    >
      {/* 타이틀 */}
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--navy-700)' }}>
        {title}
      </h2>

      {/* 순환 메시지 */}
      <p
        key={msgIdx}
        className="animate-fade-in"
        style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--navy-500)', minHeight: 24 }}
      >
        {messages[msgIdx]}
      </p>

      {/* 프로그레스 바 */}
      <div style={{ width: '100%', maxWidth: 280, height: 6, borderRadius: 3, background: 'var(--navy-50, #e5e0d5)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: 3,
            background: 'linear-gradient(90deg, var(--gold-500) 0%, var(--gold-400, #d4b06a) 100%)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <p style={{ margin: 0, fontSize: 13, color: 'var(--navy-300)' }}>
        잠시만 기다려주세요...
      </p>
    </div>
  );
}
