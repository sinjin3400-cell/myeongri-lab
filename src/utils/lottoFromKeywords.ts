/**
 * 꿈해몽 키워드에서 추출된 로또 번호를 검증하고
 * 5세트(각 6개, 1~45, 중복 없음, 정렬)를 생성한다.
 *
 * - 1세트: AI가 키워드에서 뽑은 번호를 우선 채우고 부족분만 랜덤
 * - 2~5세트: 키워드 번호 일부 + 보안 랜덤 채움 (세트 간 완전중복 방지)
 */

import type { DreamKeyword } from '../types';

const SET_SIZE = 6;
const MIN_NUM = 1;
const MAX_NUM = 45;
const TOTAL_SETS = 5;

/** 1~45 정수만 통과시키는 검증 */
function sanitizeNumber(n: unknown): number | null {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isInteger(v)) return null;
  if (v < MIN_NUM || v > MAX_NUM) return null;
  return v;
}

/** crypto 기반 1~45 균등 랜덤 (모듈로 편향 최소화) */
function secureRandomNumber(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    // 0~MAX_NUM*N 범위에서 거부 샘플링
    const limit = Math.floor(0xffffffff / MAX_NUM) * MAX_NUM;
    const buf = new Uint32Array(1);
    while (true) {
      crypto.getRandomValues(buf);
      if (buf[0] < limit) return (buf[0] % MAX_NUM) + 1;
    }
  }
  return Math.floor(Math.random() * MAX_NUM) + 1;
}

/** 배열을 Fisher-Yates로 셔플 (crypto 사용) */
function secureShuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor((secureRandomNumber() - 1) * (i + 1) / MAX_NUM);
    const k = Math.min(j, i);
    [out[i], out[k]] = [out[k], out[i]];
  }
  return out;
}

/** 6개 미만이면 안전 랜덤으로 채워서 6개 정렬 배열로 반환 */
function fillToSet(seed: number[]): number[] {
  const set = new Set<number>();
  for (const n of seed) {
    if (set.size >= SET_SIZE) break;
    const v = sanitizeNumber(n);
    if (v !== null) set.add(v);
  }
  while (set.size < SET_SIZE) {
    set.add(secureRandomNumber());
  }
  return Array.from(set).sort((a, b) => a - b);
}

/**
 * 키워드 번호들을 검증/보정해서 DreamKeyword[]로 정규화.
 * - 키워드당 번호 2~3개 보장 (부족하면 랜덤 보충, 초과하면 잘라냄)
 * - 키워드 내부 중복 제거
 */
export function normalizeKeywords(keywords: DreamKeyword[]): DreamKeyword[] {
  return keywords.map((kw) => {
    const seen = new Set<number>();
    for (const n of kw.numbers || []) {
      const v = sanitizeNumber(n);
      if (v !== null) seen.add(v);
      if (seen.size >= 3) break;
    }
    while (seen.size < 2) {
      seen.add(secureRandomNumber());
    }
    return {
      word: kw.word,
      reason: kw.reason,
      numbers: Array.from(seen).sort((a, b) => a - b),
    };
  });
}

/**
 * 정규화된 키워드 → 5세트 로또 번호 생성
 */
export function buildLottoSets(keywords: DreamKeyword[]): number[][] {
  const allKeywordNumbers = keywords.flatMap((k) => k.numbers);
  const uniqueKeywordNumbers = Array.from(new Set(allKeywordNumbers));

  const sets: number[][] = [];
  const seenKeys = new Set<string>();

  // 세트 1: 키워드 번호를 우선 채움 (셔플 후 앞 6개)
  sets.push(fillToSet(secureShuffle(uniqueKeywordNumbers)));
  seenKeys.add(sets[0].join(','));

  // 세트 2~5: 키워드 일부 + 랜덤 (중복 세트 회피)
  let attempts = 0;
  while (sets.length < TOTAL_SETS && attempts < 50) {
    attempts++;
    // 키워드 번호 2~3개 + 나머지 랜덤
    const keywordPart = secureShuffle(uniqueKeywordNumbers).slice(0, 2 + (attempts % 2));
    const candidate = fillToSet(keywordPart);
    const key = candidate.join(',');
    if (!seenKeys.has(key)) {
      sets.push(candidate);
      seenKeys.add(key);
    }
  }

  // 혹시 50회 안에 못 채우면 순수 랜덤으로 마무리
  while (sets.length < TOTAL_SETS) {
    sets.push(fillToSet([]));
  }

  return sets;
}
