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
  // 해시 프래그먼트 사용 — 카카오 SDK 패킷/도메인 검증 우회
  return `https://myeongri-lab.vercel.app#s=${encoded}`;
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
