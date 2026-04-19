import { useState, useEffect, useRef } from 'react';
import { haptic } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { Analytics } from '@apps-in-toss/web-framework';
import { SemiCircleGauge } from '../components/SemiCircleGauge';
import { ShareSheet } from '../components/ShareSheet';
import { useTossBanner, useInterstitialAd, AD_IDS } from '../hooks/useAds';
import { getZodiacAnimalByName } from '../utils/zodiac';
import type { ZodiacResult, AppFeature } from '../types';

const ZODIAC_ALL = [
  { name: '쥐', years: '00·12·24' },
  { name: '소', years: '01·13·25' },
  { name: '호랑이', years: '02·14·26' },
  { name: '토끼', years: '03·15·27' },
  { name: '용', years: '04·16·28' },
  { name: '뱀', years: '05·17·29' },
  { name: '말', years: '06·18·30' },
  { name: '양', years: '07·19·31' },
  { name: '원숭이', years: '08·20·32' },
  { name: '닭', years: '09·21·33' },
  { name: '개', years: '10·22·34' },
  { name: '돼지', years: '11·23·35' },
];

type Props = {
  result: ZodiacResult;
  userName: string;
  onRestart: () => void;
  onHome: () => void;
  onSelectFeature?: (feature: AppFeature) => void;
};

export function ZodiacResultStep({ result, userName, onRestart, onHome, onSelectFeature }: Props) {
  const [showShare, setShowShare] = useState(false);

  const { showAd: showInterstitialAd } = useInterstitialAd(AD_IDS.INTERSTITIAL);
  useEffect(() => { showInterstitialAd(); }, []);

  useEffect(() => {
    try { Analytics.impression({ log_name: 'fortune_result_view', feature: 'zodiac' }); } catch (_) { /* noop */ }
  }, []);

  const { isInitialized: bannerReady, attachBanner } = useTossBanner();
  const bannerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!bannerReady || !bannerRef.current) return;
    const attached = attachBanner(AD_IDS.BANNER, bannerRef.current, {
      theme: 'light', tone: 'blackAndWhite', variant: 'card',
    });
    return () => { attached?.destroy(); };
  }, [bannerReady, attachBanner]);

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  const animalInfo = getZodiacAnimalByName(result.animal);
  const hanjaChar = animalInfo?.hanja ?? '';

  const compatibleAnimals = (result as any).compatibleAnimals ?? [
    { name: '토끼', score: 92 },
    { name: '양', score: 86 },
    { name: '호랑이', score: 72 },
  ];

  const compatColors = ['#d1577a', '#b9623d', '#d4a84b'];

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
        <button
          onClick={() => { haptic(); onRestart(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: 'var(--navy-700)', padding: '8px 12px 8px 0',
            fontFamily: 'inherit',
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy-700)' }}>
          띠별운세
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: 'var(--navy-300)' }}>
          3/3
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--gold-500)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--gold-500)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--gold-500)' }} />
      </div>

      {/* 날짜 + 이름 */}
      <header className="animate-fade-in" style={{ marginBottom: 16 }}>
        <p style={{
          margin: '0 0 4px',
          fontSize: 12,
          fontWeight: 500,
          color: '#97a2b8',
          lineHeight: '18px',
        }}>
          {dateStr} · {userName}님
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
          {`오늘의 ${result.animal}띠,\n${result.summaryLine}`}
        </h1>
      </header>

      {/* 점수 카드 */}
      <div
        className="animate-slide-up"
        style={{
          position: 'relative',
          padding: '28px 20px 24px',
          marginBottom: 16,
          background: 'linear-gradient(180deg, #faece2 0%, #fff 70%)',
          border: '1px solid rgba(185, 98, 61, 0.18)',
          borderRadius: 22,
          boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
          overflow: 'hidden',
        }}
      >
        {/* 장식 SVG 아이콘 (우상단) */}
        <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.12 }}>
          <svg width="180" height="180" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="19" stroke="#b9623d" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="24" cy="24" r="11" stroke="#b9623d" strokeWidth="1" />
            <text x="24" y="28" textAnchor="middle" fontSize="14" fontWeight="700" fill="#b9623d">{hanjaChar}</text>
          </svg>
        </div>

        {/* 띠 라벨 */}
        <p style={{
          margin: '0 0 6px',
          fontSize: 12,
          fontWeight: 700,
          color: '#b9623d',
          letterSpacing: '0.72px',
        }}>
          {hanjaChar} · {result.animal}띠{result.element ? ` · ${result.element}` : ''}
        </p>

        {/* 큰 타이틀 */}
        <h2 style={{
          margin: '0 0 0',
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.84px',
          lineHeight: '33.6px',
          color: 'var(--navy-700)',
          whiteSpace: 'pre-line',
        }}>
          {result.primaryTitle}
        </h2>

        {/* SemiCircleGauge */}
        <div style={{ marginTop: 18 }}>
          <SemiCircleGauge score={result.score} size={160} label="오늘" />
        </div>
      </div>

      {/* 핵심 운세 + 조언 카드 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {/* 핵심 운세 */}
        <div
          className="animate-slide-up"
          style={{
            padding: '16px 18px',
            background: '#fff',
            border: '1px solid rgba(26, 39, 68, 0.08)',
            borderRadius: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 3, height: 12, background: '#b9623d', borderRadius: 100, flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--navy-700)' }}>핵심 운세</p>
          </div>
          <p style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 500,
            color: '#455578',
            lineHeight: '23.8px',
            letterSpacing: '-0.14px',
            whiteSpace: 'pre-line',
          }}>
            {result.primaryBody}
          </p>
        </div>

        {/* 조언 */}
        {result.advice && (
          <div
            className="animate-slide-up"
            style={{
              padding: '16px 18px',
              background: '#fff',
              border: '1px solid rgba(26, 39, 68, 0.08)',
              borderRadius: 16,
              animationDelay: '0.1s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 3, height: 12, background: '#b9623d', borderRadius: 100, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--navy-700)' }}>조언</p>
            </div>
            <p style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 500,
              color: '#455578',
              lineHeight: '23.8px',
              letterSpacing: '-0.14px',
              whiteSpace: 'pre-line',
            }}>
              {result.advice}
            </p>
          </div>
        )}
      </div>

      {/* 이번 주 잘 맞는 띠 */}
      <div
        className="animate-slide-up"
        style={{
          padding: '16px 18px',
          marginBottom: 16,
          background: '#fff',
          border: '1px solid rgba(26, 39, 68, 0.08)',
          borderRadius: 22,
          boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
          animationDelay: '0.15s',
        }}
      >
        <p style={{
          margin: '0 0 12px',
          fontSize: 13,
          fontWeight: 800,
          color: 'var(--navy-700)',
        }}>
          이번 주 잘 맞는 띠
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          {compatibleAnimals.slice(0, 3).map((ca: any, i: number) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: '12px 10px',
                borderRadius: 12,
                background: '#fbf6eb',
                border: '1px solid rgba(26,39,68,0.08)',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--navy-700)' }}>
                {ca.name}띠
              </p>
              <p style={{
                margin: '4px 0 0',
                fontSize: 16,
                fontWeight: 800,
                color: ca.color ?? compatColors[i],
              }}>
                {ca.score}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 12간지 한눈에 보기 */}
      <div className="animate-slide-up" style={{ marginBottom: 16, animationDelay: '0.2s' }}>
        <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: 'var(--navy-700)' }}>
          12간지 한눈에 보기
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}>
          {ZODIAC_ALL.map((z) => (
            <div
              key={z.name}
              style={{
                padding: '12px 6px',
                borderRadius: 10,
                background: '#fff',
                border: '1px solid rgba(26,39,68,0.08)',
                textAlign: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#2a3a5c',
              }}
            >
              {z.name}
              <div style={{ fontSize: 9, fontWeight: 500, color: '#2a3a5c', marginTop: 2 }}>
                {z.years}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 공유 버튼 */}
      <button
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          marginBottom: 14,
          padding: '16px 22px',
          fontSize: 16,
          fontWeight: 700,
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          cursor: 'pointer',
          fontFamily: 'inherit',
          letterSpacing: '-0.32px',
          background: 'linear-gradient(135deg, #d4a84b 0%, #b88a35 100%)',
          boxShadow: '0 6px 20px rgba(212, 168, 75, 0.22)',
        }}
        onClick={() => { haptic(); setShowShare(true); }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M13.5 6a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM4.5 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM13.5 16.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM6.44 10.24l5.13 2.77M11.56 5l-5.12 2.75"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        결과 공유하기
      </button>

      {/* 하단 배너 광고 */}
      <div
        ref={bannerRef}
        style={{
          marginTop: 8,
          minHeight: 80,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: bannerReady ? 'none' : '1.5px dashed var(--navy-200, #cbd5e1)',
          borderRadius: 12,
          background: bannerReady ? 'transparent' : 'rgba(0,0,0,0.02)',
          color: 'var(--navy-300)',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {!bannerReady && '배너 광고 영역 (테스트)'}
      </div>

      {/* 하단 CTA */}
      <div className="app-footer-cta">
        <button className="btn-primary" onClick={() => { haptic(); onRestart(); }}>
          {result.emoji} 다른 띠 보기
        </button>
        <button className="btn-secondary" onClick={() => { haptic(); onHome(); }}>
          홈으로 돌아가기
        </button>
      </div>

      {/* 공유 시트 */}
      {showShare && (
        <ShareSheet
          shareInfo={{
            title: `${userName}님의 ${result.animal}띠 운세`,
            summaryLine: result.summaryLine,
            score: result.score,
            extraLine: result.keywords?.length ? `#${result.keywords.slice(0, 3).join(' #')}` : undefined,
            serverData: {
              n: userName,
              sl: result.summaryLine,
              sc: result.score,
              bc: 'overall' as const,
              bs: result.summaryLine,
              cc: 'health' as const,
              cs: result.keywords?.slice(0, 3).join(', ') ?? '',
              lc: '', ln: 0, ld: '', li: '',
            },
          }}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
