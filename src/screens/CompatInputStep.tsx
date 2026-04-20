import { useEffect, useRef } from 'react';
import { haptic } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { NavBackButton } from '../components/NavBackButton';
import { Analytics } from '@apps-in-toss/web-framework';
import { getZodiacAnimal } from '../utils/zodiac';
import { useTossBanner, AD_IDS } from '../hooks/useAds';
import type { CompatInput, CompatPerson, Gender } from '../types';

type Props = {
  value: CompatInput;
  onChange: (v: CompatInput) => void;
  onNext: () => void;
  onBack: () => void;
};

function digitsOnly(s: string) { return s.replace(/\D/g, ''); }

function formatEightDigits(d: string): string {
  if (d.length <= 4) return d;
  if (d.length <= 6) return d.slice(0, 4) + '.' + d.slice(4);
  return d.slice(0, 4) + '.' + d.slice(4, 6) + '.' + d.slice(6, 8);
}

function getBirthDisplay(p: CompatPerson): string {
  const d = (p.birthYear || '') + (p.birthMonth || '') + (p.birthDay || '');
  return formatEightDigits(digitsOnly(d));
}

function handleBirthInput(raw: string, person: CompatPerson): CompatPerson {
  const d = digitsOnly(raw).slice(0, 8);
  return {
    ...person,
    birthYear: d.slice(0, 4),
    birthMonth: d.slice(4, 6) || undefined,
    birthDay: d.slice(6, 8) || undefined,
  };
}

function PersonForm({
  tag,
  tagLabel,
  circleLabel,
  circleBg,
  circleColor,
  tagColor,
  person,
  onChange,
}: {
  tag: string;
  tagLabel: string;
  circleLabel: string;
  circleBg: string;
  circleColor: string;
  tagColor: string;
  person: CompatPerson;
  onChange: (p: CompatPerson) => void;
}) {
  const yearNum = parseInt(person.birthYear, 10);
  const isValidYear = !isNaN(yearNum) && yearNum >= 1930 && yearNum <= 2010;
  const animal = isValidYear ? getZodiacAnimal(yearNum) : null;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 22,
      padding: 18,
      border: '1px solid rgba(26,39,68,0.08)',
      boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 100,
          background: circleBg, color: circleColor,
          fontSize: 20, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {circleLabel}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{
            margin: 0, fontSize: 11, fontWeight: 700,
            color: tagColor, letterSpacing: '0.06em',
          }}>
            {tag}
          </p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--navy-700)' }}>
            {tagLabel}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>이름</label>
          <input
            type="text"
            placeholder="이름을 알려주세요"
            value={person.name}
            onChange={(e) => onChange({ ...person, name: e.target.value })}
            style={underlineInputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>생년월일</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="1995.03.15"
            value={getBirthDisplay(person)}
            onChange={(e) => onChange(handleBirthInput(e.target.value, person))}
            style={{ ...underlineInputStyle, letterSpacing: '0.02em' }}
          />
          {animal && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#b88a35', fontWeight: 600 }}>
              {animal.emoji} {animal.name}띠 ({animal.element}행)
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>성별</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {([['female', '여성'], ['male', '남성']] as const).map(([key, lbl]) => {
              const selected = person.gender === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { haptic(); onChange({ ...person, gender: key as Gender }); }}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 14,
                    border: selected ? '1.5px solid var(--navy-700)' : '1.5px solid rgba(26,39,68,0.08)',
                    background: selected ? 'var(--navy-700)' : '#fff',
                    color: selected ? '#fff' : '#455578',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompatInputStep({ value, onChange, onNext, onBack }: Props) {
  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const bannerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!bannerReady || !bannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bannerRef.current, {
      theme: 'light', tone: 'blackAndWhite', variant: 'card',
    });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner]);

  const isValid = (p: CompatPerson) => {
    const y = parseInt(p.birthYear, 10);
    return p.name.trim().length >= 1 && !isNaN(y) && y >= 1930 && y <= 2010 && p.gender !== '';
  };
  const canSubmit = isValid(value.person1) && isValid(value.person2);

  const y1 = parseInt(value.person1.birthYear, 10);
  const y2 = parseInt(value.person2.birthYear, 10);
  const animal1 = !isNaN(y1) && y1 >= 1930 ? getZodiacAnimal(y1) : null;
  const animal2 = !isNaN(y2) && y2 >= 1930 ? getZodiacAnimal(y2) : null;

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
          궁합보기
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
      <div style={{ marginBottom: 20 }}>
        <p style={{
          margin: '0 0 8px',
          fontSize: 13,
          fontWeight: 700,
          color: '#d1577a',
          letterSpacing: '0.78px',
        }}>
          두 사람의 기운
        </p>
        <h1 style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 800,
          color: 'var(--navy-700)',
          letterSpacing: '-0.84px',
          lineHeight: '30.72px',
          whiteSpace: 'pre-line',
        }}>
          {'우리 사이\n얼마나 잘 맞을까요?'}
        </h1>
      </div>

      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ marginBottom: 12 }}>
          <PersonForm
            tag="FIRST"
            tagLabel="내 정보"
            circleLabel="나"
            circleBg="#eef1f7"
            circleColor="#2a3a5c"
            tagColor="#b88a35"
            person={value.person1}
            onChange={(p) => onChange({ ...value, person1: p })}
          />
        </div>

        {/* 하트 디바이더 */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          marginBottom: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 100,
            background: '#fbe8ed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 15.75s-6.75-4.5-6.75-8.25a3.375 3.375 0 0 1 6.75-1.5 3.375 3.375 0 0 1 6.75 1.5c0 3.75-6.75 8.25-6.75 8.25z" fill="#d1577a"/>
            </svg>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <PersonForm
            tag="SECOND"
            tagLabel="상대방 정보"
            circleLabel="너"
            circleBg="#fbe8ed"
            circleColor="#d1577a"
            tagColor="#d1577a"
            person={value.person2}
            onChange={(p) => onChange({ ...value, person2: p })}
          />
        </div>
      </div>

      {/* CTA */}
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
          background: canSubmit ? 'var(--navy-700)' : 'var(--navy-100)',
          opacity: canSubmit ? 1 : 0.5,
          transition: 'all 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        disabled={!canSubmit}
        onClick={() => {
          haptic();
          trackEvent('compat_submit', {
            animal1: animal1?.name ?? '', animal2: animal2?.name ?? '',
          });
          try { Analytics.click({ log_name: 'compat_submit' }); } catch (_) { /* noop */ }
          onNext();
        }}
      >
        궁합 분석하기 <span style={{ color: '#e0be70' }}>&rarr;</span>
      </button>

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
        {!bannerReady && '배너 광고 영역'}
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

const underlineInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 0',
  fontSize: 21,
  fontWeight: 700,
  border: 'none',
  borderBottom: '2px solid var(--navy-100)',
  borderRadius: 0,
  background: 'transparent',
  color: 'var(--navy-700)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  letterSpacing: '-0.01em',
  transition: 'border-color 0.2s',
};
