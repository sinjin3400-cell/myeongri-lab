import { Button, Text } from '@toss/tds-mobile';
import { MbtiHeroIllustration } from '../components/MbtiHeroIllustration';
import { MBTI_LIST, type MbtiType } from '../api';

type Props = {
  selected: MbtiType | null;
  onSelect: (m: MbtiType) => void;
  onSkip: () => void;
  onConfirm: () => void;
  errorMessage: string | null;
};

export function MbtiStep({
  selected,
  onSelect,
  onSkip,
  onConfirm,
  errorMessage,
}: Props) {
  return (
    <div className="app-page">
      <div style={{ marginBottom: 20 }}>
        <MbtiHeroIllustration />
      </div>
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginBottom: 28,
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
          나는 어떤 사람일까요?
        </Text>
        <Text
          typography="t5"
          color="var(--app-midnight-soft)"
          fontWeight="medium"
          as="p"
          display="block"
          style={{ margin: 0, width: '100%', lineHeight: 1.55 }}
        >
          MBTI를 알면 사주 해석이 훨씬 정확해져요
        </Text>
      </header>

      {errorMessage && (
        <Text
          typography="t7"
          color="#f04452"
          as="p"
          display="block"
          style={{ marginBottom: 16, marginTop: 0 }}
        >
          {errorMessage}
        </Text>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
        }}
      >
        {MBTI_LIST.map((m) => (
          <Button
            key={m}
            size="small"
            variant={selected === m ? 'fill' : 'weak'}
            color="primary"
            onClick={() => onSelect(m)}
          >
            {m}
          </Button>
        ))}
      </div>

      <div
        className="app-footer-cta"
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        <Button
          className="app-cta-round"
          display="full"
          size="large"
          variant="weak"
          onClick={onSkip}
        >
          MBTI가 기억 안 나요 →
        </Button>
        <Button
          className="app-cta-round"
          display="full"
          size="xlarge"
          onClick={onConfirm}
        >
          나의 오늘 운세 분석하기 ✨
        </Button>
      </div>
    </div>
  );
}
