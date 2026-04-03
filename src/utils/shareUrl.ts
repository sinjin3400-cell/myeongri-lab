import type { FortuneHighlight, LuckyInfo, FortuneCategory } from '../types';

/** 공유 URL에 담을 최소 데이터 (10KB 이하 유지) */
export interface SharedFortuneData {
  n: string; // userName
  sl: string; // summaryLine (짧게)
  sc: number; // score
  bc: FortuneCategory; // bestCategory
  bs: string; // bestSummary (30자)
  cc: FortuneCategory; // cautionCategory
  cs: string; // cautionSummary (30자)
  lc: string; // lucky.color
  ln: number; // lucky.number
  ld: string; // lucky.direction
  li: string; // lucky.item
  // v2: 전체 운세 요약 (공유 화면 더보기용)
  ov?: string; // overall (80자)
  lo?: string; // love (80자)
  mo?: string; // money (80자)
  he?: string; // health (80자)
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s;
}

export interface FortuneTexts {
  overall?: string;
  love?: string;
  money?: string;
  health?: string;
}

/** 카카오용 초경량 인코딩 (URL 최대한 짧게) */
export function encodeShareDataCompact(userName: string, highlight: FortuneHighlight): string {
  // 카테고리를 1글자로 압축
  const catMap: Record<FortuneCategory, string> = { overall: 'o', love: 'l', money: 'm', health: 'h' };
  const data = [
    truncate(userName, 6),
    highlight.score,
    truncate(highlight.summaryLine, 20),
    catMap[highlight.bestCategory],
    truncate(highlight.bestSummary, 20),
    catMap[highlight.cautionCategory],
    truncate(highlight.cautionSummary, 20),
    highlight.lucky.color,
    highlight.lucky.number,
    highlight.lucky.direction,
    highlight.lucky.item,
  ].join('|');

  return btoa(unescape(encodeURIComponent(data)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** 카카오용 초경량 디코딩 */
export function decodeShareDataCompact(encoded: string): SharedFortuneData | null {
  try {
    const catRevMap: Record<string, FortuneCategory> = { o: 'overall', l: 'love', m: 'money', h: 'health' };
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const str = decodeURIComponent(escape(atob(b64)));
    const parts = str.split('|');
    if (parts.length < 11) return null;
    return {
      n: parts[0],
      sc: Number(parts[1]),
      sl: parts[2],
      bc: catRevMap[parts[3]] || 'overall',
      bs: parts[4],
      cc: catRevMap[parts[5]] || 'health',
      cs: parts[6],
      lc: parts[7],
      ln: Number(parts[8]),
      ld: parts[9],
      li: parts[10],
    };
  } catch {
    return null;
  }
}

export function encodeShareData(userName: string, highlight: FortuneHighlight, texts?: FortuneTexts): string {
  const data: SharedFortuneData = {
    n: truncate(userName, 10),
    sl: truncate(highlight.summaryLine, 30),
    sc: highlight.score,
    bc: highlight.bestCategory,
    bs: truncate(highlight.bestSummary, 30),
    cc: highlight.cautionCategory,
    cs: truncate(highlight.cautionSummary, 30),
    lc: highlight.lucky.color,
    ln: highlight.lucky.number,
    ld: highlight.lucky.direction,
    li: highlight.lucky.item,
  };

  if (texts) {
    if (texts.overall) data.ov = truncate(texts.overall, 80);
    if (texts.love) data.lo = truncate(texts.love, 80);
    if (texts.money) data.mo = truncate(texts.money, 80);
    if (texts.health) data.he = truncate(texts.health, 80);
  }

  const json = JSON.stringify(data);
  // URL-safe base64
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeShareData(encoded: string): SharedFortuneData | null {
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as SharedFortuneData;
  } catch {
    return null;
  }
}

export function buildShareUrl(userName: string, highlight: FortuneHighlight, texts?: FortuneTexts): string {
  const encoded = encodeShareData(userName, highlight, texts);
  // 경로 기반 URL — 카카오 SDK가 해시/query를 거부하지만 하위 경로는 허용
  return `https://myeongri-lab.vercel.app/s/${encoded}`;
}

export function sharedDataToHighlight(data: SharedFortuneData): {
  userName: string;
  highlight: FortuneHighlight;
  texts: FortuneTexts;
} {
  const lucky: LuckyInfo = {
    color: data.lc,
    colorHex: '#c9a962', // 기본값
    number: data.ln,
    direction: data.ld,
    item: data.li,
  };
  return {
    userName: data.n,
    highlight: {
      summaryLine: data.sl,
      score: data.sc,
      bestCategory: data.bc,
      bestSummary: data.bs,
      bestDetail: '',
      cautionCategory: data.cc,
      cautionSummary: data.cs,
      cautionDetail: '',
      lucky,
    },
    texts: {
      overall: data.ov,
      love: data.lo,
      money: data.mo,
      health: data.he,
    },
  };
}
