import type { FortuneResult, FortuneHighlight, FortunePeriod, UserInfo } from './types';
import { calculateSaju, analyzeOhaeng, getTodayDayPillar } from './utils/saju';
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
  return `fortune:${phase}:${info.birthDate}:${info.birthSijin ?? 'x'}:${info.gender}:${mbti ?? 'none'}:${period}:${today}`;
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

// --- 공통 유틸 ---

function getSajuContext(info: UserInfo, mbti: MbtiType | null, period: FortunePeriod) {
  const saju = calculateSaju(info.birthDate, info.birthSijin);
  const todayPillar = getTodayDayPillar();
  const ohaengAnalysis = analyzeOhaeng(saju.ohaengBalance);
  const mbtiProfile = mbti ? MBTI_PROFILES[mbti] : null;

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];
  const periodLabel = period === 'today' ? '오늘' : period === 'week' ? '이번 주' : '이번 달';

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

  const ctx = getSajuContext(info, mbti, period);
  const systemPrompt = buildHighlightSystemPrompt(ctx.mbtiProfile, ctx.periodLabel);
  const userPrompt = buildUserPrompt({ info, mbti, ...ctx, period });

  const result = await callFortuneApi(systemPrompt, userPrompt, {
    info, mbti, period,
    saju: ctx.saju.summary,
    ohaengBalance: ctx.saju.ohaengBalance,
    todayPillar: `${ctx.todayPillar.cheonganHanja}${ctx.todayPillar.jijiHanja}`,
  }) as FortuneHighlight;

  setCache(cacheKey, result);
  return result;
}

// --- 2단계: 전체 운세 ---

export async function requestFortuneFull(
  info: UserInfo,
  mbti: MbtiType | null,
  period: FortunePeriod = 'today'
): Promise<FortuneResult> {
  const cacheKey = getCacheKey(info, mbti, period, 'full');
  const cached = getCache<FortuneResult>(cacheKey);
  if (cached) return cached;

  const ctx = getSajuContext(info, mbti, period);
  const systemPrompt = buildFullSystemPrompt(ctx.mbtiProfile, ctx.periodLabel);
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
- MBTI가 있으면 그 유형이 실생활에서 겪을 법한 구체적인 상황 예시를 반드시 포함하세요.
  예) INTJ: "혼자 조용히 카페에서 계획 세우는 시간이 오늘 행운의 열쇠예요"
  예) ENFP: "갑자기 떠오른 아이디어, 오늘은 바로 실행해보세요! 뜻밖의 좋은 결과가 있을 거예요"
  예) ISFJ: "가까운 사람한테 따뜻한 한마디 건네보세요, 그게 오늘 당신의 운을 더 좋게 만들어줄 거예요"`;

function buildMbtiSection(
  mbtiProfile: (typeof MBTI_PROFILES)[keyof typeof MBTI_PROFILES] | null,
): string {
  if (!mbtiProfile) {
    return `
## 일반 해석 모드
MBTI 정보가 없으므로 범용적이면서도 따뜻한 말투로 해석합니다.
20~30대가 공감할 수 있는 친근한 어조를 사용하세요.`;
  }

  return `
## MBTI 맞춤 해석 가이드
사용자의 MBTI: ${mbtiProfile.type} (${mbtiProfile.label} — ${mbtiProfile.nickname})
- 톤앤매너: ${mbtiProfile.tone}
- 핵심가치: ${mbtiProfile.values.join(', ')}
- 총운 해석 관점: ${mbtiProfile.overallLens}
- 애정운 해석 관점: ${mbtiProfile.loveLens}
- 금전운 해석 관점: ${mbtiProfile.moneyLens}
- 건강운 해석 관점: ${mbtiProfile.healthLens}
- 말투 스타일: ${mbtiProfile.promptStyle}

중요: 모든 운세 해석을 이 MBTI 유형의 관점과 말투에 맞게 자연스럽게 풀어주세요.
${mbtiProfile.type} 유형이 특히 공감할 수 있는 표현과 조언을 사용하세요.
사주의 오행 에너지를 이 유형의 강점·약점과 연결해서 설명하세요.
반드시 이 MBTI 유형이 실생활에서 겪을 법한 구체적인 상황 예시를 각 운세에 포함하세요.`;
}

function buildHighlightSystemPrompt(
  mbtiProfile: (typeof MBTI_PROFILES)[keyof typeof MBTI_PROFILES] | null,
  periodLabel: string
): string {
  const mbtiSection = buildMbtiSection(mbtiProfile);

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
- 가장 좋은 운세 1개를 골라서 상세히 풀어주세요 (왜 좋은지, 어떻게 활용하면 좋은지)
- 가장 조심해야 할 운세 1개를 골라서 따뜻하게 조언해주세요 (구체적 대처법 포함)

## 출력 형식 (반드시 이 JSON 형식으로)
{
  "summaryLine": "${periodLabel}의 핵심 한줄 메시지 (30자 이내, 친근한 톤)",
  "score": ${periodLabel} 운세 점수 (50~95 사이 정수),
  "bestCategory": "가장 좋은 운세 카테고리 (overall/love/money/health 중 하나)",
  "bestSummary": "가장 좋은 운세 요약 (4~5문장, 구체적 상황 예시 포함, 친근한 톤)",
  "bestDetail": "가장 좋은 운세 상세 해석 (6~7문장, 오행 분석 + MBTI 관점 + 실천 팁)",
  "cautionCategory": "조심할 운세 카테고리 (overall/love/money/health 중 하나, bestCategory와 달라야 함)",
  "cautionSummary": "조심할 운세 요약 (4~5문장, 따뜻한 조언 톤, 구체적 대처법)",
  "cautionDetail": "조심할 운세 상세 해석 (6~7문장, 오행 분석 + 긍정적 전환 포인트)",
  "lucky": {
    "color": "세련된 행운 색상 이름 (예: 코발트블루, 샴페인골드, 라벤더퍼플, 민트그린 등)",
    "colorHex": "해당 색상의 정확한 hex 코드",
    "number": 행운 숫자,
    "direction": "행운 방향",
    "item": "행운 아이템"
  },
  "mbtiInsight": "MBTI 기반 특별 인사이트 한줄 (MBTI 없으면 빈 문자열)"
}`;
}

function buildFullSystemPrompt(
  mbtiProfile: (typeof MBTI_PROFILES)[keyof typeof MBTI_PROFILES] | null,
  periodLabel: string
): string {
  const mbtiSection = buildMbtiSection(mbtiProfile);

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

## 출력 형식 (반드시 이 JSON 형식으로)
{
  "summaryLine": "${periodLabel}의 핵심 한줄 메시지 (30자 이내)",
  "overall": "${periodLabel} 총운 (3~4문장, 구체적 상황 예시 포함)",
  "love": "${periodLabel} 애정운 (3~4문장, 구체적 상황 예시 포함)",
  "money": "${periodLabel} 금전운 (3~4문장, 구체적 상황 예시 포함)",
  "health": "${periodLabel} 건강운 (3~4문장, 구체적 상황 예시 포함)",
  "overallDetail": "총운 상세 해석 (오행 분석 포함, 5~6문장)",
  "loveDetail": "애정운 상세 해석 (5~6문장)",
  "moneyDetail": "금전운 상세 해석 (5~6문장)",
  "healthDetail": "건강운 상세 해석 (5~6문장)",
  "lucky": {
    "color": "세련된 행운 색상 이름 (예: 코발트블루, 샴페인골드, 라벤더퍼플, 민트그린 등)",
    "colorHex": "해당 색상의 정확한 hex 코드",
    "number": 행운 숫자,
    "direction": "행운 방향",
    "item": "행운 아이템"
  },
  "score": ${periodLabel} 운세 점수 (50~95 사이 정수),
  "mbtiInsight": "MBTI 기반 특별 인사이트 한줄 (MBTI 없으면 빈 문자열)"
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

## 오늘의 운세 날짜
- ${dateStr} (${dayOfWeek}요일)
- 오늘의 일진: ${todayPillar.cheonganHanja}${todayPillar.jijiHanja}
- 기간: ${periodLabel}

위 사주팔자와 오늘의 일진을 기반으로 ${periodLabel} 운세를 분석해주세요.
오행 간의 상생·상극 관계, 일진과 일주의 관계를 구체적으로 반영하세요.
반드시 JSON 형식으로만 응답하세요.`;
}
