import type { FortuneResult, FortuneHighlight, FortuneCategory, FortunePeriod, UserInfo, ZodiacInput, ZodiacResult, CompatInput, CompatResult, DreamInput, DreamResult } from './types';
import { normalizeKeywords, buildLottoSets } from './utils/lottoFromKeywords';
import { calculateSaju, analyzeOhaeng, getTodayDayPillar } from './utils/saju';
import { getZodiacAnimal, getZodiacByDate } from './utils/zodiac';
import { MBTI_PROFILES } from './data/mbtiProfiles';

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
] as const;

export type MbtiType = (typeof MBTI_TYPES)[number];
export const MBTI_LIST = MBTI_TYPES;

function apiBase(): string {
  return import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '';
}

// --- 캐싱 ---

function getCacheKey(info: UserInfo, mbti: MbtiType | null, period: FortunePeriod, phase: 'highlight' | 'full'): string {
  const today = new Date().toISOString().slice(0, 10);
  return `fortune:${phase}:${info.name}:${info.birthDate}:${info.birthSijin ?? 'x'}:${info.gender}:${mbti ?? 'none'}:${period}:${today}`;
}

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setCache(key: string, data: unknown): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith('fortune:') && !k.endsWith(today)) {
        localStorage.removeItem(k);
      }
    }
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* 용량 초과 시 무시 */ }
}

// --- 랜덤 시드 & 셔플 ---

const ALL_COLORS = [
  '코발트블루', '샴페인골드', '라벤더퍼플', '민트그린', '코랄핑크',
  '로즈우드', '앰버옐로우', '아이보리화이트', '올리브그린', '버건디레드',
  '피치오렌지', '스카이블루', '차콜그레이', '플럼퍼플', '터콰이즈',
];

const ALL_CATEGORIES: FortuneCategory[] = ['overall', 'love', 'money', 'health'];

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) | 0;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getVariationSeed(info: UserInfo, mbti: MbtiType | null): number {
  const today = new Date().toISOString().slice(0, 10);
  return simpleHash(`${info.name}:${info.birthDate}:${mbti ?? 'none'}:${today}`);
}

// --- 공통 유틸 ---

function getSajuContext(info: UserInfo, mbti: MbtiType | null, period: FortunePeriod) {
  const saju = calculateSaju(info.birthDate, info.birthSijin);
  const todayPillar = getTodayDayPillar();
  const ohaengAnalysis = analyzeOhaeng(saju.ohaengBalance);
  const mbtiProfile = mbti ? MBTI_PROFILES[mbti] : null;

  const today = new Date();
  const targetDate = period === 'tomorrow'
    ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    : today;
  const dateStr = `${targetDate.getFullYear()}년 ${targetDate.getMonth() + 1}월 ${targetDate.getDate()}일`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][targetDate.getDay()];
  const periodLabel = period === 'today' ? '오늘' : period === 'tomorrow' ? '내일' : period === 'week' ? '이번 주' : '이번 달';

  return { saju, todayPillar, ohaengAnalysis, mbtiProfile, dateStr, dayOfWeek, periodLabel };
}

async function callFortuneApi(systemPrompt: string, userPrompt: string, payload: Record<string, unknown>): Promise<unknown> {
  const base = apiBase();
  const url = `${base}/api/fortune`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, systemPrompt, userPrompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `요청 실패 (${res.status})`);
  }

  return res.json();
}

// --- 1단계: 하이라이트 (가장 좋은 운 + 조심할 운) ---

export async function requestFortuneHighlight(
  info: UserInfo,
  mbti: MbtiType | null,
  period: FortunePeriod = 'today'
): Promise<FortuneHighlight> {
  const cacheKey = getCacheKey(info, mbti, period, 'highlight');
  const cached = getCache<FortuneHighlight>(cacheKey);
  if (cached) return cached;

  const seed = getVariationSeed(info, mbti);
  const ctx = getSajuContext(info, mbti, period);
  const systemPrompt = buildHighlightSystemPrompt(ctx.mbtiProfile, ctx.periodLabel, seed);
  const userPrompt = buildUserPrompt({ info, mbti, ...ctx, period });

  const result = await callFortuneApi(systemPrompt, userPrompt, {
    info, mbti, period,
    saju: ctx.saju.summary,
    ohaengBalance: ctx.saju.ohaengBalance,
    todayPillar: `${ctx.todayPillar.cheonganHanja}${ctx.todayPillar.jijiHanja}`,
  }) as FortuneHighlight;

  // 행운숫자는 AI 대신 코드에서 시드 기반 1~45 랜덤 배정
  result.lucky.number = (seed % 45) + 1;

  setCache(cacheKey, result);
  return result;
}

// --- 2단계: 나머지 2개 운세만 호출 ---

export async function requestFortuneFull(
  info: UserInfo,
  mbti: MbtiType | null,
  period: FortunePeriod = 'today',
  excludeCategories?: FortuneCategory[]
): Promise<FortuneResult> {
  const cacheKey = getCacheKey(info, mbti, period, 'full');
  const cached = getCache<FortuneResult>(cacheKey);
  if (cached) return cached;

  const ctx = getSajuContext(info, mbti, period);
  const remaining = excludeCategories
    ? (['overall', 'love', 'money', 'health'] as FortuneCategory[]).filter(c => !excludeCategories.includes(c))
    : ['overall', 'love', 'money', 'health'] as FortuneCategory[];
  const systemPrompt = buildFullSystemPrompt(ctx.mbtiProfile, ctx.periodLabel, remaining);
  const userPrompt = buildUserPrompt({ info, mbti, ...ctx, period });

  const result = await callFortuneApi(systemPrompt, userPrompt, {
    info, mbti, period,
    saju: ctx.saju.summary,
    ohaengBalance: ctx.saju.ohaengBalance,
    todayPillar: `${ctx.todayPillar.cheonganHanja}${ctx.todayPillar.jijiHanja}`,
  }) as FortuneResult;

  setCache(cacheKey, result);
  return result;
}

// --- 프롬프트 빌더 ---

const FRIENDLY_TONE = `## 말투 & 톤
- 사주 잘 아는 친한 언니/오빠가 카페에서 재밌게 풀어주는 느낌으로 작성하세요.
- "~해요", "~거든요", "~네요" 등 부드러운 구어체를 사용하세요.
- 딱딱한 해설 대신, 공감과 응원이 담긴 말투로 전달하세요.
- "오늘의 일진이 甲辰으로" 같은 사주 용어 나열은 하지 마세요. 일반인이 읽기 쉬운 말로만 풀어주세요.
- 사주 분석 결과를 바탕으로 하되, 한자나 오행 용어를 직접 언급하지 마세요.
- MBTI가 있으면 그 유형의 강점·약점·행동 특성을 운세에 구체적으로 녹여주세요.`;

function buildMbtiSection(
  mbtiProfile: (typeof MBTI_PROFILES)[keyof typeof MBTI_PROFILES] | null,
): string {
  if (!mbtiProfile) {
    return `
## 일반 해석 모드
사용자가 MBTI를 선택하지 않았습니다.
- "MBTI", "성향", "유형" 등 MBTI 관련 단어를 절대 사용하지 마세요.
- 범용적이면서도 따뜻한 말투로 해석하세요.
- 20~30대가 공감할 수 있는 친근한 어조를 사용하세요.
- mbtiInsight는 반드시 빈 문자열("")로 출력하세요.`;
  }

  return `
## MBTI 맞춤 해석 가이드
사용자의 MBTI: ${mbtiProfile.type} (${mbtiProfile.label} — ${mbtiProfile.nickname})

### 성격 특성
- 핵심가치: ${mbtiProfile.values.join(', ')}
- 강점: ${mbtiProfile.strengths}
- 약점: ${mbtiProfile.weaknesses}
- 톤앤매너: ${mbtiProfile.tone}

### 운세별 해석 관점
- 총운: ${mbtiProfile.overallLens}
- 애정운: ${mbtiProfile.loveLens}
- 금전운: ${mbtiProfile.moneyLens}
- 건강운: ${mbtiProfile.healthLens}

### MBTI 반영 규칙 (매우 중요!)
1. 각 운세에 이 유형의 강점 또는 약점을 구체적으로 언급하세요.
2. 약점을 보완하는 실천 가능한 조언을 포함하세요.
3. 이 유형이 실생활에서 겪을 법한 구체적 상황 예시를 반드시 넣으세요.
   ${mbtiProfile.behaviorTips}
4. 사용자 이름을 넣어서 "OO님은 ${mbtiProfile.type} 특유의 [강점/약점]이 있으니..." 형태로 개인화하세요.
5. 사주 한자 용어(甲辰, 木火 등)를 직접 쓰지 마세요. 쉬운 말로만 풀어주세요.`;
}

function buildHighlightSystemPrompt(
  mbtiProfile: (typeof MBTI_PROFILES)[keyof typeof MBTI_PROFILES] | null,
  periodLabel: string,
  seed: number = 0
): string {
  const mbtiSection = buildMbtiSection(mbtiProfile);
  const shuffledColors = shuffleWithSeed(ALL_COLORS, seed);
  const shuffledCats = shuffleWithSeed(ALL_CATEGORIES, seed);
  const suggestedBest = shuffledCats[0];
  const suggestedCaution = shuffledCats[1];
  const luckyNumRange = [(seed % 90) + 1, ((seed * 7) % 90) + 1, ((seed * 13) % 90) + 1];
  const colorList = shuffledColors.join(', ');

  return `당신은 "명리연구소"의 수석 사주 분석가입니다.
동양 철학(사주명리학)에 깊은 이해를 가지고 있으며, 현대인의 언어로 사주를 쉽고 따뜻하게 풀어줍니다.

${FRIENDLY_TONE}

## 핵심 원칙
1. 사주팔자의 천간·지지·오행 조합을 정확히 분석합니다.
2. 오늘의 일진(日辰)과 사용자 사주의 상호작용을 구체적으로 해석합니다.
3. 매번 다른 구체적인 내용을 제공합니다. 일반론 금지.
4. 시간, 숫자, 방향 등 구체적인 가이드를 포함합니다.
5. 부정적인 운세도 긍정적 조언과 함께 전달합니다.
${mbtiSection}

## 임무
총운/애정운/금전운/건강운 중에서:
- 사주 오행 분석 결과에 따라 가장 좋은 운세 1개를 골라서 상세히 풀어주세요 (왜 좋은지, 어떻게 활용하면 좋은지)
- 가장 조심해야 할 운세 1개를 골라서 따뜻하게 조언해주세요 (구체적 상황 + 대처법 + 긍정적 전환 포인트까지 포함)

## 중요: 다양성 규칙 (반드시 따르세요)
- bestCategory는 "${suggestedBest}"를, cautionCategory는 "${suggestedCaution}"를 우선 고려하세요. 단, 사주 분석 결과가 강하게 다른 카테고리를 가리키면 변경 가능합니다.
- 행운 색상은 아래 목록에서 앞쪽에 있는 색상을 우선 고려하세요.
- 행운 숫자는 ${luckyNumRange.join(', ')} 중 사주에 가장 어울리는 것을 선택하세요.
- 행운 방향은 동/서/남/북/동남/동북/서남/서북 중에서 사주 오행에 맞게 선택하세요.

## 문체 규칙
- 각 운세 문단 시작이나 핵심 포인트에 적절한 이모지를 1~2개 자연스럽게 넣으세요. (예: 💰 금전운이 활짝 열리는 날이에요! / ⚡ 오늘은 에너지가 넘치는 하루!)
- 이모지는 문맥에 맞게 자연스럽게, 과하지 않게 사용하세요.
- [절대 규칙] "오전/오후 N시~N시" 같은 구체적 시간대는 bestSummary 또는 cautionSummary 중 딱 1곳에서만 사용하세요. bestDetail, cautionDetail에도 시간대를 넣지 마세요. 시간 언급은 전체 응답에서 최대 1회만 허용됩니다.

## 출력 형식 (반드시 이 JSON 형식으로)
{
  "summaryLine": "${periodLabel}의 핵심 한줄 메시지 (30자 이내, 친근한 톤, 이모지 1개 포함)",
  "score": ${periodLabel} 운세 점수 (${(seed % 46) + 50}~${(seed % 46) + 55} 범위에서 사주에 맞게),
  "bestCategory": "가장 좋은 운세 카테고리 (${suggestedBest}를 우선 고려, 사주가 강하게 가리키면 변경 가능)",
  "bestSummary": "가장 좋은 운세 요약 (5~6문장, 이모지 포함, 구체적 상황 예시 + MBTI 맞춤 조언, 친근한 톤)",
  "bestDetail": "가장 좋은 운세 상세 해석 (7~8문장, MBTI 관점 실천 팁 + 구체적 시간대/장소 추천, 읽기 쉬운 말)",
  "cautionCategory": "조심할 운세 카테고리 (${suggestedCaution}를 우선 고려, bestCategory와 달라야 함)",
  "cautionSummary": "조심할 운세 요약 (5~6문장, 이모지 포함, 구체적으로 어떤 상황을 조심해야 하는지 + 왜 조심해야 하는지 + MBTI 특성상 빠지기 쉬운 함정 언급 + 구체적 대처법)",
  "cautionDetail": "조심할 운세 상세 (7~8문장, 이렇게 하면 괜찮아요 식의 긍정적 전환 + 피해야 할 시간대/행동 + 대신 하면 좋은 것)",
  "lucky": {
    "color": "다음 중 앞쪽 색상을 우선 고려: ${colorList}",
    "colorHex": "선택한 색상의 정확한 hex 코드",
    "number": "${luckyNumRange.join(', ')} 중 사주에 어울리는 숫자 선택",
    "direction": "행운 방향 (동/서/남/북/동남/동북/서남/서북 중 사주 오행에 맞는 방향)",
    "item": "행운 아이템 (사주 오행의 부족한 기운을 채워주는 구체적 아이템)"
  },
  "mbtiInsight": "MBTI 기반 특별 인사이트 한줄 (MBTI 없으면 빈 문자열)"
}`;
}

const CATEGORY_NAMES: Record<FortuneCategory, string> = {
  overall: '총운', love: '애정운', money: '금전운', health: '건강운',
};

function buildFullSystemPrompt(
  mbtiProfile: (typeof MBTI_PROFILES)[keyof typeof MBTI_PROFILES] | null,
  periodLabel: string,
  categories: FortuneCategory[] = ['overall', 'love', 'money', 'health']
): string {
  const mbtiSection = buildMbtiSection(mbtiProfile);
  const catList = categories.map(c => CATEGORY_NAMES[c]).join(', ');

  const fields = categories.map(c => {
    return `  "${c}": "${periodLabel} ${CATEGORY_NAMES[c]} (4~5문장, 이모지 포함, MBTI 맞춤 구체적 상황 예시)",
  "${c}Detail": "${CATEGORY_NAMES[c]} 상세 (6~7문장, MBTI 관점 실천 팁 포함)"`;
  }).join(',\n');

  return `당신은 "명리연구소"의 수석 사주 분석가입니다.
동양 철학(사주명리학)에 깊은 이해를 가지고 있으며, 현대인의 언어로 사주를 쉽고 따뜻하게 풀어줍니다.

${FRIENDLY_TONE}

## 핵심 원칙
1. 사주팔자의 천간·지지·오행 조합을 정확히 분석합니다.
2. 오늘의 일진(日辰)과 사용자 사주의 상호작용을 구체적으로 해석합니다.
3. 매번 다른 구체적인 내용을 제공합니다. 일반론 금지.
4. 시간, 숫자, 방향 등 구체적인 가이드를 포함합니다.
5. 부정적인 운세도 긍정적 조언과 함께 전달합니다.
${mbtiSection}

## 임무
다음 운세만 분석하세요: ${catList}
(다른 카테고리는 이미 분석 완료되었으므로 생략합니다)

## 문체 규칙
- 각 운세 문단 시작이나 핵심 포인트에 적절한 이모지를 1~2개 자연스럽게 넣으세요.
- 사주 한자 용어(甲辰, 木火 등)를 직접 쓰지 마세요. 쉬운 말로만 풀어주세요.
- [절대 규칙] "오전/오후 N시~N시" 같은 구체적 시간대는 전체 응답에서 최대 1회만 허용됩니다. 2개 운세 중 1개에서만 시간대를 언급하고, 나머지는 시간대 없이 조언만 하세요. Detail에도 시간대를 넣지 마세요.

## 출력 형식 (반드시 이 JSON 형식으로)
{
${fields}
}`;
}

// --- 유저 프롬프트 (공통) ---

interface PromptArgs {
  info: UserInfo;
  mbti: MbtiType | null;
  mbtiProfile: (typeof MBTI_PROFILES)[keyof typeof MBTI_PROFILES] | null;
  saju: ReturnType<typeof calculateSaju>;
  todayPillar: ReturnType<typeof getTodayDayPillar>;
  ohaengAnalysis: ReturnType<typeof analyzeOhaeng>;
  dateStr: string;
  dayOfWeek: string;
  period: FortunePeriod;
  periodLabel: string;
}

function buildUserPrompt(args: PromptArgs): string {
  const {
    info, mbti, saju, todayPillar, ohaengAnalysis,
    dateStr, dayOfWeek, periodLabel,
  } = args;

  const gender = info.gender === 'male' ? '남성' : info.gender === 'female' ? '여성' : '기타';

  const ohaengStr = ohaengAnalysis.balance
    .map(([name, count]: [string, number]) => `${name}(${count})`)
    .join(', ');

  return `## 분석 대상
- 이름: ${info.name}
- 성별: ${gender}
- 생년월일: ${info.birthDate}
- 생시: ${info.birthSijin ?? '모름'}
- MBTI: ${mbti ?? '미입력'}

## 사주팔자 정보
- 사주: ${saju.summary}
- 년주: ${saju.year.cheonganHanja}${saju.year.jijiHanja} (${saju.year.ohaeng})
- 월주: ${saju.month.cheonganHanja}${saju.month.jijiHanja} (${saju.month.ohaeng})
- 일주: ${saju.day.cheonganHanja}${saju.day.jijiHanja} (${saju.day.ohaeng})
${saju.time ? `- 시주: ${saju.time.cheonganHanja}${saju.time.jijiHanja} (${saju.time.ohaeng})` : '- 시주: 미상'}
- 오행 분포: ${ohaengStr}
- 가장 강한 오행: ${ohaengAnalysis.strongest[0]}(${ohaengAnalysis.strongest[1]})
- 가장 약한 오행: ${ohaengAnalysis.weakest[0]}(${ohaengAnalysis.weakest[1]})

## 운세 날짜
- ${dateStr} (${dayOfWeek}요일)
- 일진: ${todayPillar.cheonganHanja}${todayPillar.jijiHanja}
- 기간: ${periodLabel}

위 사주팔자와 일진을 기반으로 ${periodLabel} 운세를 분석해주세요.
오행 간의 상생·상극 관계, 일진과 일주의 관계를 구체적으로 반영하세요.
반드시 JSON 형식으로만 응답하세요.`;
}

// ============================================================
// 띠별운세
// ============================================================

export async function requestZodiacFortune(input: ZodiacInput): Promise<ZodiacResult> {
  const today = new Date().toISOString().slice(0, 10);
  const year = parseInt(input.birthYear, 10);
  const monthN = input.birthMonth ? parseInt(input.birthMonth, 10) : undefined;
  const dayN = input.birthDay ? parseInt(input.birthDay, 10) : undefined;
  const zodiacInfo = getZodiacByDate(year, monthN, dayN, input.criterion ?? 'solar');
  const animal = zodiacInfo.animal;
  const cacheKey = `zodiac:${animal.name}:${today}`;
  const cached = getCache<ZodiacResult>(cacheKey);
  if (cached) return cached;
  const todayPillar = getTodayDayPillar();
  const gender = input.gender === 'male' ? '남성' : input.gender === 'female' ? '여성' : '기타';

  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];

  const seed = simpleHash(`${animal.name}:${today}`);

  const systemPrompt = `당신은 "명리연구소"의 띠별 운세 전문가입니다.
12간지(12지신)에 대한 깊은 이해를 바탕으로 따뜻하고 친근하게 운세를 풀어줍니다.

${FRIENDLY_TONE}

## 핵심 원칙
1. ${animal.name}띠의 특성과 오늘의 일진(${todayPillar.cheonganHanja}${todayPillar.jijiHanja})의 상호작용을 분석합니다.
2. ${animal.name}띠(${animal.hanja}, ${animal.element}행)와 오늘 일진의 상생·상극 관계를 반영합니다.
3. 40~60대 사용자가 많으므로 존댓말로 따뜻하고 친근하게 작성하세요.
4. "~하실 거예요", "~해보세요", "~좋으실 거예요" 같은 존칭 구어체를 사용하세요.
5. 사주 한자 용어는 사용하지 마세요. 일반인이 읽기 쉬운 말로만 풀어주세요.
6. 구체적인 상황 예시와 실천 가능한 조언을 포함하세요.

## 단일 핵심 운세 원칙 (매우 중요)
- 띠별 운세는 "오늘의 사주풀이"와 차별화하기 위해 **딱 한 가지 운세**만 깊고 구체적으로 풀어드립니다.
- 오늘 일진과 ${animal.name}띠의 상호작용에서 **가장 영향이 큰 영역 한 가지**를 골라주세요.
- 선택 가능한 영역: "love"(애정/관계), "money"(금전/재물), "health"(건강), "work"(일/사회운), "overall"(전반)
- 선택한 영역의 풀이는 평소보다 훨씬 깊이 있게: 8~10문장, 구체적 상황 2~3개 예시, 실천 조언 포함.
- 절대로 4가지 운세를 모두 나열하지 마세요. 하나만 깊게.

## 출력 형식 (반드시 이 JSON, 다른 필드 추가 금지)
{
  "summaryLine": "오늘의 핵심 한줄 (25자 이내, 이모지 1개, 존댓말)",
  "score": 오늘의 운세 점수 (${(seed % 36) + 55}~${(seed % 36) + 65} 범위),
  "keywords": ["오늘의 핵심 키워드 3~4개 (각 2~5자, 명사형, 본문에서 도출)"],
  "primaryCategory": "love" | "money" | "health" | "work" | "overall" 중 하나,
  "primaryTitle": "오늘의 핵심 - OO운 (예: '오늘의 핵심 - 금전운')",
  "primaryBody": "선택한 영역의 핵심 풀이 (8~10문장, 이모지 1~2개, 구체적 상황 예시, ${animal.name}띠 특성 반영)",
  "primaryDetail": "추가 실천 조언과 디테일 (4~5문장, 오늘 하루 어떻게 행동하면 좋은지)",
  "advice": "오늘 하루를 위한 따뜻한 응원 한 단락 (3~4문장)"
}`;

  const userPrompt = `## 분석 대상
- 이름: ${input.name}
- 성별: ${gender}
- 출생년도: ${input.birthYear}년
- 띠: ${animal.name}띠 (${animal.hanja}, ${animal.element}행)
- 띠 이모지: ${animal.emoji}

## 운세 날짜
- ${dateStr} (${dayOfWeek}요일)
- 오늘의 일진: ${todayPillar.cheonganHanja}${todayPillar.jijiHanja}

${animal.name}띠의 특성과 오늘 일진의 관계를 바탕으로 오늘의 띠별 운세를 분석해주세요.
반드시 JSON 형식으로만 응답하세요.`;

  const result = await callFortuneApi(systemPrompt, userPrompt, {
    type: 'zodiac', name: input.name, birthYear: input.birthYear,
  }) as ZodiacResult;

  result.animal = animal.name;
  result.emoji = animal.emoji;
  result.element = animal.element;

  setCache(cacheKey, result);
  return result;
}

// ============================================================
// 궁합보기
// ============================================================

export async function requestCompatibility(input: CompatInput): Promise<CompatResult> {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `compat:${input.person1.name}:${input.person1.birthYear}:${input.person2.name}:${input.person2.birthYear}:${today}`;
  const cached = getCache<CompatResult>(cacheKey);
  if (cached) return cached;

  const year1 = parseInt(input.person1.birthYear, 10);
  const year2 = parseInt(input.person2.birthYear, 10);
  const animal1 = getZodiacAnimal(year1);
  const animal2 = getZodiacAnimal(year2);
  const gender1 = input.person1.gender === 'male' ? '남성' : input.person1.gender === 'female' ? '여성' : '기타';
  const gender2 = input.person2.gender === 'male' ? '남성' : input.person2.gender === 'female' ? '여성' : '기타';

  const seed = simpleHash(`${input.person1.name}:${input.person1.birthYear}:${input.person2.name}:${input.person2.birthYear}:${today}`);

  const systemPrompt = `당신은 "명리연구소"의 궁합 전문가입니다.
12간지와 오행의 상생·상극 관계를 바탕으로 두 사람의 궁합을 따뜻하고 재미있게 풀어줍니다.

${FRIENDLY_TONE}

## 핵심 원칙
1. ${animal1.name}띠(${animal1.hanja}, ${animal1.element}행)와 ${animal2.name}띠(${animal2.hanja}, ${animal2.element}행)의 궁합을 분석합니다.
2. 오행의 상생·상극 관계를 기반으로 하되, 한자 용어는 쓰지 마세요.
3. 40~60대 사용자가 많으므로 따뜻한 존댓말을 사용하세요.
4. 부부, 가족, 연인 등 다양한 관계에 적용 가능하게 작성하세요.
5. 부정적인 면도 긍정적으로 전환하며 조언을 포함하세요.
6. 두 사람의 이름을 넣어 개인화된 느낌을 주세요.

## 점수 규칙
- 궁합 점수는 ${(seed % 26) + 65}~${(seed % 26) + 75} 범위에서 띠 궁합에 맞게 설정
- 상생 관계면 높게(80+), 상극이면 중간(65~75), 같은 띠면 75~85

## 출력 형식 (반드시 이 JSON)
{
  "score": 궁합 점수 (0~100),
  "loveScore": 애정 궁합 점수 (0~100, 전체 점수 ±10 범위 내),
  "moneyScore": 재물 궁합 점수 (0~100, 전체 점수 ±10 범위 내),
  "commScore": 소통 궁합 점수 (0~100, 전체 점수 ±10 범위 내),
  "elementRelation": "상생" | "상극" | "중성" 중 하나,
  "keywords": ["관계 핵심 키워드 3~4개 (각 2~5자, 명사형)"],
  "summaryLine": "궁합 핵심 한줄 (25자 이내, 이모지 1개, 존댓말)",
  "overall": "전체 궁합 (6~7문장, 두 띠의 조합이 만드는 시너지와 주의점, 이모지 포함)",
  "overallDetail": "전체 궁합 상세 (7~8문장, 구체적 상황 예시와 조언)",
  "love": "애정 궁합 (5~6문장, 감정적 교감과 소통 스타일 분석)",
  "money": "재물 궁합 (5~6문장, 함께하는 경제생활 조언)",
  "communication": "소통 궁합 (5~6문장, 갈등 해결법과 대화 팁)",
  "advice": "관계를 더 좋게 만드는 특별 조언 (4~5문장, 구체적 실천법, 응원과 격려)"
}`;

  const userPrompt = `## 궁합 분석 대상

### 첫 번째 분
- 이름: ${input.person1.name}
- 성별: ${gender1}
- 출생년도: ${input.person1.birthYear}년
- 띠: ${animal1.name}띠 (${animal1.emoji}, ${animal1.element}행)

### 두 번째 분
- 이름: ${input.person2.name}
- 성별: ${gender2}
- 출생년도: ${input.person2.birthYear}년
- 띠: ${animal2.name}띠 (${animal2.emoji}, ${animal2.element}행)

두 분의 띠별 궁합을 따뜻하고 재미있게 분석해주세요.
반드시 JSON 형식으로만 응답하세요.`;

  const result = await callFortuneApi(systemPrompt, userPrompt, {
    type: 'compatibility',
    person1: { name: input.person1.name, birthYear: input.person1.birthYear },
    person2: { name: input.person2.name, birthYear: input.person2.birthYear },
  }) as CompatResult;

  result.person1Animal = animal1.name;
  result.person1Emoji = animal1.emoji;
  result.person2Animal = animal2.name;
  result.person2Emoji = animal2.emoji;

  setCache(cacheKey, result);
  return result;
}

// ============================================================
// 꿈해몽
// ============================================================

/**
 * 꿈해몽 분석. userInfo가 채워져 있고 input.useSaju=true면 사주 결합 해석을 시도한다.
 * 캐싱은 의도적으로 적용하지 않음(같은 꿈을 다시 풀이할 일이 거의 없음).
 */
export async function requestDreamInterpretation(
  input: DreamInput,
  userInfo?: UserInfo | null,
): Promise<DreamResult> {
  const trimmed = input.text.trim();
  if (!trimmed) throw new Error('꿈 내용을 입력해 주세요.');

  const sajuFilled = !!(userInfo && userInfo.name && userInfo.birthDate);
  const useSaju = !!input.useSaju && sajuFilled;

  let sajuBlock = '';
  if (useSaju && userInfo) {
    const saju = calculateSaju(userInfo.birthDate, userInfo.birthSijin);
    const ohaeng = analyzeOhaeng(saju.ohaengBalance);
    const todayPillar = getTodayDayPillar();
    sajuBlock = `\n\n## 사주 정보 (참고용, 한자/오행 용어는 출력에 노출 금지)
- 이름: ${userInfo.name}
- 일주: ${saju.summary}
- 오행 균형: ${ohaeng}
- 오늘 일진: ${todayPillar.cheonganHanja}${todayPillar.jijiHanja}
위 정보를 바탕으로 "interpretation.sajuLinked" 필드에 이 사람의 사주 흐름과 꿈을 연결한 개인화 해석(2~3문장)을 작성하세요.`;
  }

  const systemPrompt = `당신은 한국 전통 해몽과 융 심리학을 모두 깊이 이해하는 "명리연구소"의 꿈 해석 전문가입니다.

${FRIENDLY_TONE}

## 핵심 원칙
1. 따뜻하고 친근한 존댓말 ("~할 수 있어요", "~의 의미일 수 있어요").
2. 단정짓지 마세요. 흉몽이어도 희망적 조언과 함께 전달하세요. 공포심 조장 금지.
3. 꿈에서 핵심 명사(사물·동물·장소·인물·행위)를 3~5개 추출합니다.
4. 각 키워드마다 한국 전통 꿈풀이 사물별 번호 사전(예: 고래·물·돈·불 등)에 근거해 1~45 사이 로또 번호를 2~3개 배정하고, 그 근거를 한 줄로 설명합니다.
5. 모든 로또 번호는 1 이상 45 이하 정수만 허용. 한 키워드 안에서 중복 금지.
6. 한자/오행 용어를 직접 노출하지 마세요. 사주 정보가 있으면 자연스럽게 풀어 설명만 하세요.
7. 모든 텍스트는 반드시 한국어로만 작성하세요. 영어 단어(abundance, luck 등) 사용 금지.
8. 반드시 아래 JSON 형식으로만 응답하세요. 다른 필드 추가 금지.

## 출력 JSON 형식
{
  "summary": "한 줄 요약 (20자 이내, 이모지 1개 가능)",
  "type": "길몽" | "흉몽" | "중립",
  "interpretation": {
    "traditional": "한국 전통 해몽 관점 풀이 (3~4문장)",
    "psychological": "융/현대 심리학 관점 풀이 (2~3문장)",
    "sajuLinked": "사주 결합 개인화 해석 (사주 정보가 주어졌을 때만, 2~3문장)"
  },
  "advice": "오늘의 조언 한 문장 (따뜻한 응원 톤)",
  "keywords": [
    {
      "word": "고래",
      "numbers": [7, 23],
      "reason": "전통 꿈풀이에서 큰 동물·풍요의 상징, 7은 행운수와 연결돼요"
    }
  ]
}`;

  const userPrompt = `## 꿈 내용
${trimmed}${sajuBlock}

위 꿈을 위 JSON 형식으로 해석해 주세요. 키워드 3~5개 추출, 각 키워드당 로또 번호 2~3개 배정 필수.`;

  const raw = await callFortuneApi(systemPrompt, userPrompt, {
    type: 'dream',
    useSaju,
  }) as Partial<DreamResult> & { keywords?: DreamResult['keywords'] };

  // --- 응답 검증/보정 ---
  const safeType: DreamResult['type'] =
    raw.type === '길몽' || raw.type === '흉몽' || raw.type === '중립' ? raw.type : '중립';

  const normalizedKeywords = normalizeKeywords(raw.keywords ?? []);
  const luckyNumbers = buildLottoSets(normalizedKeywords);

  return {
    summary: raw.summary || '꿈의 메시지를 살펴봤어요',
    type: safeType,
    interpretation: {
      traditional: raw.interpretation?.traditional || '',
      psychological: raw.interpretation?.psychological || '',
      sajuLinked: useSaju ? raw.interpretation?.sajuLinked : undefined,
    },
    advice: raw.advice || '오늘 하루도 평안하시길 바라요.',
    keywords: normalizedKeywords,
    luckyNumbers,
    sajuLinked: useSaju && !!raw.interpretation?.sajuLinked,
  };
}
