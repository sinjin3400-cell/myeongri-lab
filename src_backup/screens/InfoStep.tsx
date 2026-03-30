import { useRef } from 'react';
import { Button, Text } from '@toss/tds-mobile';
import { HeroIllustration } from '../components/HeroIllustration';
import { LogoMark } from '../components/LogoMark';
import { SijinSelect } from '../components/SijinSelect';
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

/** 8자리 숫자만 받아 YYYY.MM.DD */
function formatEightDigits(d8: string): string {
  return `${d8.slice(0, 4)}.${d8.slice(4, 6)}.${d8.slice(6, 8)}`;
}

/** 저장값에서 숫자만 최대 8자리 */
function birthDigitsFromStored(stored: string): string {
  return digitsOnly(stored).slice(0, 8);
}

/** input 표시: 8자리 완성 시에만 점 포맷, 그 전엔 숫자만 */
function birthDisplayValue(stored: string): string {
  const d = birthDigitsFromStored(stored);
  if (d.length === 8) return formatEightDigits(d);
  return d;
}

/** 입력값 → 다음 저장값 (8자리 되는 순간만 YYYY.MM.DD로 저장) */
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
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === day
  );
}

function formatSijinLine(v: UserInfo): string {
  if (v.birthTimeUnknown) return '모르겠어요';
  if (v.birthSijin) {
    const s = SIJIN_OPTIONS.find((x) => x.id === v.birthSijin);
    return s ? `${s.label}(${s.hanja}) ${s.range}` : '';
  }
  return '';
}

export function InfoStep({ value, onChange, onNext }: Props) {
  const genderFirstRef = useRef<HTMLButtonElement>(null);

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
      requestAnimationFrame(() => {
        genderFirstRef.current?.focus();
      });
    }
  };

  const selectSijin = (id: SijinId) => {
    onChange({
      ...value,
      birthSijin: id,
      birthTimeUnknown: false,
    });
  };

  const selectUnknown = () => {
    onChange({
      ...value,
      birthSijin: null,
      birthTimeUnknown: true,
    });
  };

  const sijinLine = formatSijinLine(value);

  return (
    <div className="app-page">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <LogoMark size={44} />
        <Text
          typography="t1"
          fontWeight="bold"
          color="var(--app-midnight)"
          as="h1"
          style={{ margin: 0, letterSpacing: '-0.03em' }}
        >
          명리연구소
        </Text>
      </div>

      <div style={{ marginBottom: 20 }}>
        <HeroIllustration />
      </div>

      <Text
        typography="t5"
        color="var(--app-midnight-soft)"
        fontWeight="medium"
        as="p"
        style={{
          marginTop: 0,
          marginBottom: 28,
          lineHeight: 1.55,
        }}
      >
        딱딱한 사주풀이는 그만, AI가 내 언어로 해석해드려요 ✨
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Text
            typography="t6"
            fontWeight="semibold"
            color="var(--app-midnight)"
            as="div"
          >
            어떻게 불러드릴까요?
          </Text>
          <input
            className="toss-like-input"
            type="text"
            name="name"
            autoComplete="name"
            enterKeyHint="next"
            placeholder="홍길동"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Text
            typography="t6"
            fontWeight="semibold"
            color="var(--app-midnight)"
            as="div"
          >
            언제 태어나셨어요?
          </Text>
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
          <Text typography="t6" color="#6b7684" as="p" style={{ margin: 0 }}>
            숫자만 입력해 주세요. 8자리를 채우면 날짜로 예쁘게 바뀌어요.
          </Text>
        </div>

        <div>
          <Text
            typography="t6"
            fontWeight="semibold"
            color="var(--app-midnight)"
            as="div"
          >
            성별을 알려주세요
          </Text>
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 8,
              flexWrap: 'wrap',
            }}
          >
            {(
              [
                ['male', '남성'],
                ['female', '여성'],
                ['other', '기타'],
              ] as const
            ).map(([g, label], i) => (
              <Button
                key={g}
                ref={i === 0 ? genderFirstRef : undefined}
                size="medium"
                variant={value.gender === g ? 'fill' : 'weak'}
                color="primary"
                onClick={() => onChange({ ...value, gender: g as Gender })}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Text
            typography="t6"
            fontWeight="semibold"
            color="var(--app-midnight)"
            as="div"
          >
            태어난 시간대를 선택해주세요 (몰라도 괜찮아요)
          </Text>
          <SijinSelect
            value={value}
            displayLine={sijinLine}
            onSelectSijin={selectSijin}
            onSelectUnknown={selectUnknown}
          />
          <Text typography="t6" color="#6b7684" as="p" style={{ margin: 0 }}>
            시진을 골라주시면 더 정확해져요. 잘 모르시면 편하게 모르겠어요를
            눌러주세요.
          </Text>
        </div>
      </div>

      <div className="app-footer-cta">
        <Button
          className="app-cta-round"
          display="full"
          size="xlarge"
          onClick={onNext}
          disabled={!canSubmit}
        >
          내 운세 보러 가기 →
        </Button>
      </div>
    </div>
  );
}
