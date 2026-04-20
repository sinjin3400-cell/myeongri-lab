import { useRef, useEffect } from 'react';
import { haptic } from '../utils/haptic';
import { SijinSelect } from '../components/SijinSelect';
import { NavBackButton } from '../components/NavBackButton';
import { Analytics } from '@apps-in-toss/web-framework';
import { useTossBanner, AD_IDS } from '../hooks/useAds';
import type { UserInfo, Gender, CalendarType } from '../types';
import { SIJIN_OPTIONS, type SijinId } from '../sijin';

type Props = {
  value: UserInfo;
  onChange: (v: UserInfo) => void;
  onNext: () => void;
  onHome?: () => void;
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

export function InfoStep({ value, onChange, onNext, onHome }: Props) {
  const genderFirstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try { Analytics.impression({ log_name: 'info_input_view' }); } catch (_) { /* noop */ }
  }, []);

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
      {/* 헤더: 뒤로가기 + 사주풀이 + 스텝 */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        {onHome && <NavBackButton onClick={onHome} />}
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy-700)' }}>
          사주풀이
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: 'var(--navy-300)' }}>
          1/4
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--gold-500)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(26,39,68,0.08)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(26,39,68,0.08)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(26,39,68,0.08)' }} />
      </div>

      {/* 섹션 라벨 + 타이틀 */}
      <div className="animate-fade-in" style={{ marginBottom: 32, animationDelay: '0.05s' }}>
        <p className="section-label" style={{ color: 'var(--gold-600)' }}>기본 정보</p>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--navy-700)', lineHeight: 1.4, letterSpacing: '-0.02em' }}>
          어떻게<br />불러드릴까요?
        </h2>
      </div>

      {/* 폼 */}
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* 이름 — 밑줄 스타일 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-400)' }}>
            이름
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="name"
              autoComplete="name"
              enterKeyHint="next"
              placeholder="이름을 알려주세요"
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 32px 12px 0',
                fontSize: 20,
                fontWeight: 700,
                fontFamily: 'inherit',
                color: 'var(--navy-700)',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid var(--navy-100)',
                borderRadius: 0,
                outline: 'none',
                transition: 'border-color 0.2s',
                letterSpacing: '-0.01em',
              }}
              onFocus={(e) => { e.target.style.borderBottomColor = 'var(--gold-500)'; }}
              onBlur={(e) => { e.target.style.borderBottomColor = 'var(--navy-100)'; }}
            />
            <span style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--gold-500)' }}>
              ✏️
            </span>
          </div>
        </div>

        {/* 생년월일 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-400)' }}>
            생년월일
          </label>
          {/* 양력/음력 선택 */}
          <div style={{ display: 'flex', gap: 6 }}>
            {([
              ['solar', '양력'],
              ['lunar', '음력 평달'],
              ['lunar_leap', '음력 윤달'],
            ] as [CalendarType, string][]).map(([key, label]) => {
              const selected = (value.calendarType ?? 'solar') === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`btn-chip ${selected ? 'selected' : ''}`}
                  onClick={() => {
                    haptic();
                    onChange({ ...value, calendarType: key });
                  }}
                  style={{ flex: 1, padding: '10px 6px', fontSize: 13 }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            inputMode="numeric"
            name="birthDate"
            autoComplete="bday"
            enterKeyHint="next"
            placeholder="1995.03.15"
            value={birthDisplayValue(value.birthDate)}
            onChange={handleBirthDateChange}
            style={{
              width: '100%',
              padding: '12px 0',
              fontSize: 20,
              fontWeight: 700,
              fontFamily: 'inherit',
              color: 'var(--navy-700)',
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid var(--navy-100)',
              borderRadius: 0,
              outline: 'none',
              transition: 'border-color 0.2s',
              letterSpacing: '0.02em',
            }}
            onFocus={(e) => { e.target.style.borderBottomColor = 'var(--gold-500)'; }}
            onBlur={(e) => { e.target.style.borderBottomColor = 'var(--navy-100)'; }}
          />
          <p style={{ margin: 0, fontSize: 12, color: 'var(--navy-200)', lineHeight: 1.5 }}>
            숫자 8자리를 순서대로 입력해주세요
          </p>
        </div>

        {/* 성별 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-400)' }}>
            성별
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {(
              [
                ['female', '여성'],
                ['male', '남성'],
                ['other', '기타'],
              ] as const
            ).map(([g, label], i) => (
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
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 태어난 시간 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-400)' }}>
            태어난 시간
          </label>
          <SijinSelect
            value={value}
            displayLine={sijinLine}
            onSelectSijin={selectSijin}
            onSelectUnknown={selectUnknown}
          />
          <p style={{ margin: 0, fontSize: 12, color: 'var(--navy-200)', lineHeight: 1.5 }}>
            시진을 알면 시주까지 분석해서 더 정확해져요
          </p>
        </div>
      </div>

      {/* 하단 CTA */}
      <div style={{ marginTop: 36, paddingBottom: 24 }}>
        <button
          className="btn-primary"
          onClick={() => {
            try { Analytics.click({ log_name: 'info_submit' }); } catch (_) { /* noop */ }
            onNext();
          }}
          disabled={!canSubmit}
          style={{ fontSize: 17 }}
        >
          다음 →
        </button>

        {/* 하단 배너 광고 */}
        <div
          ref={bannerRef}
          style={{
            marginTop: 20,
            minHeight: bannerReady ? 80 : 0,
            borderRadius: 12,
          }}
        />
      </div>
    </div>
  );
}
