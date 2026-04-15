import type { FortuneCategory } from '../types';

export const CATEGORY_LABEL: Record<FortuneCategory, { title: string; icon: string }> = {
  overall: { title: '총운', icon: '☀️' },
  love: { title: '애정운', icon: '💕' },
  money: { title: '금전운', icon: '✨' },
  health: { title: '건강운', icon: '🌿' },
};
