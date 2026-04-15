import { useEffect, useRef } from 'react';
import { haptic } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { Analytics } from '@apps-in-toss/web-framework';
import { getZodiacAnimal } from '../utils/zodiac';
import { PageHeader } from '../components/PageHeader';
import { useTossBanner, AD_IDS } from '../hooks/useAds';
import type { CompatInput, CompatPerson, Gender } from '../types';

type Props = {
  value: CompatInput;
  onChange: (v: CompatInput) => void;
  onNext: () => void;
  onBack: () => void;
};

function PersonForm({
  label,
  index,
  accent,
  person,
  onChange,
}: {
  label: string;
  index: number;
  accent: string;
  person: CompatPerson;
  onChange: (p: CompatPerson) => void;
}) {
  const yearNum = parseInt(person.birthYear, 10);
  const isValidYear = !isNaN(yearNum) && yearNum >= 1930 && yearNum <= 2010;
  const animal = isValidYear ? getZodiacAnimal(yearNum) : null;

  return (
    <div
      className="premium-card"
      style={{ padding: '18px 18px 20px', overflow: 'visible' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 14px' }}>
        <span
          style={{
            width: 26, height: 26, borderRadius: 999,
            background: accent,
            color: '#fff', fontSize: 13, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(15,23,42,0.18)',
            letterSpacing: 0,
          }}
        >
          {index}
        </span>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--navy-700)' }}>
          {label}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 이름 */}
        <div>
          <label style={labelStyle}>이름</label>
          <input
            type="text"
            placeholder="예: 홍길동"
            value={person.name}
            onChange={(e) => onChange({ ...person, name: e.target.value })}
            style={inputStyle}
          />
        </div>

        {/* 태어난 해 */}
        <div>
          <label style={labelStyle}>태어난 해</label>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="예: 1965"
            value={person.birthYear}
            onChange={(e) => onChange({ ...person, birthYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            maxLength={4}
            style={inputStyle}
          />
          {animal && (
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--gold-600)', fontWeight: 600 }}>
              {animal.emoji} {animal.name}띠 ({animal.element}행)
            </p>
          )}
        </div>

        {/* 성별 */}
        <div>
          <label style={labelStyle}>성별</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {([['male', '남성'], ['female', '여성']] as const).map(([key, lbl]) => (
              <button
                key={key}
                type="button"
                className={`gender-chip${person.gender === key ? ' selected' : ''}`}
                onClick={() => { haptic(); onChange({ ...person, gender: key as Gender }); }}
                style={{ flex: 1, padding: '10px 0', fontSize: 14 }}
              >
                {lbl}
              </button>
            ))}
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
    <div className="app-page" style={{ paddingBottom: 40 }}>
      <PageHeader title="궁합 보기" subtitle="두 분의 띠로 보는 궁합 풀이" emoji="💕" />

      {/* 안내 문구 */}
      <div
        className="premium-card gold-accent animate-slide-up"
        style={{ marginBottom: 24, padding: '18px 20px' }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--navy-700)', lineHeight: 1.6 }}>
          💕 우리 사이, 얼마나 잘 맞을까요?
          <br />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy-400)' }}>
            부부, 연인, 가족 누구든! 두 분의 이름과 태어난 해만 알려주세요.
          </span>
        </p>
      </div>

      {/* 두 사람 입력 */}
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PersonForm
          label="첫 번째 분"
          index={1}
          accent="linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)"
          person={value.person1}
          onChange={(p) => onChange({ ...value, person1: p })}
        />

        {/* 중간 디바이더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 8px' }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,98,0.35), transparent)' }} />
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.18em',
            color: 'var(--gold-600, #b08c47)',
          }}>
            ✦  AND  ✦
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,98,0.35), transparent)' }} />
        </div>

        <PersonForm
          label="두 번째 분"
          index={2}
          accent="linear-gradient(135deg, #b08c47 0%, #d4af6a 100%)"
          person={value.person2}
          onChange={(p) => onChange({ ...value, person2: p })}
        />
      </div>

      {/* 미리보기 */}
      {animal1 && animal2 && canSubmit && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: 20, padding: '16px 20px',
            background: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)',
            borderRadius: 14, textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
            {animal1.emoji} {animal1.name}띠 × {animal2.emoji} {animal2.name}띠
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            {animal1.element}행과 {animal2.element}행의 만남
          </p>
        </div>
      )}

      {/* 하단 버튼 */}
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn-primary"
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
          궁합 확인하기 💕
        </button>
        <button className="btn-secondary" onClick={() => { haptic(); onBack(); }}>
          ← 홈으로 돌아가기
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
        {!bannerReady && '🎯 배너 광고 영역 (테스트)'}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--navy-500)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 15,
  fontWeight: 500,
  border: '1.5px solid var(--navy-100)',
  borderRadius: 10,
  background: '#fff',
  color: 'var(--navy-700)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};
