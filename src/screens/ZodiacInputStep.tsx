import { useState } from 'react';
import { haptic } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { getZodiacByDate } from '../utils/zodiac';
import { LogoMark } from '../components/LogoMark';
import type { ZodiacInput, Gender } from '../types';

type Props = {
  value: ZodiacInput;
  onChange: (v: ZodiacInput) => void;
  onNext: () => void;
  onBack: () => void;
};

export function ZodiacInputStep({ value, onChange, onNext, onBack }: Props) {
  const [touched, setTouched] = useState(false);
  const [month, setMonth] = useState<string>(value.birthMonth ?? '');
  const [day, setDay] = useState<string>(value.birthDay ?? '');

  const yearNum = parseInt(value.birthYear, 10);
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);
  const isValidYear = !isNaN(yearNum) && yearNum >= 1930 && yearNum <= 2010;
  const isValidMonth = !isNaN(monthNum) && monthNum >= 1 && monthNum <= 12;
  const isValidDay = !isNaN(dayNum) && dayNum >= 1 && dayNum <= 31;

  // 1~2월생인데 월/일 미입력 → 안내 필요
  const needsLunarPrompt = isValidYear && (!isValidMonth || !isValidDay);
  const showLunarHelper = isValidYear; // 항상 월/일 입력 권장

  const zodiacInfo = isValidYear
    ? getZodiacByDate(
        yearNum,
        isValidMonth ? monthNum : undefined,
        isValidMonth && isValidDay ? dayNum : undefined,
      )
    : null;

  const canSubmit = value.name.trim().length >= 1 && isValidYear && value.gender !== '';

  const handleYearChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    onChange({ ...value, birthYear: digits });
  };
  const handleMonthChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    setMonth(digits);
    onChange({ ...value, birthMonth: digits });
  };
  const handleDayChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    setDay(digits);
    onChange({ ...value, birthDay: digits });
  };

  return (
    <div className="app-page" style={{ paddingBottom: 40 }}>
      {/* 헤더 */}
      <header
        className="animate-fade-in"
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}
      >
        <LogoMark size={40} />
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--navy-700)', letterSpacing: '-0.03em' }}>
            띠별 운세
          </h1>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--gold-500)' }}>
            내 띠로 보는 오늘의 운세
          </p>
        </div>
      </header>

      {/* 안내 문구 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{ marginBottom: 28, padding: '18px 20px' }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--navy-700)', lineHeight: 1.6 }}>
          🐲 태어난 해를 알려주시면
          <br />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy-400)' }}>
            오늘의 띠별 운세를 풀어드릴게요.
          </span>
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 이름 */}
        <div>
          <label style={labelStyle}>😊 이름을 알려주세요</label>
          <input
            type="text"
            placeholder="예: 홍길동"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            style={inputStyle}
          />
        </div>

        {/* 태어난 해 */}
        <div>
          <label style={labelStyle}>📅 태어난 해</label>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="예: 1965"
            value={value.birthYear}
            onChange={(e) => handleYearChange(e.target.value)}
            onBlur={() => setTouched(true)}
            maxLength={4}
            style={inputStyle}
          />
          {touched && value.birthYear.length === 4 && !isValidYear && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#e11d48' }}>
              1930~2010년 사이로 입력해주세요
            </p>
          )}
        </div>

        {/* 태어난 월/일 (정확한 띠 계산용) */}
        {showLunarHelper && (
          <div className="animate-fade-in">
            <label style={labelStyle}>
              🗓️ 태어난 월·일 <span style={{ fontWeight: 500, color: 'var(--navy-300)', fontSize: 12 }}>(정확한 띠 계산)</span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="월"
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                maxLength={2}
                style={{ ...inputStyle, flex: 1, textAlign: 'center' }}
              />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="일"
                value={day}
                onChange={(e) => handleDayChange(e.target.value)}
                maxLength={2}
                style={{ ...inputStyle, flex: 1, textAlign: 'center' }}
              />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 11.5, color: 'var(--navy-300)', lineHeight: 1.55 }}>
              💡 1~2월에 태어나신 분은 음력 설 이전이면 띠가 한 해 전으로 바뀌어요.
              {needsLunarPrompt && yearNum && (
                <> 정확한 띠를 보려면 월·일을 함께 입력해주세요.</>
              )}
            </p>
          </div>
        )}

        {/* 띠 미리보기 */}
        {zodiacInfo && (
          <div
            className="animate-fade-in"
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #7c2d12 0%, #b45309 100%)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 36 }}>{zodiacInfo.animal.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>
                {zodiacInfo.animal.name}띠
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                {value.birthYear}년생
                {zodiacInfo.adjusted && ' · 음력 설 이전 출생으로 보정됨'}
              </p>
            </div>
          </div>
        )}

        {/* 성별 */}
        <div>
          <label style={labelStyle}>👤 성별</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {([['male', '남성'], ['female', '여성']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`gender-chip${value.gender === key ? ' selected' : ''}`}
                onClick={() => {
                  haptic();
                  onChange({ ...value, gender: key as Gender });
                }}
                style={{ flex: 1 }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn-primary"
          disabled={!canSubmit}
          onClick={() => {
            haptic();
            trackEvent('zodiac_submit', { animal: zodiacInfo?.animal.name ?? '' });
            onNext();
          }}
        >
          {zodiacInfo ? `${zodiacInfo.animal.emoji} ${zodiacInfo.animal.name}띠 운세 보기` : '운세 보기'} ✨
        </button>
        <button className="btn-secondary" onClick={() => { haptic(); onBack(); }}>
          ← 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--navy-600)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  fontSize: 16,
  fontWeight: 500,
  border: '1.5px solid var(--navy-100)',
  borderRadius: 12,
  background: '#fff',
  color: 'var(--navy-700)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};
