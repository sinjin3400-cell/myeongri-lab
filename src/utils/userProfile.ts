import type { Gender, CalendarType } from '../types';

const KEY = 'myeongri_user_profile';

export interface SharedProfile {
  name: string;
  birthYear: string;   // YYYY
  birthMonth: string;  // MM (zero-padded)
  birthDay: string;    // DD (zero-padded)
  gender: Gender | '';
  calendarType?: CalendarType;
  updatedAt: number;
}

function pad2(s: string): string {
  return s.length === 1 ? `0${s}` : s;
}

export function loadUserProfile(): SharedProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SharedProfile>;
    if (typeof parsed.name !== 'string') return null;
    return {
      name: parsed.name ?? '',
      birthYear: parsed.birthYear ?? '',
      birthMonth: parsed.birthMonth ?? '',
      birthDay: parsed.birthDay ?? '',
      gender: (parsed.gender as Gender | '') ?? '',
      calendarType: parsed.calendarType,
      updatedAt: parsed.updatedAt ?? 0,
    };
  } catch {
    return null;
  }
}

export function saveUserProfile(p: Partial<SharedProfile>): void {
  try {
    const prev = loadUserProfile() ?? {
      name: '', birthYear: '', birthMonth: '', birthDay: '', gender: '' as Gender | '', updatedAt: 0,
    };
    const merged: SharedProfile = {
      name: (p.name ?? prev.name).trim(),
      birthYear: p.birthYear ?? prev.birthYear,
      birthMonth: p.birthMonth ? pad2(p.birthMonth) : prev.birthMonth,
      birthDay: p.birthDay ? pad2(p.birthDay) : prev.birthDay,
      gender: (p.gender as Gender | '') ?? prev.gender,
      calendarType: p.calendarType ?? prev.calendarType,
      updatedAt: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify(merged));
    if (merged.name) {
      try { localStorage.setItem('myeongri_last_name', merged.name); } catch { /* noop */ }
    }
  } catch { /* noop */ }
}

/** YYYY.MM.DD 점 구분 형식 → 분리 필드 */
export function dottedToParts(dotted: string): { y: string; m: string; d: string } {
  const digits = dotted.replace(/\D/g, '').slice(0, 8);
  if (digits.length !== 8) return { y: '', m: '', d: '' };
  return { y: digits.slice(0, 4), m: digits.slice(4, 6), d: digits.slice(6, 8) };
}

/** 분리 필드 → YYYY.MM.DD (모두 채워졌을 때만 반환, 아니면 빈 문자열) */
export function partsToDotted(y: string, m: string, d: string): string {
  if (y.length !== 4 || !m || !d) return '';
  return `${y}.${pad2(m)}.${pad2(d)}`;
}
