import { useState, useCallback } from 'react';

const STORAGE_KEY = 'premium_pass_count';

function getCount(): number {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

function setCount(count: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(Math.max(0, count)));
  } catch { /* noop */ }
}

export function usePremiumPass() {
  const [count, setCountState] = useState(getCount);

  const hasPass = count > 0;

  const usePass = useCallback((): boolean => {
    const current = getCount();
    if (current <= 0) return false;
    const next = current - 1;
    setCount(next);
    setCountState(next);
    return true;
  }, []);

  const addPasses = useCallback((amount: number) => {
    const current = getCount();
    const next = current + amount;
    setCount(next);
    setCountState(next);
  }, []);

  const refresh = useCallback(() => {
    setCountState(getCount());
  }, []);

  return { count, hasPass, usePass, addPasses, refresh };
}
