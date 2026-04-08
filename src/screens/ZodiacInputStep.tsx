import { useState } from 'react';
import { haptic } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { ZODIAC_ANIMALS, getRepresentativeYear, getZodiacYears } from '../utils/zodiac';
import { LogoMark } from '../components/LogoMark';
import type { ZodiacInput, Gender } from '../types';

type Props = {
  value: ZodiacInput;
  onChange: (v: ZodiacInput) => void;
  onNext: () => void;
  onBack: () => void;
};

export function ZodiacInputStep({ value, onChange, onNext, onBack }: Props) {
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(() => {
    if (!value.birthYear) return null;
    const y = parseInt(value.birthYear, 10);
    if (isNaN(y)) return null;
    const idx = ((y - 4) % 12 + 12) % 12;
    return ZODIAC_ANIMALS[idx]?.name ?? null;
  });

  const canSubmit = value.name.trim().length >= 1 && selectedAnimal !== null && value.gender !== '';

  const handleAnimalSelect = (animalName: string) => {
    haptic();
    setSelectedAnimal(animalName);
    onChange({ ...value, birthYear: String(getRepresentativeYear(animalName)) });
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
        style={{ marginBottom: 24, padding: '18px 20px' }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--navy-700)', lineHeight: 1.6 }}>
          🐲 내 띠를 선택해주세요!
          <br />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy-400)' }}>
            12간지 중 본인의 띠를 골라주시면 오늘의 운세를 풀어드릴게요.
          </span>
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
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

        {/* 띠 그리드 */}
        <div>
          <label style={labelStyle}>🐯 내 띠 선택</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
            }}
          >
            {ZODIAC_ANIMALS.map((animal) => {
              const isSelected = selectedAnimal === animal.name;
              const years = getZodiacYears(animal.name, 4);
              return (
                <button
                  key={animal.name}
                  type="button"
                  onClick={() => handleAnimalSelect(animal.name)}
                  style={{
                    padding: '14px 8px',
                    borderRadius: 14,
                    border: isSelected ? '2px solid var(--gold-500)' : '1.5px solid var(--navy-100)',
                    background: isSelected
                      ? 'linear-gradient(135deg, #7c2d12 0%, #b45309 100%)'
                      : '#fff',
                    color: isSelected ? '#fff' : 'var(--navy-700)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(180,83,9,0.25)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{animal.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{animal.name}띠</span>
                  <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.75, lineHeight: 1.3 }}>
                    {years.join(', ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

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
            trackEvent('zodiac_submit', { animal: selectedAnimal ?? '' });
            onNext();
          }}
        >
          {selectedAnimal ? `${ZODIAC_ANIMALS.find(a => a.name === selectedAnimal)?.emoji} ${selectedAnimal}띠 운세 보기` : '운세 보기'} ✨
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
