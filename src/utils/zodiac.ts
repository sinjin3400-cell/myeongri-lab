import type { ZodiacAnimal } from '../types';

const ZODIAC_ANIMALS: ZodiacAnimal[] = [
  { name: '쥐', emoji: '🐭', hanja: '子', element: '수' },
  { name: '소', emoji: '🐂', hanja: '丑', element: '토' },
  { name: '호랑이', emoji: '🐯', hanja: '寅', element: '목' },
  { name: '토끼', emoji: '🐰', hanja: '卯', element: '목' },
  { name: '용', emoji: '🐲', hanja: '辰', element: '토' },
  { name: '뱀', emoji: '🐍', hanja: '巳', element: '화' },
  { name: '말', emoji: '🐴', hanja: '午', element: '화' },
  { name: '양', emoji: '🐑', hanja: '未', element: '토' },
  { name: '원숭이', emoji: '🐵', hanja: '申', element: '금' },
  { name: '닭', emoji: '🐔', hanja: '酉', element: '금' },
  { name: '개', emoji: '🐶', hanja: '戌', element: '토' },
  { name: '돼지', emoji: '🐷', hanja: '亥', element: '수' },
];

export function getZodiacAnimal(birthYear: number): ZodiacAnimal {
  const idx = ((birthYear - 4) % 12 + 12) % 12;
  return ZODIAC_ANIMALS[idx];
}

export function getZodiacAnimalByName(name: string): ZodiacAnimal | undefined {
  return ZODIAC_ANIMALS.find(a => a.name === name);
}

/** 띠 이름 → 대표 출생년도(분석 호환용, 1930~2010 범위) */
const ZODIAC_REP_YEAR: Record<string, number> = {
  '쥐': 1996, '소': 1997, '호랑이': 1998, '토끼': 1999,
  '용': 2000, '뱀': 2001, '말': 2002, '양': 2003,
  '원숭이': 2004, '닭': 2005, '개': 2006, '돼지': 2007,
};

export function getRepresentativeYear(animalName: string): number {
  return ZODIAC_REP_YEAR[animalName] ?? 2000;
}

/** 특정 띠에 해당하는 최근 출생년도들 (표시용) */
export function getZodiacYears(animalName: string, count = 5): number[] {
  const years: number[] = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1930 && years.length < count; y--) {
    if (getZodiacAnimal(y).name === animalName) years.push(y);
  }
  return years;
}

export { ZODIAC_ANIMALS };
