import { useState, useEffect, useRef } from 'react';
import { haptic } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { NavBackButton } from '../components/NavBackButton';
import { Analytics } from '@apps-in-toss/web-framework';
import { getZodiacByDate } from '../utils/zodiac';
import { useTossBanner, AD_IDS } from '../hooks/useAds';
import type { ZodiacInput, Gender, CalendarType } from '../types';

type Props = {
  value: ZodiacInput;
  onChange: (v: ZodiacInput) => void;
  onNext: () => void;
  onBack: () => void;
};

function digitsOnly(s: string) { return s.replace(/\D/g, ''); }

function formatEightDigits(d: string): string {
  if (d.length <= 4) return d;
  if (d.length <= 6) return d.slice(0, 4) + '.' + d.slice(4);
  return d.slice(0, 4) + '.' + d.slice(4, 6) + '.' + d.slice(6, 8);
}

function parseDateDigits(stored: string) {
  const d = digitsOnly(stored);
  if (d.length < 4) return { year: 0, month: 0, day: 0, valid: false };
  const year = parseInt(d.slice(0, 4), 10);
  const month = d.length >= 6 ? parseInt(d.slice(4, 6), 10) : 0;
  const day = d.length >= 8 ? parseInt(d.slice(6, 8), 10) : 0;
  const validYear = year >= 1930 && year <= 2030;
  const validMonth = month >= 1 && month <= 12;
  const validDay = day >= 1 && day <= 31;
  return { year, month, day, valid: validYear && (d.length < 6 || validMonth) && (d.length < 8 || validDay) };
}

export function ZodiacInputStep({ value, onChange, onNext, onBack }: Props) {
  const [touched, setTouched] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const bannerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!bannerReady || !bannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bannerRef.current, {
      theme: 'light', tone: 'blackAndWhite', variant: 'card',
    });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner]);

  const calendarType: CalendarType = value.calendarType ?? 'solar';

  const setCalendarType = (c: CalendarType) => {
    haptic();
    const criterion = c === 'solar' ? 'solar' as const : 'lunar' as const;
    onChange({ ...value, calendarType: c, criterion });
  };

  // 생년월일을 하나의 문자열로 관리 (YYYYMMDD → YYYY.MM.DD)
  const birthStored = (value.birthYear || '') + (value.birthMonth || '') + (value.birthDay || '');
  const birthDisplay = formatEightDigits(digitsOnly(birthStored));

  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = digitsOnly(e.target.value).slice(0, 8);
    const formatted = formatEightDigits(d);
    const year = d.slice(0, 4);
    const month = d.slice(4, 6);
    const day = d.slice(6, 8);
    onChange({ ...value, birthYear: year, birthMonth: month || undefined, birthDay: day || undefined });
  };

  const parsed = parseDateDigits(birthStored);
  const isLunarBirth = calendarType === 'lunar' || calendarType === 'lunar_leap';

  const zodiacInfo = parsed.year >= 1930
    ? getZodiacByDate(
        parsed.year,
        parsed.month || undefined,
        parsed.day || undefined,
        isLunarBirth ? 'lunar' : 'solar',
        calendarType,
      )
    : null;

  const canSubmit = value.name.trim().length >= 1 && parsed.year >= 1930 && value.gender !== '';

  const underlineInputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px 0',
    fontSize: 21,
    fontWeight: 700,
    border: 'none',
    borderBottom: `2px solid ${focusedField === field ? '#b9623d' : 'var(--navy-100)'}`,
    borderRadius: 0,
    background: 'transparent',
    color: 'var(--navy-700)',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
    letterSpacing: '-0.01em',
    transition: 'border-color 0.2s ease',
  });

  return (
    <div className="app-page" style={{ paddingBottom: 40, background: '#fefcf9' }}>
      {/* 헤더: 뒤로가기 + 타이틀 + 스텝 */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <NavBackButton onClick={onBack} />
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy-700)' }}>
          띠별운세
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: 'var(--navy-300)' }}>
          1/3
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--gold-500)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(26,39,68,0.08)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(26,39,68,0.08)' }} />
      </div>

      {/* 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          margin: '0 0 8px',
          fontSize: 13,
          fontWeight: 700,
          color: '#b9623d',
          letterSpacing: '0.06em',
        }}>
          12간지
        </p>
        <h1 style={{
          margin: '0 0 10px',
          fontSize: 24,
          fontWeight: 800,
          color: 'var(--navy-700)',
          letterSpacing: '-0.84px',
          lineHeight: '30.72px',
          whiteSpace: 'pre-line',
        }}>
          {'당신의 띠를\n찾아볼까요?'}
        </h1>
        <p style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 500,
          color: '#455578',
          lineHeight: '24.75px',
          letterSpacing: '-0.15px',
          whiteSpace: 'pre-line',
        }}>
          {'생년월일을 입력하면\n12간지의 지혜가 풀어주는 오늘의 운세.'}
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* 이름 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>이름</label>
          <input
            type="text"
            placeholder="이름을 알려주세요"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            style={underlineInputStyle('name')}
          />
        </div>

        {/* 생년월일 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={labelStyle}>생년월일</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {([
              ['solar', '양력'],
              ['lunar', '음력 평달'],
              ['lunar_leap', '음력 윤달'],
            ] as [CalendarType, string][]).map(([key, label]) => {
              const selected = calendarType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCalendarType(key)}
                  style={{
                    flex: 1,
                    padding: '10px 6px',
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 14,
                    border: selected ? 'none' : '1.5px solid var(--navy-100)',
                    background: selected ? 'var(--navy-700)' : 'transparent',
                    color: selected ? '#fff' : 'var(--navy-400)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="1995.03.15"
            value={birthDisplay}
            onChange={handleBirthChange}
            onFocus={() => setFocusedField('birth')}
            onBlur={() => { setFocusedField(null); setTouched(true); }}
            style={{ ...underlineInputStyle('birth'), letterSpacing: '0.02em' }}
          />
          <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--navy-200)', lineHeight: 1.5 }}>
            {touched && value.birthYear.length === 4 && !parsed.valid
              ? '올바른 생년월일을 입력해주세요'
              : '숫자 8자리를 순서대로 입력해주세요'}
          </p>
        </div>

        {/* 띠 미리보기 */}
        {zodiacInfo && (
          <div
            className="animate-fade-in"
            style={{
              padding: '14px 16px',
              background: '#faece2',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 36 }}>{zodiacInfo.animal.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#7c3f20' }}>
                {zodiacInfo.animal.name}띠
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 500, color: '#9b6340' }}>
                {value.birthYear}년생{isLunarBirth ? ' (음력)' : ''}
                {zodiacInfo.adjusted && ' · 음력 설 이전 출생으로 보정됨'}
              </p>
            </div>
          </div>
        )}

        {/* 성별 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={labelStyle}>성별</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {([['female', '여성'], ['male', '남성'], ['other', '기타']] as const).map(([key, label]) => {
              const selected = value.gender === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    haptic();
                    onChange({ ...value, gender: key as Gender });
                  }}
                  style={{
                    padding: '14px 8px',
                    borderRadius: 14,
                    border: selected ? 'none' : '1.5px solid var(--navy-100)',
                    background: selected ? 'var(--navy-700)' : 'transparent',
                    color: selected ? '#fff' : 'var(--navy-400)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    fontWeight: 600,
                    flex: 1,
                    transition: 'all 0.18s ease',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          style={{
            width: '100%',
            padding: '16px 22px',
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            cursor: canSubmit ? 'pointer' : 'default',
            fontFamily: 'inherit',
            letterSpacing: '-0.32px',
            background: canSubmit
              ? 'linear-gradient(135deg, #d4a84b 0%, #b88a35 100%)'
              : 'var(--navy-100)',
            boxShadow: canSubmit ? '0 6px 20px rgba(212, 168, 75, 0.22)' : 'none',
            opacity: canSubmit ? 1 : 0.5,
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          disabled={!canSubmit}
          onClick={() => {
            haptic();
            trackEvent('zodiac_submit', { animal: zodiacInfo?.animal.name ?? '' });
            try { Analytics.click({ log_name: 'zodiac_submit' }); } catch (_) { /* noop */ }
            onNext();
          }}
        >
          운세 풀어보기 <span style={{ color: '#e0be70' }}>&rarr;</span>
        </button>
      </div>

      {/* 하단 배너 광고 */}
      <div
        ref={bannerRef}
        style={{
          marginTop: 22, minHeight: 80,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          border: bannerReady ? 'none' : '1.5px dashed var(--navy-200, #cbd5e1)',
          borderRadius: 12,
          background: bannerReady ? 'transparent' : 'rgba(0,0,0,0.02)',
          color: 'var(--navy-300)', fontSize: 12, fontWeight: 600,
        }}
      >
        {!bannerReady && '배너 광고 영역 (테스트)'}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--navy-400)',
  letterSpacing: '-0.14px',
};
