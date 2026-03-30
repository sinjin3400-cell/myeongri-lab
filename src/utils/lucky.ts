import type { LuckyInfo } from '../types';

export const DEFAULT_LUCKY: LuckyInfo = {
  color: '파랑',
  colorHex: '#5b8def',
  number: 7,
  direction: '동쪽',
  item: '따뜻한 음료',
};

/** API가 `lucky`를 빼먹거나 일부 필드만 줄 때 UI/공유 문구가 깨지지 않게 보정 */
export function mergeLucky(
  partial: Partial<LuckyInfo> | undefined | null
): LuckyInfo {
  const n = partial?.number;
  const numberOk = typeof n === 'number' && Number.isFinite(n);

  return {
    color: partial?.color ?? DEFAULT_LUCKY.color,
    colorHex: partial?.colorHex ?? DEFAULT_LUCKY.colorHex,
    number: numberOk ? n : DEFAULT_LUCKY.number,
    direction: partial?.direction ?? DEFAULT_LUCKY.direction,
    item: partial?.item ?? DEFAULT_LUCKY.item,
  };
}
