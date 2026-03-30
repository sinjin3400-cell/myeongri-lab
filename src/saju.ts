/**
 * 사주팔자(四柱八字) 계산 유틸리티
 * 
 * 생년월일시를 기반으로 천간(天干)·지지(地支)를 구하는 간이 만세력
 * 실제 프로덕션에서는 정밀 만세력 API를 사용하는 것이 좋지만
 * AI 프롬프트에 참고 정보를 넘기기 위한 목적으로 사용합니다.
 */

const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
const CHEONGAN_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
const JIJI_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

const OHAENG = ['목', '화', '토', '금', '수'] as const;
const OHAENG_MAP: Record<string, string> = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수',
};

export type SajuPillar = {
  cheongan: string;
  cheonganHanja: string;
  jiji: string;
  jijiHanja: string;
  ohaeng: string;
};

export type SajuResult = {
  year: SajuPillar;
  month: SajuPillar;
  day: SajuPillar;
  time: SajuPillar | null;
  summary: string;
  ohaengBalance: Record<string, number>;
};

function getYearPillar(year: number): SajuPillar {
  // 천간: (year - 4) % 10
  // 지지: (year - 4) % 12
  const ganIdx = (year - 4) % 10;
  const jiIdx = (year - 4) % 12;
  const gan = CHEONGAN[ganIdx >= 0 ? ganIdx : ganIdx + 10];
  const ji = JIJI[jiIdx >= 0 ? jiIdx : jiIdx + 12];
  return {
    cheongan: gan,
    cheonganHanja: CHEONGAN_HANJA[CHEONGAN.indexOf(gan)],
    jiji: ji,
    jijiHanja: JIJI_HANJA[JIJI.indexOf(ji)],
    ohaeng: OHAENG_MAP[gan],
  };
}

function getMonthPillar(year: number, month: number): SajuPillar {
  // 월주 천간: (연간 index × 2 + month) % 10
  // 월주 지지: 1월=인, 2월=묘 … (month + 1) % 12
  const yearGanIdx = ((year - 4) % 10 + 10) % 10;
  const ganIdx = (yearGanIdx * 2 + month) % 10;
  const jiIdx = (month + 1) % 12; // 1월→인(idx 2), 2월→묘(idx 3)...
  const gan = CHEONGAN[ganIdx];
  const ji = JIJI[jiIdx];
  return {
    cheongan: gan,
    cheonganHanja: CHEONGAN_HANJA[CHEONGAN.indexOf(gan)],
    jiji: ji,
    jijiHanja: JIJI_HANJA[JIJI.indexOf(ji)],
    ohaeng: OHAENG_MAP[gan],
  };
}

function getDayPillar(year: number, month: number, day: number): SajuPillar {
  // 일주: 간이 계산 — 2000.1.7이 갑자일(甲子日) 기준
  const base = new Date(2000, 0, 7); // 2000-01-07 = 갑자일
  const target = new Date(year, month - 1, day);
  const diff = Math.floor((target.getTime() - base.getTime()) / 86400000);
  const ganIdx = ((diff % 10) + 10) % 10;
  const jiIdx = ((diff % 12) + 12) % 12;
  const gan = CHEONGAN[ganIdx];
  const ji = JIJI[jiIdx];
  return {
    cheongan: gan,
    cheonganHanja: CHEONGAN_HANJA[CHEONGAN.indexOf(gan)],
    jiji: ji,
    jijiHanja: JIJI_HANJA[JIJI.indexOf(ji)],
    ohaeng: OHAENG_MAP[gan],
  };
}

function getTimePillar(
  dayGanIdx: number,
  sijinIdx: number
): SajuPillar {
  // 시주 천간: (일간 × 2 + 시지 index) % 10
  const ganIdx = (dayGanIdx * 2 + sijinIdx) % 10;
  const gan = CHEONGAN[ganIdx];
  const ji = JIJI[sijinIdx];
  return {
    cheongan: gan,
    cheonganHanja: CHEONGAN_HANJA[CHEONGAN.indexOf(gan)],
    jiji: ji,
    jijiHanja: JIJI_HANJA[JIJI.indexOf(ji)],
    ohaeng: OHAENG_MAP[gan],
  };
}

const SIJIN_MAP: Record<string, number> = {
  ja: 0,
  chuk: 1,
  in: 2,
  myo: 3,
  jin: 4,
  sa: 5,
  o: 6,
  mi: 7,
  sin: 8,
  yu: 9,
  sul: 10,
  hae: 11,
};

export function calculateSaju(
  birthDate: string, // YYYY.MM.DD
  sijinId: string | null
): SajuResult {
  const parts = birthDate.split('.').map(Number);
  const [year, month, day] = parts;

  const yearP = getYearPillar(year);
  const monthP = getMonthPillar(year, month);
  const dayP = getDayPillar(year, month, day);

  let timeP: SajuPillar | null = null;
  if (sijinId && SIJIN_MAP[sijinId] !== undefined) {
    const base = new Date(2000, 0, 7);
    const target = new Date(year, month - 1, day);
    const diff = Math.floor((target.getTime() - base.getTime()) / 86400000);
    const dayGanIdx = ((diff % 10) + 10) % 10;
    timeP = getTimePillar(dayGanIdx, SIJIN_MAP[sijinId]);
  }

  // 오행 밸런스
  const ohaengBalance: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [yearP, monthP, dayP, timeP].forEach((p) => {
    if (!p) return;
    if (p.ohaeng) ohaengBalance[p.ohaeng]++;
    // 지지 오행도 간이 추가
    const jiOhaeng = JIJI_OHAENG[p.jiji];
    if (jiOhaeng) ohaengBalance[jiOhaeng]++;
  });

  const pillars = [yearP, monthP, dayP, timeP].filter(Boolean) as SajuPillar[];
  const summary = pillars
    .map((p) => `${p.cheonganHanja}${p.jijiHanja}`)
    .join(' ');

  return { year: yearP, month: monthP, day: dayP, time: timeP, summary, ohaengBalance };
}

const JIJI_OHAENG: Record<string, string> = {
  '자': '수', '축': '토', '인': '목', '묘': '목',
  '진': '토', '사': '화', '오': '화', '미': '토',
  '신': '금', '유': '금', '술': '토', '해': '수',
};

/**
 * 오행 밸런스에서 가장 강한/약한 오행을 분석
 */
export function analyzeOhaeng(balance: Record<string, number>) {
  const entries = Object.entries(balance).sort((a, b) => b[1] - a[1]);
  return {
    strongest: entries[0],
    weakest: entries[entries.length - 1],
    balance: entries,
  };
}

/**
 * 오늘의 일진(日辰)을 구함
 */
export function getTodayDayPillar(): SajuPillar {
  const now = new Date();
  return getDayPillar(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
