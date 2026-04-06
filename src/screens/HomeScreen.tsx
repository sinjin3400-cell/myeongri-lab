import { haptic } from '../utils/haptic';
import { LogoMark } from '../components/LogoMark';
import { trackEvent } from '../utils/analytics';
import type { AppFeature } from '../types';

type Props = {
  onSelect: (feature: AppFeature) => void;
};

const FEATURES: {
  key: AppFeature;
  icon: string;
  title: string;
  description: string;
  gradient: string;
  accentColor: string;
  ready: boolean;
  tag?: string;
}[] = [
  {
    key: 'fortune',
    icon: '🔮',
    title: '오늘의 사주풀이',
    description: 'AI가 사주와 MBTI를 결합해\n나만의 운세를 풀어드려요',
    gradient: 'linear-gradient(135deg, #1a2744 0%, #2d446c 100%)',
    accentColor: 'var(--gold-500)',
    ready: true,
  },
  {
    key: 'dream',
    icon: '🌙',
    title: '꿈해몽',
    description: '간밤의 꿈이 알려주는 메시지\n행운의 로또번호까지!',
    gradient: 'linear-gradient(135deg, #2d1b69 0%, #4a2d8a 100%)',
    accentColor: '#a78bfa',
    ready: false,
    tag: '준비 중',
  },
  {
    key: 'zodiac',
    icon: '🐉',
    title: '띠별 운세',
    description: '내 띠로 보는 오늘의 운세\n12간지의 지혜를 만나보세요',
    gradient: 'linear-gradient(135deg, #7c2d12 0%, #b45309 100%)',
    accentColor: '#fbbf24',
    ready: false,
    tag: '준비 중',
  },
  {
    key: 'compatibility',
    icon: '💕',
    title: '궁합 보기',
    description: '우리 딸과 배우자의 궁합이\n어떤지 확인해보세요',
    gradient: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)',
    accentColor: '#fda4af',
    ready: false,
    tag: '준비 중',
  },
];

export function HomeScreen({ onSelect }: Props) {
  const today = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} (${dayNames[today.getDay()]})`;

  return (
    <div className="app-page" style={{ paddingBottom: 40 }}>
      {/* 헤더 */}
      <header
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 8,
        }}
      >
        <LogoMark size={44} />
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--navy-700)',
              letterSpacing: '-0.03em',
            }}
          >
            명리연구소
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--gold-500)',
              letterSpacing: '0.04em',
            }}
          >
            AI 사주 × MBTI 운세
          </p>
        </div>
      </header>

      {/* 날짜 */}
      <p
        className="animate-fade-in"
        style={{
          margin: '0 0 24px',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--navy-300)',
          animationDelay: '0.05s',
        }}
      >
        📅 {dateStr}
      </p>

      {/* 오늘의 한마디 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{
          marginBottom: 28,
          padding: '20px 22px',
          animationDelay: '0.1s',
        }}
      >
        <p
          style={{
            margin: '0 0 6px',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--gold-600)',
            letterSpacing: '0.06em',
          }}
        >
          ✨ 오늘의 한마디
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--navy-700)',
            lineHeight: 1.55,
            letterSpacing: '-0.01em',
          }}
        >
          {getDailyMessage(today)}
        </p>
      </div>

      {/* 기능 카드 그리드 */}
      <div
        className="stagger-children"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
        }}
      >
        {FEATURES.map((feature) => (
          <button
            key={feature.key}
            type="button"
            onClick={() => {
              haptic();
              trackEvent('home_feature_clicked', { feature: feature.key, ready: feature.ready });
              if (feature.ready) {
                onSelect(feature.key);
              }
            }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '22px 18px',
              background: feature.gradient,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: feature.ready ? 'pointer' : 'default',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left',
              fontFamily: 'inherit',
              minHeight: 160,
              boxShadow: feature.ready
                ? '0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08)'
                : '0 2px 12px rgba(0,0,0,0.08)',
              opacity: feature.ready ? 1 : 0.65,
              overflow: 'hidden',
            }}
          >
            {/* 배경 일러스트 */}
            <div
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 110,
                height: 110,
                pointerEvents: 'none',
                opacity: 0.15,
                fontSize: 80,
                lineHeight: 1,
                textAlign: 'center',
              }}
            >
              {feature.icon}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 100%)',
                pointerEvents: 'none',
                borderRadius: 'inherit',
              }}
            />

            {/* 준비 중 태그 */}
            {feature.tag && (
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  padding: '3px 8px',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {feature.tag}
              </span>
            )}

            {/* 아이콘 */}
            <span
              style={{
                fontSize: 32,
                marginBottom: 12,
                filter: feature.ready ? 'none' : 'grayscale(0.3)',
              }}
            >
              {feature.icon}
            </span>

            {/* 타이틀 */}
            <p
              style={{
                margin: '0 0 6px',
                fontSize: 17,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {feature.title}
            </p>

            {/* 설명 */}
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
              }}
            >
              {feature.description}
            </p>
          </button>
        ))}
      </div>

      {/* 하단 안내 */}
      <p
        className="animate-fade-in"
        style={{
          marginTop: 24,
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--navy-200)',
          lineHeight: 1.5,
          animationDelay: '0.4s',
        }}
      >
        동양 철학과 현대 AI가 만나는 곳 ✨
      </p>
    </div>
  );
}

/** 날짜 기반 오늘의 한마디 (매일 바뀜) */
function getDailyMessage(date: Date): string {
  const messages = [
    '작은 친절이 큰 행운을 불러오는 하루예요',
    '가까운 사람에게 따뜻한 말 한마디가 큰 복이 됩니다',
    '새로운 만남에 좋은 기운이 감도는 날이에요',
    '마음을 비우면 좋은 기회가 찾아옵니다',
    '오늘은 결단력이 빛나는 날, 망설이지 마세요',
    '주변을 돌아보면 감사할 일이 가득합니다',
    '차분한 마음으로 하루를 시작하면 좋은 일이 생겨요',
    '웃는 얼굴에 복이 온다는 말이 딱 맞는 날이에요',
    '오래된 인연에서 뜻밖의 도움을 받을 수 있어요',
    '작은 변화가 큰 전환점이 될 수 있는 하루예요',
    '오늘 하루 여유를 가지면 내일이 더 밝아집니다',
    '진심을 담은 대화가 관계를 더 깊게 만들어요',
    '자신을 믿으면 길이 열리는 하루예요',
    '소중한 것을 지키는 힘이 생기는 날입니다',
    '마음이 가는 대로 움직이면 좋은 결과가 있어요',
    '오늘은 작은 것에서 행복을 느끼기 좋은 날이에요',
    '기다리던 소식이 찾아올 수 있는 하루예요',
    '나를 위한 시간을 가져보세요, 좋은 에너지가 채워져요',
    '부드러운 말 한마디가 주변을 따뜻하게 합니다',
    '오늘의 노력이 내일의 열매가 되는 날이에요',
    '솔직한 마음이 통하는 하루가 될 거예요',
    '평소와 다른 선택이 행운을 가져다줄 수 있어요',
    '감사하는 마음이 더 큰 복을 부릅니다',
    '오늘은 건강에 신경 쓰면 운도 따라와요',
    '좋은 사람들과 함께하면 기운이 배가 됩니다',
    '지금 하고 있는 일에 집중하면 좋은 성과가 있어요',
    '여유로운 마음이 좋은 기회를 만들어줍니다',
    '오늘 베푼 선행이 며칠 뒤 돌아옵니다',
    '새로운 시작을 위한 좋은 에너지가 가득한 날이에요',
    '가족과 함께하는 시간이 행운을 키워줍니다',
    '오늘은 직감을 믿어도 좋은 날이에요',
  ];
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return messages[dayOfYear % messages.length];
}
