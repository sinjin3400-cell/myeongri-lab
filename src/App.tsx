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
import { HomeScreen, saveLastUserName } from './screens/HomeScreen';
import { IAPScreen } from './screens/IAPScreen';
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
import { loadUserProfile, partsToDotted, saveUserProfile, dottedToParts } from './utils/userProfile';
import { AutofillSheet } from './components/AutofillSheet';

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

const EMPTY_INFO: UserInfo = {
  name: '',
  birthDate: '',
  gender: '',
  birthSijin: null,
  birthTimeUnknown: false,
};

const EMPTY_ZODIAC: ZodiacInput = { name: '', birthYear: '', gender: '' };

const EMPTY_COMPAT: CompatInput = {
  person1: { name: '', birthYear: '', gender: '' },
  person2: { name: '', birthYear: '', gender: '' },
};

const AUTOFILL_KEY = 'myeongri_autofill_session';

function readAutofillDecision(): 'accepted' | 'declined' | null {
  try {
    const v = sessionStorage.getItem(AUTOFILL_KEY);
    return v === 'accepted' || v === 'declined' ? v : null;
  } catch { return null; }
}

function writeAutofillDecision(v: 'accepted' | 'declined') {
  try { sessionStorage.setItem(AUTOFILL_KEY, v); } catch { /* noop */ }
}

function isProfileComplete(p: { name?: string; birthYear?: string } | null): boolean {
  return !!(p && p.name && p.birthYear && p.birthYear.length === 4);
}

function profileToInfo(saved: ReturnType<typeof loadUserProfile>): UserInfo {
  if (!saved) return EMPTY_INFO;
  return {
    ...EMPTY_INFO,
    name: saved.name,
    birthDate: partsToDotted(saved.birthYear, saved.birthMonth, saved.birthDay),
    gender: saved.gender,
    calendarType: saved.calendarType,
    birthSijin: saved.birthSijin ?? null,
    birthTimeUnknown: saved.birthTimeUnknown ?? false,
  };
}

function profileToZodiac(saved: ReturnType<typeof loadUserProfile>): ZodiacInput {
  if (!saved) return EMPTY_ZODIAC;
  return {
    name: saved.name,
    birthYear: saved.birthYear,
    birthMonth: saved.birthMonth || undefined,
    birthDay: saved.birthDay || undefined,
    gender: saved.gender,
    calendarType: saved.calendarType,
  };
}

function profileToCompat(saved: ReturnType<typeof loadUserProfile>): CompatInput {
  if (!saved) return EMPTY_COMPAT;
  return {
    person1: {
      name: saved.name,
      birthYear: saved.birthYear,
      birthMonth: saved.birthMonth || undefined,
      birthDay: saved.birthDay || undefined,
      gender: saved.gender,
    },
    person2: { name: '', birthYear: '', gender: '' },
  };
}

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
  const [info, setInfo] = useState<UserInfo>(() => {
    return readAutofillDecision() === 'accepted' ? profileToInfo(loadUserProfile()) : EMPTY_INFO;
  });
  const [mbti, setMbti] = useState<MbtiType | null>(null);
  const [highlight, setHighlight] = useState<FortuneHighlight | null>(null);
  const [fullResult, setFullResult] = useState<FortuneResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [period, setPeriod] = useState<FortunePeriod>('today');

  // 띠별운세 상태
  const [zodiacInput, setZodiacInput] = useState<ZodiacInput>(() => {
    return readAutofillDecision() === 'accepted' ? profileToZodiac(loadUserProfile()) : EMPTY_ZODIAC;
  });
  const [zodiacResult, setZodiacResult] = useState<ZodiacResult | null>(null);

  // 궁합보기 상태
  const [compatInput, setCompatInput] = useState<CompatInput>(() => {
    return readAutofillDecision() === 'accepted' ? profileToCompat(loadUserProfile()) : EMPTY_COMPAT;
  });
  const [compatResult, setCompatResult] = useState<CompatResult | null>(null);

  // 꿈해몽 상태
  const [dreamInput, setDreamInput] = useState<DreamInput>({ text: '', useSaju: true });
  const [dreamResult, setDreamResult] = useState<DreamResult | null>(null);

  // 자동 채움 시트
  const [autofillOpen, setAutofillOpen] = useState(false);
  const [autofillProfile, setAutofillProfile] = useState<ReturnType<typeof loadUserProfile>>(null);

  useEffect(() => {
    if (step !== 'info' && step !== 'zodiac-input' && step !== 'compat-input') {
      setAutofillOpen(false);
      return;
    }
    if (readAutofillDecision() !== null) return; // 이미 이번 세션에서 결정함
    const saved = loadUserProfile();
    if (!isProfileComplete(saved)) return;

    let formIsEmpty = false;
    if (step === 'info') formIsEmpty = !info.name && !info.birthDate;
    else if (step === 'zodiac-input') formIsEmpty = !zodiacInput.name && !zodiacInput.birthYear;
    else if (step === 'compat-input') {
      formIsEmpty = !compatInput.person1.name && !compatInput.person1.birthYear;
    }
    if (!formIsEmpty) return;

    setAutofillProfile(saved);
    setAutofillOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleAutofillAccept = useCallback(() => {
    const saved = autofillProfile;
    writeAutofillDecision('accepted');
    if (saved) {
      // 현재 폼 + 다른 폼들도 함께 채움 (사용자가 "내 정보 맞다"고 했으므로)
      setInfo(profileToInfo(saved));
      setZodiacInput(profileToZodiac(saved));
      setCompatInput((prev) => ({
        person1: profileToCompat(saved).person1,
        person2: prev.person2,
      }));
    }
    setAutofillOpen(false);
    trackEvent('autofill_accept', { step });
  }, [autofillProfile, step]);

  const handleAutofillDecline = useCallback(() => {
    writeAutofillDecision('declined');
    setAutofillOpen(false);
    trackEvent('autofill_decline', { step });
  }, [step]);

  const goNextFromInfo = useCallback(() => {
    haptic();
    if (info.name) saveLastUserName(info.name);
    const { y, m, d } = dottedToParts(info.birthDate);
    saveUserProfile({
      name: info.name,
      birthYear: y, birthMonth: m, birthDay: d,
      gender: info.gender,
      calendarType: info.calendarType,
      birthSijin: info.birthSijin,
      birthTimeUnknown: info.birthTimeUnknown,
    });
    trackFormSubmit(info.gender, !!info.birthSijin || info.birthTimeUnknown);
    trackStepView('mbti');
    setStep('mbti');
  }, [info.name, info.gender, info.birthSijin, info.birthTimeUnknown, info.birthDate, info.calendarType]);

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
    const decision = readAutofillDecision();
    const saved = loadUserProfile();
    const fill = decision === 'accepted';
    setInfo(fill ? profileToInfo(saved) : EMPTY_INFO);
    setMbti(null);
    setHighlight(null);
    setFullResult(null);
    setLoadError(null);
    setPeriod('today');
    setZodiacInput(fill ? profileToZodiac(saved) : EMPTY_ZODIAC);
    setZodiacResult(null);
    setCompatInput(fill ? profileToCompat(saved) : EMPTY_COMPAT);
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
        <HomeScreen onSelect={handleFeatureSelect} onIAP={() => setStep('iap')} />
      )}
      {step === 'iap' && (
        <IAPScreen onBack={restart} />
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
          onBack={() => { haptic(); setStep('info'); }}
          errorMessage={loadError}
        />
      )}
      {step === 'loading' && <LoadingStep onRun={runAnalysis} />}
      {step === 'error' && (
        <div className="app-page" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100dvh', textAlign: 'center',
          background: 'var(--cream-50)',
        }}>
          {/* 아이콘 원 */}
          <div style={{
            width: 96, height: 96, borderRadius: 100,
            background: 'var(--cream-100)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
            border: '1px solid rgba(212, 168, 75, 0.2)',
          }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="18" stroke="#d4a84b" strokeWidth="1.8" />
              <path d="M22 14v9M22 29v.5" stroke="#d4a84b" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <h2 style={{
            margin: '0 0 10px', fontSize: 24, fontWeight: 800,
            color: 'var(--navy-700)', lineHeight: '30.72px',
            letterSpacing: '-0.84px',
          }}>
            잠시 기운이<br/>흐트러졌어요
          </h2>
          <p style={{
            margin: '0 0 28px', fontSize: 15, fontWeight: 500,
            color: 'var(--navy-400)', lineHeight: 1.6, padding: '0 20px',
          }}>
            네트워크 연결을 확인한 뒤<br/>다시 시도해주세요
          </p>

          {/* 에러 코드 카드 */}
          <div style={{
            width: '100%', maxWidth: 320,
            padding: '14px 16px', textAlign: 'left',
            background: '#fff', borderRadius: 16,
            border: '1px solid rgba(26,39,68,0.08)',
            boxShadow: '0 1px 2px rgba(26,39,68,0.04), 0 1px 1px rgba(26,39,68,0.02)',
            marginBottom: 28,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy-400)', letterSpacing: '0.04em', marginBottom: 6 }}>
              ERROR · 503
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--navy-500)', lineHeight: 1.6 }}>
              {loadError || '운세 서버가 잠시 쉬고 있어요.'}<br/>
              1분 뒤 자동으로 다시 시도돼요.
            </div>
          </div>

          {/* 버튼 스택 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
            <button
              onClick={() => { setLoadError(null); setStep('loading'); }}
              style={{
                width: '100%', padding: '16px 22px', fontSize: 16, fontWeight: 700,
                background: 'linear-gradient(135deg, var(--gold-500) 0%, var(--gold-400) 100%)',
                color: '#fff', border: 'none', borderRadius: 14,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 6px 20px rgba(212, 168, 75, 0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 8A6 6 0 1 1 8 2M14 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              다시 시도하기
            </button>
            <button
              onClick={restart}
              style={{
                width: '100%', padding: '14px 22px', fontSize: 14, fontWeight: 600,
                background: 'transparent', color: 'var(--navy-400)',
                border: 'none', borderRadius: 14,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              홈으로 돌아가기
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
            trackStepView('dream-input');
            setDreamInput({ text: '', useSaju: true });
            setStep('dream-input');
          }}
          onIAP={() => setStep('iap')}
        />
      )}

      {/* 띠별운세 */}
      {step === 'zodiac-input' && (
        <ZodiacInputStep
          value={zodiacInput}
          onChange={setZodiacInput}
          onNext={() => {
            saveUserProfile({
              name: zodiacInput.name,
              birthYear: zodiacInput.birthYear,
              birthMonth: zodiacInput.birthMonth,
              birthDay: zodiacInput.birthDay,
              gender: zodiacInput.gender,
              calendarType: zodiacInput.calendarType,
            });
            setLoadError(null);
            setStep('zodiac-loading');
          }}
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
          onNext={() => {
            const p1 = compatInput.person1;
            saveUserProfile({
              name: p1.name,
              birthYear: p1.birthYear,
              birthMonth: p1.birthMonth,
              birthDay: p1.birthDay,
              gender: p1.gender,
            });
            setLoadError(null);
            setStep('compat-loading');
          }}
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
          input={compatInput}
          onRestart={() => { setCompatResult(null); setStep('compat-input'); }}
          onHome={restart}
          onSelectFeature={(feature) => {
            setCompatResult(null);
            handleFeatureSelect(feature);
          }}
        />
      )}

      <AutofillSheet
        open={autofillOpen}
        profile={autofillProfile}
        onAccept={handleAutofillAccept}
        onDecline={handleAutofillDecline}
      />
    </>
  );
}
