import { Button, Text } from '@toss/tds-mobile';
import { ResultSparkleDecor } from '../components/ResultSparkleDecor';
import type { FortuneResult } from '../types';

type Props = {
  result: FortuneResult;
  userName: string;
  onRestart: () => void;
};

function Section({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section
      style={{
        background: 'rgba(255, 255, 255, 0.94)',
        borderRadius: 18,
        padding: '20px 20px',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid rgba(26, 39, 68, 0.06)',
      }}
    >
      <Text
        typography="t4"
        fontWeight="bold"
        color="var(--app-midnight)"
        as="h2"
      >
        {title}
      </Text>
      <Text
        typography="t6"
        color="#4e5968"
        fontWeight="regular"
        as="p"
        style={{ marginTop: 12, whiteSpace: 'pre-wrap', lineHeight: 1.62 }}
      >
        {body}
      </Text>
    </section>
  );
}

export function ResultStep({ result, userName, onRestart }: Props) {
  const displayName = userName.trim() || '회원';

  return (
    <div className="app-page">
      <ResultSparkleDecor />
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginBottom: 26,
        }}
      >
        <Text
          typography="t1"
          fontWeight="bold"
          color="var(--app-midnight)"
          as="h1"
          display="block"
          style={{
            margin: 0,
            width: '100%',
            lineHeight: 1.28,
            letterSpacing: '-0.03em',
          }}
        >
          ✨ 오늘의 운세가 도착했어요
        </Text>
        <Text
          typography="t5"
          color="var(--app-midnight-soft)"
          fontWeight="medium"
          as="p"
          display="block"
          style={{ margin: 0, width: '100%', lineHeight: 1.55 }}
        >
          {displayName}님만을 위한 맞춤 운세예요 🌟
        </Text>
      </header>

      <div
        style={{
          marginTop: 0,
          marginBottom: 22,
          padding: '18px 20px',
          borderRadius: 16,
          background:
            'linear-gradient(135deg, rgba(201, 169, 98, 0.14) 0%, rgba(232, 241, 255, 0.85) 100%)',
          border: '1px solid rgba(26, 39, 68, 0.06)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <Text typography="t5" fontWeight="bold" color="var(--app-midnight)">
          {result.summaryLine}
        </Text>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Section title="☀️ 총운" body={result.overall} />
        <Section title="💕 애정운" body={result.love} />
        <Section title="✨ 금전운" body={result.money} />
        <Section title="🌿 건강운" body={result.health} />
      </div>

      <div className="app-footer-cta">
        <Button
          className="app-cta-round"
          display="full"
          size="xlarge"
          onClick={onRestart}
        >
          오늘 운세 다시 보기 🔄
        </Button>
      </div>
    </div>
  );
}
