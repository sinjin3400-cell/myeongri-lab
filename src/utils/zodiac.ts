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

/**
 * 음력 설날(양력 기준) — 1930~2011.
 * 양력 1~2월 출생자의 띠는 음력 설 기준으로 갈리므로 필요.
 * [월, 일] 형식.
 */
const LUNAR_NEW_YEAR: Record<number, [number, number]> = {
  1930: [1,30], 1931: [2,17], 1932: [2,6], 1933: [1,26], 1934: [2,14],
  1935: [2,4], 1936: [1,24], 1937: [2,11], 1938: [1,31], 1939: [2,19],
  1940: [2,8], 1941: [1,27], 1942: [2,15], 1943: [2,5], 1944: [1,25],
  1945: [2,13], 1946: [2,2], 1947: [1,22], 1948: [2,10], 1949: [1,29],
  1950: [2,17], 1951: [2,6], 1952: [1,27], 1953: [2,14], 1954: [2,3],
  1955: [1,24], 1956: [2,12], 1957: [1,31], 1958: [2,18], 1959: [2,8],
  1960: [1,28], 1961: [2,15], 1962: [2,5], 1963: [1,25], 1964: [2,13],
  1965: [2,2], 1966: [1,21], 1967: [2,9], 1968: [1,30], 1969: [2,17],
  1970: [2,6], 1971: [1,27], 1972: [2,15], 1973: [2,3], 1974: [1,23],
  1975: [2,11], 1976: [1,31], 1977: [2,18], 1978: [2,7], 1979: [1,28],
  1980: [2,16], 1981: [2,5], 1982: [1,25], 1983: [2,13], 1984: [2,2],
  1985: [2,20], 1986: [2,9], 1987: [1,29], 1988: [2,17], 1989: [2,6],
  1990: [1,27], 1991: [2,15], 1992: [2,4], 1993: [1,23], 1994: [2,10],
  1995: [1,31], 1996: [2,19], 1997: [2,7], 1998: [1,28], 1999: [2,16],
  2000: [2,5], 2001: [1,24], 2002: [2,12], 2003: [2,1], 2004: [1,22],
  2005: [2,9], 2006: [1,29], 2007: [2,18], 2008: [2,7], 2009: [1,26],
  2010: [2,14], 2011: [2,3],
};

/**
 * 양력 생년월일로 띠를 계산. 월/일이 없으면 단순히 연도 기준.
 * 1~2월 출생자는 음력 설 이전이면 이전 연도 띠를 사용.
 */
export function getZodiacByDate(year: number, month?: number, day?: number): {
  animal: ZodiacAnimal;
  effectiveYear: number;
  adjusted: boolean;
} {
  if (!month || !day || month > 2) {
    return { animal: getZodiacAnimal(year), effectiveYear: year, adjusted: false };
  }
  const lny = LUNAR_NEW_YEAR[year];
  if (!lny) {
    return { animal: getZodiacAnimal(year), effectiveYear: year, adjusted: false };
  }
  const [lnyMonth, lnyDay] = lny;
  const beforeLny = month < lnyMonth || (month === lnyMonth && day < lnyDay);
  const effectiveYear = beforeLny ? year - 1 : year;
  return {
    animal: getZodiacAnimal(effectiveYear),
    effectiveYear,
    adjusted: beforeLny,
  };
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
