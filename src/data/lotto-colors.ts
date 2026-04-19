/**
 * 한국 동행복권 로또 6/45 번호별 색상 매핑
 *
 * 기본 색상 체계 (동행복권 공식):
 *   1~10  : 노란색 (Yellow)
 *   11~20 : 파란색 (Blue)
 *   21~30 : 빨간색 (Red)
 *   31~40 : 회색 (Gray)
 *   41~45 : 초록색 (Green)
 *
 * 앱 테마 (Navy #1a2744 / Gold #d4a84b / Cream #fefcf9)에 맞게 조정:
 *   - Yellow → 앱의 Gold 톤에 가까운 따뜻한 금색 (#d4a84b)
 *   - Blue   → 앱의 Navy와 조화되는 중간 밝기 블루 (#4a7fd4)
 *   - Red    → Cream 배경 위에서 너무 자극적이지 않은 와인/로즈 톤 (#c4524a)
 *   - Gray   → Navy 계열의 차분한 슬레이트 (#6b7a8d)
 *   - Green  → Gold·Navy 사이에서 균형 잡히는 틸/에메랄드 (#3a9d7c)
 */

export const LOTTO_BALL_PALETTE = {
  yellow: '#d4a84b', // 1~10  Gold 계열
  blue: '#4a7fd4',   // 11~20 Navy 보색 블루
  red: '#c4524a',    // 21~30 와인 로즈
  gray: '#6b7a8d',   // 31~40 슬레이트
  green: '#3a9d7c',  // 41~45 에메랄드 틸
} as const;

export const LOTTO_COLORS: Record<number, string> = {
  // 1~10: Gold 계열 (#d4a84b)
  1: '#d4a84b',
  2: '#d4a84b',
  3: '#d4a84b',
  4: '#d4a84b',
  5: '#d4a84b',
  6: '#d4a84b',
  7: '#d4a84b',
  8: '#d4a84b',
  9: '#d4a84b',
  10: '#d4a84b',

  // 11~20: Blue 계열 (#4a7fd4)
  11: '#4a7fd4',
  12: '#4a7fd4',
  13: '#4a7fd4',
  14: '#4a7fd4',
  15: '#4a7fd4',
  16: '#4a7fd4',
  17: '#4a7fd4',
  18: '#4a7fd4',
  19: '#4a7fd4',
  20: '#4a7fd4',

  // 21~30: Red/Wine 계열 (#c4524a)
  21: '#c4524a',
  22: '#c4524a',
  23: '#c4524a',
  24: '#c4524a',
  25: '#c4524a',
  26: '#c4524a',
  27: '#c4524a',
  28: '#c4524a',
  29: '#c4524a',
  30: '#c4524a',

  // 31~40: Slate Gray 계열 (#6b7a8d)
  31: '#6b7a8d',
  32: '#6b7a8d',
  33: '#6b7a8d',
  34: '#6b7a8d',
  35: '#6b7a8d',
  36: '#6b7a8d',
  37: '#6b7a8d',
  38: '#6b7a8d',
  39: '#6b7a8d',
  40: '#6b7a8d',

  // 41~45: Emerald Teal 계열 (#3a9d7c)
  41: '#3a9d7c',
  42: '#3a9d7c',
  43: '#3a9d7c',
  44: '#3a9d7c',
  45: '#3a9d7c',
};

/**
 * 로또 번호(1~45)에 해당하는 볼 색상을 반환합니다.
 * 범위 밖의 번호는 앱 기본 Navy 색상을 반환합니다.
 */
export function getLottoColor(num: number): string {
  return LOTTO_COLORS[num] ?? '#1a2744';
}
