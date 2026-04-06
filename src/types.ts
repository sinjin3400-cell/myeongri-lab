import type { SijinId } from './sijin';

export type Gender = 'male' | 'female' | 'other';

export type Step = 'home' | 'info' | 'mbti' | 'loading' | 'error' | 'result';

export type AppFeature = 'fortune' | 'dream' | 'zodiac' | 'compatibility';

export type FortunePeriod = 'today' | 'tomorrow' | 'week' | 'month';

export interface UserInfo {
  name: string;
  /** 화면 표시: YYYY.MM.DD (숫자만 입력 시 자동 포맷) */
  birthDate: string;
  gender: Gender | '';
  /** 선택한 시진. birthTimeUnknown이면 null */
  birthSijin: SijinId | null;
  birthTimeUnknown: boolean;
}

export interface LuckyInfo {
  color: string;
  colorHex: string;
  number: number;
  direction: string;
  item: string;
}

export type FortuneCategory = 'overall' | 'love' | 'money' | 'health';

export interface FortuneHighlight {
  summaryLine: string;
  score: number;
  bestCategory: FortuneCategory;
  bestSummary: string;
  bestDetail: string;
  cautionCategory: FortuneCategory;
  cautionSummary: string;
  cautionDetail: string;
  lucky: LuckyInfo;
  mbtiInsight?: string;
}

export interface FortuneResult {
  overall: string;
  love: string;
  money: string;
  health: string;
  summaryLine: string;
  overallDetail?: string;
  loveDetail?: string;
  moneyDetail?: string;
  healthDetail?: string;
  lucky: LuckyInfo;
  score: number; // 0~100 오늘의 운세 점수
  mbtiInsight?: string; // MBTI 기반 한줄 인사이트
}
