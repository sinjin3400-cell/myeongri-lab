import { useCallback, useRef, useState } from 'react';
import { haptic } from './utils/haptic';
import type { FortuneResult, FortuneHighlight, FortuneCategory, FortunePeriod, Step, UserInfo } from './types';
import type { MbtiType } from './api';
import { requestFortuneHighlight, requestFortuneFull } from './api';
import { InfoStep } from './screens/InfoStep';
import { MbtiStep } from './screens/MbtiStep';
import { LoadingStep } from './screens/LoadingStep';
import { ResultStep } from './screens/ResultStep';
import { SharedResultView } from './screens/SharedResultView';
import { decodeShareData, sharedDataToHighlight } from './utils/shareUrl';
import type { FortuneTexts } from './utils/shareUrl';

// URL 해시에서 공유 데이터 확인 (#s=base64data)
function getSharedData(): { userName: string; highlight: FortuneHighlight; texts: FortuneTexts } | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#s=')) return null;
  const encoded = hash.slice(3); // '#s=' 제거
  if (!encoded) return null;
  const data = decodeShareData(encoded);
  if (!data) return null;
  return sharedDataToHighlight(data);
}

const initialInfo: UserInfo = {
  name: '',
  birthDate: '',
  gender: '',
  birthSijin: null,
  birthTimeUnknown: false,
};

export default function App() {
  const [sharedView, setSharedView] = useState(() => getSharedData());
  const [step, setStep] = useState<Step>('info');
  const [info, setInfo] = useState<UserInfo>(initialInfo);
  const [mbti, setMbti] = useState<MbtiType | null>(null);
  const [highlight, setHighlight] = useState<FortuneHighlight | null>(null);
  const [fullResult, setFullResult] = useState<FortuneResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [period, setPeriod] = useState<FortunePeriod>('today');

  const goNextFromInfo = useCallback(() => {
    haptic();
    setStep('mbti');
  }, []);

  const goNextFromMbti = useCallback(() => {
    haptic();
    setLoadError(null);
    setStep('loading');
  }, []);

  const skipMbti = useCallback(() => {
    setMbti(null);
    goNextFromMbti();
  }, [goNextFromMbti]);

  // 프리페치된 전체 운세를 캐시 (상태 변경 없이 저장만)
  const prefetchedRef = useRef<FortuneResult | null>(null);

  // 1단계: 하이라이트 로딩 + 전체 운세 백그라운드 프리페치
  const runAnalysis = useCallback(async () => {
    try {
      const data = await requestFortuneHighlight(info, mbti, period);
      setHighlight(data);
      setFullResult(null);
      prefetchedRef.current = null;
      setStep('result');
      haptic();
      // 나머지 2개 운세만 백그라운드에서 미리 로딩 (상태는 변경하지 않음)
      const exclude: FortuneCategory[] = [data.bestCategory, data.cautionCategory];
      requestFortuneFull(info, mbti, period, exclude)
        .then((full) => { prefetchedRef.current = full; })
        .catch(() => {});
    } catch (e) {
      const msg = e instanceof Error ? e.message : '분석에 실패했어요. 다시 시도해주세요.';
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
    setPeriod('tomorrow');
    setHighlight(null);
    setFullResult(null);
    prefetchedRef.current = null;
    setLoadError(null);
    setStep('loading');
  }, []);

  const restart = useCallback(() => {
    haptic();
    setInfo(initialInfo);
    setMbti(null);
    setHighlight(null);
    setFullResult(null);
    setLoadError(null);
    setPeriod('today');
    setStep('info');
  }, []);

  const dismissShared = useCallback(() => {
    setSharedView(null);
    // URL 해시 제거
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

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
      {step === 'info' && (
        <InfoStep value={info} onChange={setInfo} onNext={goNextFromInfo} />
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
        />
      )}
    </>
  );
}
