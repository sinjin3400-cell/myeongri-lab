import { useCallback, useState } from 'react';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';
import type { FortuneResult, FortunePeriod, Step, UserInfo } from './types';
import type { MbtiType } from './api';
import { requestFortune } from './api';
import { InfoStep } from './screens/InfoStep';
import { MbtiStep } from './screens/MbtiStep';
import { LoadingStep } from './screens/LoadingStep';
import { ResultStep } from './screens/ResultStep';

const initialInfo: UserInfo = {
  name: '',
  birthDate: '',
  gender: '',
  birthSijin: null,
  birthTimeUnknown: false,
};

export default function App() {
  const [step, setStep] = useState<Step>('info');
  const [info, setInfo] = useState<UserInfo>(initialInfo);
  const [mbti, setMbti] = useState<MbtiType | null>(null);
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [period, setPeriod] = useState<FortunePeriod>('today');

  const goNextFromInfo = useCallback(() => {
    generateHapticFeedback({ type: 'softMedium' });
    setStep('mbti');
  }, []);

  const goNextFromMbti = useCallback(() => {
    generateHapticFeedback({ type: 'softMedium' });
    setLoadError(null);
    setStep('loading');
  }, []);

  const skipMbti = useCallback(() => {
    setMbti(null);
    goNextFromMbti();
  }, [goNextFromMbti]);

  const runAnalysis = useCallback(async () => {
    try {
      const data = await requestFortune(info, mbti, period);
      setResult(data);
      setStep('result');
      generateHapticFeedback({ type: 'softMedium' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '분석에 실패했어요. 다시 시도해주세요.';
      setLoadError(msg);
      setStep('error');
    }
  }, [info, mbti, period]);

  const handleChangePeriod = useCallback(
    (newPeriod: FortunePeriod) => {
      if (newPeriod === period) return;
      setPeriod(newPeriod);
      setLoadError(null);
      setStep('loading');
    },
    [period]
  );

  const handleTomorrow = useCallback(() => {
    // "내일 운세" → 실제로는 다시 오늘 운세를 재분석 (서버에서 내일 날짜 처리 가능)
    generateHapticFeedback({ type: 'softMedium' });
    setPeriod('today');
    setLoadError(null);
    setStep('loading');
  }, []);

  const restart = useCallback(() => {
    generateHapticFeedback({ type: 'softMedium' });
    setInfo(initialInfo);
    setMbti(null);
    setResult(null);
    setLoadError(null);
    setPeriod('today');
    setStep('info');
  }, []);

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
      {step === 'result' && result && (
        <ResultStep
          result={result}
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
