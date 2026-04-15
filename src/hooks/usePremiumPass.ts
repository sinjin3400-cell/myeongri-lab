import { useState, useCallback } from 'react';

const STORAGE_KEY = 'premium_passes_v2';
const MAX_PASSES = 20;
const EXPIRY_DAYS = 7;

type PassEntry = { acquiredAt: string }; // ISO date string (YYYY-MM-DD)

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isExpired(entry: PassEntry): boolean {
  const acquired = new Date(entry.acquiredAt);
  const now = new Date();
  const diffMs = now.getTime() - acquired.getTime();
  return diffMs > EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

function loadPasses(): PassEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // v1 마이그레이션: 기존 숫자 카운트를 날짜 배열로 변환
      const oldCount = parseInt(localStorage.getItem('premium_pass_count') || '0', 10);
      if (oldCount > 0) {
        const today = todayStr();
        const entries = Array.from({ length: Math.min(oldCount, MAX_PASSES) }, () => ({ acquiredAt: today }));
        savePasses(entries);
        localStorage.removeItem('premium_pass_count');
        return entries;
      }
      return [];
    }
    const entries: PassEntry[] = JSON.parse(raw);
    // 만료된 열람권 제거
    const valid = entries.filter(e => !isExpired(e));
    if (valid.length !== entries.length) {
      savePasses(valid);
    }
    return valid;
  } catch {
    return [];
  }
}

function savePasses(entries: PassEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch { /* noop */ }
}

export function usePremiumPass() {
  const [passes, setPassesState] = useState(loadPasses);

  const count = passes.length;
  const hasPass = count > 0;

  const usePass = useCallback((): boolean => {
    const current = loadPasses();
    if (current.length <= 0) return false;
    // 가장 오래된 것부터 사용 (FIFO)
    current.shift();
    savePasses(current);
    setPassesState([...current]);
    return true;
  }, []);

  /** 열람권 추가. 한도 초과 시 capped: true 반환 */
  const addPasses = useCallback((amount: number): { added: number; capped: boolean } => {
    const current = loadPasses();
    const space = MAX_PASSES - current.length;
    const toAdd = Math.min(amount, Math.max(0, space));
    const capped = toAdd < amount;

    if (toAdd > 0) {
      const today = todayStr();
      const newEntries = Array.from({ length: toAdd }, () => ({ acquiredAt: today }));
      const updated = [...current, ...newEntries];
      savePasses(updated);
      setPassesState(updated);
    }

    return { added: toAdd, capped };
  }, []);

  const refresh = useCallback(() => {
    setPassesState(loadPasses());
  }, []);

  return { count, hasPass, usePass, addPasses, refresh, maxPasses: MAX_PASSES };
}
