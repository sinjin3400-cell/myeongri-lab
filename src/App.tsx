import { useCallback, useEffect, useRef, useState } from 'react';
import { haptic } from './utils/haptic';
import {
  trackStepView, trackFormSubmit, trackMbtiSelected, trackMbtiSkipped,
  trackAnalysisStart, trackAnalysisComplete, trackAnalysisError,
  trackPeriodChanged, trackTomorrowClicked, trackRestart,
  setUserProperties, trackEvent,
} from './utils/analytics';
import type { FortuneResult, FortuneHighlight, FortuneCategory, FortunePeriod, Step, UserInfo, ZodiacInput, ZodiacResult, CompatInput, CompatResult, DreamInput, DreamResult } from './types';
import type { MbtiType } from './api';
import { requestFortuneHighlight, requestFortuneFull, requestZodiacFortune, requestCompatibility, requestDreamInterpretation } from './api';
import { HomeScreen } from './screens/HomeScreen';
import { InfoStep } from './screens/InfoStep';
import { MbtiStep } from './screens/MbtiStep';
import { LoadingStep } from './screens/LoadingStep';
import { ResultStep } from './screens/ResultStep';
import { ZodiacInputStep } from './screens/ZodiacInputStep';
import { ZodiacResultStep } from './screens/ZodiacResultStep';
import { CompatInputStep } from './screens/CompatInputStep';
import { CompatResultStep } from './screens/CompatResultStep';
import { DreamInputStep } from './screens/DreamInputStep';
import { DreamResultStep } from './screens/DreamResultStep';
import { SimpleLoadingStep } from './screens/SimpleLoadingStep';
import { SharedResultView } from './screens/SharedResultView';
import { decodeShareData, decodeShareDataCompact, sharedDataToHighlight } from './utils/shareUrl';
import type { SharedFortuneData, FortuneTexts } from './utils/shareUrl';

/** URL에서 공유 데이터 동기 확인 (base64 인코딩된 경우) */
function getSharedDataSync(): { userName: string; highlight: FortuneHighlight; texts: FortuneTexts } | null {
  const encoded = getShareSlug();
  if (!encoded) return null;
  // 짧은 ID(6자, API 조회 필요)는 여기서 처리하지 않음
  if (encoded.length <= 8) return null;
  const data = decodeShareData(encoded) || decodeShareDataCompact(encoded);
  if (!data) return null;
  return sharedDataToHighlight(data);
}

/** URL 경로에서 /s/xxx 슬러그 추출 */
function getShareSlug(): string | null {
  const pathMatch = window.location.pathname.match(/^\/s\/(.+)$/);
  if (pathMatch) return pathMatch[1];
  const params = new URLSearchParams(window.location.search);
  const qs = params.get('s');
  if (qs) return qs;
  const hash = window.location.hash;
  if (hash.startsWith('#s=')) return hash.slice(3);
  return null;
}

/** 짧은 공유 ID를 API에서 조회 */
async function fetchSharedData(id: string): Promise<{ userName: string; highlight: FortuneHighlight; texts: FortuneTexts } | null> {
  try {
    const apiBase = import.meta.env.VITE_API_BASE || '';
    const res = await fetch(`${apiBase}/api/share?id=${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const data: SharedFortuneData = await res.json();
    if (!data || !data.n) return null;
    return sharedDataToHighlight(data);
  } catch {
    return null;
  }
}

const initialInfo: UserInfo = {
  name: '',
  birthDate: '',
  gender: '',
  birthSijin: null,
  birthTimeUnknown: false,
};

export default function App() {
  const [sharedView, setSharedView] = useState(() => getSharedDataSync());
  // share slug가 있으면 초기부터 로딩 상태 (홈 화면 깜빡임 방지)
  const [sharedLoading, setSharedLoading] = useState(() => {
    const slug = getShareSlug();
    return !!slug && slug.length <= 8 && !getSharedDataSync();
  });
  const [sharedExpired, setSharedExpired] = useState(false);

  // 짧은 공유 ID(서버 저장)인 경우 비동기로 조회
  useEffect(() => {
    const slug = getShareSlug();
    if (!slug || slug.length > 8) return; // base64는 이미 동기 처리됨
    setSharedLoading(true);
    fetchSharedData(slug)
      .then((result) => {
        if (result) {
          setSharedView(result);
        } else {
          setSharedExpired(true);
        }
      })
      .catch(() => setSharedExpired(true))
      .finally(() => setSharedLoading(false));
  }, []);
  const [step, setStep] = useState<Step>('home');
  const [info, setInfo] = useState<UserInfo>(initialInfo);
  const [mbti, setMbti] = useState<MbtiType | null>(null);
  const [highlight, setHighlight] = useState<FortuneHighlight | null>(null);
  const [fullResult, setFullResult] = useState<FortuneResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [period, setPeriod] = useState<FortunePeriod>('today');

  // 띠별운세 상태
  const [zodiacInput, setZodiacInput] = useState<ZodiacInput>({ name: '', birthYear: '', gender: '' });
  const [zodiacResult, setZodiacResult] = useState<ZodiacResult | null>(null);

  // 궁합보기 상태
  const [compatInput, setCompatInput] = useState<CompatInput>({
    person1: { name: '', birthYear: '', gender: '' },
    person2: { name: '', birthYear: '', gender: '' },
  });
  const [compatResult, setCompatResult] = useState<CompatResult | null>(null);

  // 꿈해몽 상태
  const [dreamInput, setDreamInput] = useState<DreamInput>({ text: '', useSaju: true });
  const [dreamResult, setDreamResult] = useState<DreamResult | null>(null);

  const goNextFromInfo = useCallback(() => {
    haptic();
    trackFormSubmit(info.gender, !!info.birthSijin || info.birthTimeUnknown);
    trackStepView('mbti');
    setStep('mbti');
  }, [info.gender, info.birthSijin, info.birthTimeUnknown]);

  const goNextFromMbti = useCallback(() => {
    haptic();
    setLoadError(null);
    if (mbti) {
      trackMbtiSelected(mbti);
      setUserProperties({ has_mbti: true, mbti_type: mbti });
    }
    trackStepView('loading');
    setStep('loading');
  }, [mbti]);

  const skipMbti = useCallback(() => {
    setMbti(null);
    trackMbtiSkipped();
    setUserProperties({ has_mbti: false });
    goNextFromMbti();
  }, [goNextFromMbti]);

  // 프리페치된 전체 운세를 캐시 (상태 변경 없이 저장만)
  const prefetchedRef = useRef<FortuneResult | null>(null);

  // 1단계: 하이라이트 로딩 + 전체 운세 백그라운드 프리페치
  const runAnalysis = useCallback(async () => {
    const startTime = Date.now();
    trackAnalysisStart(period, !!mbti);
    try {
      const data = await requestFortuneHighlight(info, mbti, period);
      trackAnalysisComplete(period, data.score, Date.now() - startTime);
      setHighlight(data);
      setFullResult(null);
      prefetchedRef.current = null;
      trackStepView('result');
      setStep('result');
      haptic();
      // 나머지 2개 운세만 백그라운드에서 미리 로딩 (상태는 변경하지 않음)
      const exclude: FortuneCategory[] = [data.bestCategory, data.cautionCategory];
      requestFortuneFull(info, mbti, period, exclude)
        .then((full) => { prefetchedRef.current = full; })
        .catch(() => {});
    } catch (e) {
      const msg = e instanceof Error ? e.message : '분석에 실패했어요. 다시 시도해주세요.';
      trackAnalysisError(msg);
      setLoadError(msg);
      setStep('error');
    }
  }, [info, mbti, period]);

  // 2단계: 나머지 운세 로딩 (프리페치 완료됐으면 즉시 사용)
  const loadFullResult = useCallback(async () => {
    try {
      if (prefetchedRef.current) {
        setFullResult(prefetchedRef.current);
        haptic();
        return;
      }
      const exclude: FortuneCategory[] = highlight
        ? [highlight.bestCategory, highlight.cautionCategory]
        : [];
      const data = await requestFortuneFull(info, mbti, period, exclude);
      setFullResult(data);
      haptic();
    } catch {
      // 전체 로딩 실패해도 하이라이트는 유지
    }
  }, [info, mbti, period, highlight]);

  const handleChangePeriod = useCallback(
    (newPeriod: FortunePeriod) => {
      if (newPeriod === period) return;
      trackPeriodChanged(period, newPeriod);
      setPeriod(newPeriod);
      setHighlight(null);
      setFullResult(null);
      setLoadError(null);
      setStep('loading');
    },
    [period]
  );

  const handleTomorrow = useCallback(() => {
    haptic();
    trackTomorrowClicked();
    setPeriod('tomorrow');
    setHighlight(null);
    setFullResult(null);
    prefetchedRef.current = null;
    setLoadError(null);
    setStep('loading');
  }, []);

  const restart = useCallback(() => {
    haptic();
    trackRestart();
    trackStepView('home');
    setInfo(initialInfo);
    setMbti(null);
    setHighlight(null);
    setFullResult(null);
    setLoadError(null);
    setPeriod('today');
    setZodiacInput({ name: '', birthYear: '', gender: '' });
    setZodiacResult(null);
    setCompatInput({ person1: { name: '', birthYear: '', gender: '' }, person2: { name: '', birthYear: '', gender: '' } });
    setCompatResult(null);
    setDreamInput({ text: '', useSaju: true });
    setDreamResult(null);
    setStep('home');
  }, []);

  const handleFeatureSelect = useCallback((feature: string) => {
    if (feature === 'fortune') {
      trackStepView('info');
      setStep('info');
    } else if (feature === 'zodiac') {
      trackStepView('zodiac-input');
      setStep('zodiac-input');
    } else if (feature === 'compatibility') {
      trackStepView('compat-input');
      setStep('compat-input');
    } else if (feature === 'dream') {
      trackStepView('dream-input');
      setStep('dream-input');
    }
  }, []);

  // --- 띠별운세 ---
  const runZodiac = useCallback(async () => {
    trackEvent('zodiac_analysis_start', {});
    try {
      const data = await requestZodiacFortune(zodiacInput);
      setZodiacResult(data);
      trackEvent('zodiac_analysis_complete', { animal: data.animal, score: data.score });
      setStep('zodiac-result');
      haptic();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '분석에 실패했어요.';
      trackEvent('zodiac_analysis_error', { error: msg });
      setLoadError(msg);
      setStep('error');
    }
  }, [zodiacInput]);

  // --- 꿈해몽 ---
  const runDream = useCallback(async () => {
    trackEvent('dream_analysis_start', { useSaju: dreamInput.useSaju, length: dreamInput.text.length });
    try {
      const data = await requestDreamInterpretation(dreamInput, info);
      setDreamResult(data);
      trackEvent('dream_analysis_complete', { type: data.type, sajuLinked: data.sajuLinked });
      setStep('dream-result');
      haptic();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '꿈 해석에 실패했어요.';
      trackEvent('dream_analysis_error', { error: msg });
      setLoadError(msg);
      setStep('error');
    }
  }, [dreamInput, info]);

  // --- 궁합보기 ---
  const runCompat = useCallback(async () => {
    trackEvent('compat_analysis_start', {});
    try {
      const data = await requestCompatibility(compatInput);
      setCompatResult(data);
      trackEvent('compat_analysis_complete', { score: data.score });
      setStep('compat-result');
      haptic();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '분석에 실패했어요.';
      trackEvent('compat_analysis_error', { error: msg });
      setLoadError(msg);
      setStep('error');
    }
  }, [compatInput]);

  const dismissShared = useCallback(() => {
    setSharedView(null);
    // URL을 루트로 정리 (공유 경로 제거)
    window.history.replaceState({}, '', '/');
  }, []);

  // 공유 데이터 로딩 중
  if (sharedLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: 16, background: 'var(--bg-cream, #FFFDF5)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e0d5', borderTopColor: '#c9a962', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 15, color: '#8c8577' }}>운세 결과를 불러오는 중...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 공유 데이터 만료/없음
  if (sharedExpired) {
    return (
      <div className="app-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80dvh', textAlign: 'center', gap: 16 }}>
        <span style={{ fontSize: 48 }}>⏳</span>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--navy-700)' }}>
          공유된 운세가 만료되었어요
        </h2>
        <p style={{ margin: 0, fontSize: 15, color: 'var(--navy-400)', lineHeight: 1.6 }}>
          공유 운세는 24시간 동안만 볼 수 있어요.
          <br />나만의 운세를 확인해보세요!
        </p>
        <button className="btn-primary" onClick={() => { setSharedExpired(false); window.history.replaceState({}, '', '/'); }} style={{ marginTop: 8 }}>
          나만의 운세 보러가기 ✨
        </button>
      </div>
    );
  }

  if (sharedView) {
    return (
      <SharedResultView
        userName={sharedView.userName}
        highlight={sharedView.highlight}
        texts={sharedView.texts}
        onTryOwn={dismissShared}
      />
    );
  }

  return (
    <>
      {step === 'home' && (
        <HomeScreen onSelect={handleFeatureSelect} />
      )}
      {step === 'info' && (
        <InfoStep value={info} onChange={setInfo} onNext={goNextFromInfo} onHome={restart} />
      )}
      {step === 'mbti' && (
        <MbtiStep
          selected={mbti}
          onSelect={setMbti}
          onSkip={skipMbti}
          onConfirm={goNextFromMbti}
          errorMessage={loadError}
        />
      )}
      {step === 'loading' && <LoadingStep onRun={runAnalysis} />}
      {step === 'error' && (
        <div className="app-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80dvh', textAlign: 'center', gap: 16 }}>
          <span style={{ fontSize: 48 }}>😥</span>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--navy-700)' }}>
            분석에 실패했어요
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--navy-400)', lineHeight: 1.6 }}>
            {loadError || '일시적인 오류가 발생했어요.'}
            <br />잠시 후 다시 시도해주세요.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300, marginTop: 8 }}>
            <button className="btn-primary" onClick={() => { setLoadError(null); setStep('loading'); }}>
              다시 시도하기 🔄
            </button>
            <button className="btn-secondary" onClick={restart}>
              처음부터 다시 하기
            </button>
          </div>
        </div>
      )}
      {step === 'result' && highlight && (
        <ResultStep
          highlight={highlight}
          fullResult={fullResult}
          onLoadFull={loadFullResult}
          userName={info.name}
          mbti={mbti}
          period={period}
          onChangePeriod={handleChangePeriod}
          onRestart={restart}
          onTomorrow={handleTomorrow}
          onGoDream={() => {
            // info를 유지한 채로 꿈해몽으로 이동 → 사주 결합 모드 자동 활성
            trackStepView('dream-input');
            setDreamInput({ text: '', useSaju: true });
            setStep('dream-input');
          }}
        />
      )}

      {/* 띠별운세 */}
      {step === 'zodiac-input' && (
        <ZodiacInputStep
          value={zodiacInput}
          onChange={setZodiacInput}
          onNext={() => { setLoadError(null); setStep('zodiac-loading'); }}
          onBack={restart}
        />
      )}
      {step === 'zodiac-loading' && (
        <SimpleLoadingStep
          title="띠별 운세 분석 중..."
          messages={[
            '🐲 12간지의 기운을 살피고 있어요',
            '🌟 오늘의 일진과 띠의 궁합을 보고 있어요',
            '🍀 행운의 기운을 찾고 있어요',
            '✨ 운세를 정리하고 있어요',
            '📝 따뜻한 조언을 준비하고 있어요',
          ]}
          onRun={runZodiac}
        />
      )}
      {step === 'zodiac-result' && zodiacResult && (
        <ZodiacResultStep
          result={zodiacResult}
          userName={zodiacInput.name}
          onRestart={() => { setZodiacResult(null); setStep('zodiac-input'); }}
          onHome={restart}
          onSelectFeature={(feature) => {
            setZodiacResult(null);
            handleFeatureSelect(feature);
          }}
        />
      )}

      {/* 궁합보기 */}
      {step === 'compat-input' && (
        <CompatInputStep
          value={compatInput}
          onChange={setCompatInput}
          onNext={() => { setLoadError(null); setStep('compat-loading'); }}
          onBack={restart}
        />
      )}
      {step === 'compat-loading' && (
        <SimpleLoadingStep
          title="궁합 분석 중..."
          messages={[
            '💕 두 분의 띠를 살펴보고 있어요',
            '🔮 오행의 상생 관계를 분석 중이에요',
            '🌟 애정 궁합을 풀어보고 있어요',
            '💰 재물 궁합도 확인하고 있어요',
            '💬 소통 스타일을 비교하고 있어요',
            '✨ 따뜻한 조언을 준비하고 있어요',
          ]}
          onRun={runCompat}
        />
      )}
      {/* 꿈해몽 */}
      {step === 'dream-input' && (
        <DreamInputStep
          value={dreamInput}
          onChange={setDreamInput}
          onNext={() => { setLoadError(null); setStep('dream-loading'); }}
          onBack={restart}
          hasSajuInfo={!!(info.name && info.birthDate)}
          userInfo={info}
        />
      )}
      {step === 'dream-loading' && (
        <SimpleLoadingStep
          title="꿈을 풀이하고 있어요..."
          messages={[
            '🌙 꿈 속 상징을 살펴보고 있어요',
            '📖 한국 전통 해몽 사전을 펼치고 있어요',
            '✨ 사주 정보가 있으면 더 정확해져요',
            '🔮 숨겨진 운세까지 보면 일주의 깊은 의미가 더해져요',
            '🔑 꿈 속 키워드를 뽑고 있어요',
            '🎰 행운의 번호를 정리하고 있어요',
          ]}
          onRun={runDream}
        />
      )}
      {step === 'dream-result' && dreamResult && (
        <DreamResultStep
          result={dreamResult}
          userName={info.name || undefined}
          onRestart={() => { setDreamResult(null); setStep('dream-input'); }}
          onHome={restart}
          onGoFortune={() => {
            setDreamResult(null);
            handleFeatureSelect('fortune');
          }}
        />
      )}

      {step === 'compat-result' && compatResult && (
        <CompatResultStep
          result={compatResult}
          onRestart={() => { setCompatResult(null); setStep('compat-input'); }}
          onHome={restart}
          onSelectFeature={(feature) => {
            setCompatResult(null);
            handleFeatureSelect(feature);
          }}
        />
      )}
    </>
  );
}
