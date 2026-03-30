import type { SijinId } from './sijin';

export type Gender = 'male' | 'female' | 'other';

export type Step = 'info' | 'mbti' | 'loading' | 'result';

export interface UserInfo {
  name: string;
  /** 화면 표시: YYYY.MM.DD (숫자만 입력 시 자동 포맷) */
  birthDate: string;
  gender: Gender | '';
  /** 선택한 시진. birthTimeUnknown이면 null */
  birthSijin: SijinId | null;
  birthTimeUnknown: boolean;
}

export interface FortuneResult {
  overall: string;
  love: string;
  money: string;
  health: string;
  summaryLine: string;
}
