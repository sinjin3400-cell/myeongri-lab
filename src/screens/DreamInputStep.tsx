import { useState } from 'react';
import { haptic } from '../utils/haptic';
import { NavBackButton } from '../components/NavBackButton';
import { Analytics } from '@apps-in-toss/web-framework';
import type { DreamInput, UserInfo } from '../types';

type Props = {
  value: DreamInput;
  onChange: (v: DreamInput) => void;
  onNext: () => void;
  onBack: () => void;
  hasSajuInfo: boolean;
  userInfo?: UserInfo | null;
};

const MIN_LEN = 5;
const MAX_LEN = 500;

const PLACEHOLDER_EXAMPLE = `예) 하늘을 날다가 황금빛 문을 열었는데, 문 뒤에 넓은 꽃밭이 펼쳐져 있었어요. 누군가 손을 흔들고 있었는데 잠에서 깼어요.`;

const DREAM_TAGS = ['물고기', '돼지', '조상님', '뱀', '불', '아기', '돈'];

export function DreamInputStep({ value, onChange, onNext, onBack, hasSajuInfo, userInfo }: Props) {
  const [touched, setTouched] = useState(false);

  const text = value.text;
  const trimmedLen = text.trim().length;
  const isValid = trimmedLen >= MIN_LEN;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    haptic();
    try { Analytics.click({ log_name: 'dream_submit' }); } catch (_) { /* noop */ }
    onNext();
  };

  const handleTagClick = (tag: string) => {
    haptic();
    const currentText = value.text;
    if (currentText.includes(tag)) return;
    const separator = currentText.trim().length > 0 ? ' ' : '';
    const newText = (currentText + separator + tag).slice(0, MAX_LEN);
    onChange({ ...value, text: newText });
  };

  return (
    <div className="app-page" style={{ paddingBottom: 120, background: '#fefcf9' }}>
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
          꿈해몽
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
          color: '#7c6ae2',
          letterSpacing: '0.06em',
        }}>
          간밤의 메시지
        </p>
        <h2 style={{
          margin: '0 0 12px',
          fontSize: 24,
          fontWeight: 800,
          color: 'var(--navy-700)',
          letterSpacing: '-0.84px',
          lineHeight: '30.72px',
          whiteSpace: 'pre-line',
        }}>
          {'어떤 꿈을\n꾸셨나요?'}
        </h2>
        <p style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 500,
          color: '#455578',
          lineHeight: '24.75px',
          letterSpacing: '-0.15px',
          whiteSpace: 'pre-line',
        }}>
          {'꿈의 내용을 자유롭게 적어주세요.\n전통 해몽과 심리 해석을 함께 드려요.'}
        </p>
      </div>

      {/* 꿈 내용 입력 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: '#6a7896',
          marginBottom: 6,
        }}>
          꿈 내용
        </label>
        <textarea
          value={text}
          onChange={(e) => onChange({ ...value, text: e.target.value.slice(0, MAX_LEN) })}
          placeholder={PLACEHOLDER_EXAMPLE}
          rows={7}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 14,
            background: '#fff',
            border: '1.5px solid var(--navy-700)',
            outline: 'none',
            resize: 'none',
            fontSize: 15,
            fontWeight: 500,
            lineHeight: 1.7,
            color: 'var(--navy-700)',
            fontFamily: 'inherit',
            minHeight: 160,
            boxSizing: 'border-box',
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 6,
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            color: touched && !isValid ? '#dc2626' : '#97a2b8',
          }}>
            {touched && !isValid ? `최소 ${MIN_LEN}자 이상 입력해 주세요` : '짧아도 괜찮아요. 기억나는 만큼만'}
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#97a2b8',
            fontFeatureSettings: '"tnum"',
          }}>
            {trimmedLen}자
          </span>
        </div>
      </div>

      {/* 자주 꾸는 꿈 태그 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#6a7896',
          marginBottom: 8,
        }}>
          자주 꾸는 꿈
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DREAM_TAGS.map((tag) => {
            const isSelected = text.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                style={{
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 100,
                  border: isSelected ? '1.5px solid var(--navy-700)' : '1.5px solid rgba(26,39,68,0.08)',
                  background: isSelected ? 'var(--navy-700)' : 'transparent',
                  color: isSelected ? '#fff' : '#6a7896',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 사주 연동 토글 */}
      <div
        style={{
          padding: '14px 16px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderRadius: 16,
          background: '#fff',
          border: '1px solid rgba(26,39,68,0.08)',
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 800, color: 'var(--navy-700)' }}>
            내 사주와 연결해 풀이
          </p>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: '#97a2b8', lineHeight: 1.5 }}>
            {hasSajuInfo
              ? `${userInfo?.name || ''}님의 사주 입력 정보가 있을 때 더 정확해요`
              : '사주 입력 정보가 있을 때 더 정확해요'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!hasSajuInfo) return;
            haptic();
            onChange({ ...value, useSaju: !value.useSaju });
          }}
          aria-label="사주 결합 토글"
          style={{
            width: 44,
            height: 26,
            borderRadius: 100,
            border: 'none',
            background: value.useSaju && hasSajuInfo ? '#7c6ae2' : 'rgba(0,0,0,0.15)',
            position: 'relative',
            cursor: hasSajuInfo ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
            opacity: hasSajuInfo ? 1 : 0.5,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: value.useSaju && hasSajuInfo ? 20 : 2,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          />
        </button>
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
          cursor: isValid ? 'pointer' : 'default',
          fontFamily: 'inherit',
          letterSpacing: '-0.32px',
          background: isValid ? '#2a1f5e' : 'var(--navy-100)',
          opacity: isValid ? 1 : 0.5,
          transition: 'all 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
        disabled={!isValid}
        onClick={handleSubmit}
      >
        꿈 풀어보기 <span style={{ color: '#c9bdff' }}>&rarr;</span>
      </button>
    </div>
  );
}
