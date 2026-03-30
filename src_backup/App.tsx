import { useCallback, useState } from 'react';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';
import type { FortuneResult, Step, UserInfo } from './types';
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
      const data = await requestFortune(info, mbti);
      setResult(data);
      setStep('result');
      generateHapticFeedback({ type: 'softMedium' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '분석에 실패했어요.';
      setLoadError(msg);
      setStep('mbti');
    }
  }, [info, mbti]);

  const restart = useCallback(() => {
    generateHapticFeedback({ type: 'softMedium' });
    setInfo(initialInfo);
    setMbti(null);
    setResult(null);
    setLoadError(null);
    setStep('info');
  }, []);

  return (
    <>
      {step === 'info' && (
        <InfoStep
          value={info}
          onChange={setInfo}
          onNext={goNextFromInfo}
        />
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
      {step === 'result' && result && (
        <ResultStep result={result} userName={info.name} onRestart={restart} />
      )}
    </>
  );
}
