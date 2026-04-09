import type { SijinId } from './sijin';

export type Gender = 'male' | 'female' | 'other';

export type Step =
  | 'home' | 'info' | 'mbti' | 'loading' | 'error' | 'result'
  | 'zodiac-input' | 'zodiac-loading' | 'zodiac-result'
  | 'compat-input' | 'compat-loading' | 'compat-result';

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

// --- 띠별운세 ---

export interface ZodiacAnimal {
  name: string;       // 쥐, 소, 호랑이 ...
  emoji: string;      // 🐭, 🐂, 🐯 ...
  hanja: string;      // 子, 丑, 寅 ...
  element: string;    // 오행
}

export type ZodiacCriterion = 'solar' | 'lunar';

export interface ZodiacInput {
  name: string;
  birthYear: string;  // YYYY
  birthMonth?: string; // MM (선택, 음력 설 보정용)
  birthDay?: string;   // DD (선택)
  criterion?: ZodiacCriterion; // 띠 기준 (양력/음력)
  gender: Gender | '';
}

export type ZodiacPrimaryCategory = 'overall' | 'love' | 'money' | 'health' | 'work';

export interface ZodiacResult {
  animal: string;
  emoji: string;
  element?: string;
  summaryLine: string;
  score: number;
  /** 오늘의 핵심 키워드 3~4개 */
  keywords?: string[];
  /** 오늘 띠에 가장 영향이 큰 단일 핵심 운세 카테고리 */
  primaryCategory: ZodiacPrimaryCategory;
  primaryTitle: string;   // 예: "오늘의 핵심 - 금전운"
  primaryBody: string;    // 8~10문장 깊이 있는 풀이
  primaryDetail: string;  // 추가 디테일/실천 조언
  advice: string;
}

// --- 궁합보기 ---

export interface CompatPerson {
  name: string;
  birthYear: string;
  gender: Gender | '';
}

export interface CompatInput {
  person1: CompatPerson;
  person2: CompatPerson;
}

export interface CompatResult {
  score: number;                // 0~100
  summaryLine: string;
  person1Animal: string;
  person1Emoji: string;
  person2Animal: string;
  person2Emoji: string;
  /** 두 띠의 오행 관계: 상생/상극/중성 */
  elementRelation?: '상생' | '상극' | '중성';
  loveScore?: number;           // 0~100
  moneyScore?: number;          // 0~100
  commScore?: number;           // 0~100
  keywords?: string[];          // 두 사람 관계 키워드 3~4개
  overall: string;              // 전체 궁합
  overallDetail: string;
  love: string;                 // 애정 궁합
  money: string;                // 재물 궁합
  communication: string;        // 소통 궁합
  advice: string;               // 관계 조언
}
