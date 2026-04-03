import { useRef, useEffect } from 'react';
import { haptic } from '../utils/haptic';
import { HeroIllustration } from '../components/HeroIllustration';
import { LogoMark } from '../components/LogoMark';
import { SijinSelect } from '../components/SijinSelect';
import { useTossBanner, AD_IDS } from '../hooks/useAds';
import type { UserInfo, Gender } from '../types';
import { SIJIN_OPTIONS, type SijinId } from '../sijin';

type Props = {
  value: UserInfo;
  onChange: (v: UserInfo) => void;
  onNext: () => void;
};

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

function formatEightDigits(d8: string): string {
  return `${d8.slice(0, 4)}.${d8.slice(4, 6)}.${d8.slice(6, 8)}`;
}

function birthDigitsFromStored(stored: string): string {
  return digitsOnly(stored).slice(0, 8);
}

function birthDisplayValue(stored: string): string {
  const d = birthDigitsFromStored(stored);
  if (d.length === 8) return formatEightDigits(d);
  return d;
}

function nextBirthStoredFromInput(inputValue: string): string {
  const d = digitsOnly(inputValue).slice(0, 8);
  if (d.length === 8) return formatEightDigits(d);
  return d;
}

function validBirthStored(stored: string): boolean {
  const d = birthDigitsFromStored(stored);
  if (d.length !== 8) return false;
  const dotted = formatEightDigits(d);
  const [y, m, day] = dotted.split('.').map(Number);
  const dt = new Date(y, m - 1, day);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === day;
}

function formatSijinLine(v: UserInfo): string {
  if (v.birthTimeUnknown) return '🤔 모르겠어요';
  if (v.birthSijin) {
    const s = SIJIN_OPTIONS.find((x) => x.id === v.birthSijin);
    return s ? `${s.hanja} ${s.label} (${s.range})` : '';
  }
  return '';
}

export function InfoStep({ value, onChange, onNext }: Props) {
  const genderFirstRef = useRef<HTMLButtonElement>(null);

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

  const nameOk = value.name.trim().length >= 1;
  const dateOk = validBirthStored(value.birthDate);
  const genderOk = value.gender !== '';
  const timeOk = value.birthTimeUnknown || value.birthSijin !== null;
  const canSubmit = nameOk && dateOk && genderOk && timeOk;

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const prevDigits = birthDigitsFromStored(value.birthDate);
    const nextStored = nextBirthStoredFromInput(e.target.value);
    const nextDigits = birthDigitsFromStored(nextStored);
    onChange({ ...value, birthDate: nextStored });
    if (nextDigits.length === 8 && prevDigits.length < 8) {
      requestAnimationFrame(() => genderFirstRef.current?.focus());
    }
  };

  const selectSijin = (id: SijinId) => {
    onChange({ ...value, birthSijin: id, birthTimeUnknown: false });
  };

  const selectUnknown = () => {
    onChange({ ...value, birthSijin: null, birthTimeUnknown: true });
  };

  const sijinLine = formatSijinLine(value);

  return (
    <div className="app-page">
      {/* 헤더 */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
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
      </div>

      {/* 히어로 일러스트 */}
      <div className="animate-fade-in" style={{ marginBottom: 24, animationDelay: '0.1s' }}>
        <HeroIllustration />
      </div>

      {/* 인트로 */}
      <p
        className="animate-fade-in"
        style={{
          margin: '0 0 32px',
          fontSize: 16,
          fontWeight: 500,
          color: 'var(--navy-400)',
          lineHeight: 1.6,
          animationDelay: '0.15s',
        }}
      >
        사주와 MBTI를 결합해서,{' '}
        <span style={{ color: 'var(--gold-600)', fontWeight: 600 }}>나에게 딱 맞는 언어</span>로
        오늘의 운세를 풀어드려요 ✨
      </p>

      {/* 폼 */}
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* 이름 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--navy-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 18 }}>👋</span>
            어떻게 불러드릴까요?
          </label>
          <input
            className="toss-like-input"
            type="text"
            name="name"
            autoComplete="name"
            enterKeyHint="next"
            placeholder="이름이나 닉네임을 알려주세요"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
        </div>

        {/* 생년월일 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--navy-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 18 }}>🎂</span>
            언제 태어나셨어요?
          </label>
          <input
            className="toss-like-input"
            type="text"
            inputMode="numeric"
            name="birthDate"
            autoComplete="bday"
            enterKeyHint="next"
            placeholder="19950315"
            value={birthDisplayValue(value.birthDate)}
            onChange={handleBirthDateChange}
          />
          <p style={{ margin: 0, fontSize: 13, color: 'var(--navy-200)', lineHeight: 1.5 }}>
            숫자 8자리를 입력하면 자동으로 예쁘게 바뀌어요
          </p>
        </div>

        {/* 성별 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--navy-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 18 }}>✨</span>
            성별을 알려주세요
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {(
              [
                ['male', '남성', '♂️'],
                ['female', '여성', '♀️'],
                ['other', '기타', '🌈'],
              ] as const
            ).map(([g, label, icon], i) => (
              <button
                key={g}
                ref={i === 0 ? genderFirstRef : undefined}
                type="button"
                className={`gender-chip ${value.gender === g ? 'selected' : ''}`}
                onClick={() => {
                  haptic();
                  onChange({ ...value, gender: g as Gender });
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* 시진 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--navy-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 18 }}>🕐</span>
            태어난 시간을 알고 계신가요?
          </label>
          <SijinSelect
            value={value}
            displayLine={sijinLine}
            onSelectSijin={selectSijin}
            onSelectUnknown={selectUnknown}
          />
          <p style={{ margin: 0, fontSize: 13, color: 'var(--navy-200)', lineHeight: 1.5 }}>
            시진을 알면 시주까지 분석해서 더 정확해져요
          </p>
        </div>
      </div>

      {/* CTA */}
      <div
        className="app-footer-cta"
        style={{
          position: 'static',
          padding: 0,
          background: 'transparent',
          marginTop: 28,
          maxWidth: 'none',
          zIndex: 'auto',
        }}
      >
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={!canSubmit}
        >
          내 운세 보러 가기 →
        </button>

        {/* 배너 광고 */}
        <div
          ref={bannerRef}
          style={{ width: '100%', height: 96, marginTop: 16 }}
        />
      </div>
    </div>
  );
}
