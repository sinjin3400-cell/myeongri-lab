import type { FortuneResult, FortunePeriod, UserInfo } from './types';
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

function getCacheKey(info: UserInfo, mbti: MbtiType | null, period: FortunePeriod): string {
  const today = new Date().toISOString().slice(0, 10);
  return `fortune:${info.birthDate}:${info.birthSijin ?? 'x'}:${info.gender}:${mbti ?? 'none'}:${period}:${today}`;
}

function getCache(key: string): FortuneResult | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as FortuneResult;
  } catch {
    return null;
  }
}

function setCache(key: string, data: FortuneResult): void {
  try {
    // 오래된 캐시 정리 (오늘 날짜가 아닌 것)
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

/**
 * 사주 + MBTI 기반 AI 운세 요청 (캐싱 지원)
 */
export async function requestFortune(
  info: UserInfo,
  mbti: MbtiType | null,
  period: FortunePeriod = 'today'
): Promise<FortuneResult> {
  // 캐시 확인
  const cacheKey = getCacheKey(info, mbti, period);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const base = apiBase();
  const url = `${base}/api/fortune`;

  // 사주팔자 계산
  const saju = calculateSaju(
    info.birthDate,
    info.birthSijin
  );
  const todayPillar = getTodayDayPillar();
  const ohaengAnalysis = analyzeOhaeng(saju.ohaengBalance);

  // MBTI 프로필
  const mbtiProfile = mbti ? MBTI_PROFILES[mbti] : null;

  // 오늘 날짜
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  // 기간별 라벨
  const periodLabel = period === 'today' ? '오늘' : period === 'week' ? '이번 주' : '이번 달';

  // 프롬프트 구성
  const systemPrompt = buildSystemPrompt(mbtiProfile, periodLabel);
  const userPrompt = buildUserPrompt({
    info,
    mbti,
    mbtiProfile,
    saju,
    todayPillar,
    ohaengAnalysis,
    dateStr,
    dayOfWeek,
    period,
    periodLabel,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      info,
      mbti,
      period,
      saju: saju.summary,
      ohaengBalance: saju.ohaengBalance,
      todayPillar: `${todayPillar.cheonganHanja}${todayPillar.jijiHanja}`,
      systemPrompt,
      userPrompt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `요청 실패 (${res.status})`);
  }

  const result = await res.json() as FortuneResult;
  setCache(cacheKey, result);
  return result;
}

function buildSystemPrompt(
  mbtiProfile: (typeof MBTI_PROFILES)[keyof typeof MBTI_PROFILES] | null,
  periodLabel: string
): string {
  const mbtiSection = mbtiProfile
    ? `
## MBTI: ${mbtiProfile.type} (${mbtiProfile.nickname})
톤: ${mbtiProfile.tone} | 핵심가치: ${mbtiProfile.values.join(', ')}
해석관점 — 총운: ${mbtiProfile.overallLens} / 애정: ${mbtiProfile.loveLens} / 금전: ${mbtiProfile.moneyLens} / 건강: ${mbtiProfile.healthLens}
말투: ${mbtiProfile.promptStyle}
→ 이 MBTI 관점과 말투로 자연스럽게 해석하고, 오행을 유형의 강점·약점과 연결하세요.`
    : `
## 일반 모드: 따뜻하고 친근한 20~30대 어조로 해석`;

  return `당신은 "명리연구소" 수석 사주 분석가입니다. 사주명리학을 현대적 언어로 쉽고 따뜻하게 풀어줍니다.

## 원칙
- 천간·지지·오행 조합과 일진의 상호작용을 구체적으로 해석
- 시간, 숫자, 방향 등 구체적 가이드 포함
- 20~30대 친근한 톤, 부정적 운세도 긍정 조언과 함께 전달
${mbtiSection}

## JSON 출력 형식
{"summaryLine":"${periodLabel} 핵심 한줄 (30자 이내)","overall":"${periodLabel} 총운 (3문장)","love":"애정운 (3문장)","money":"금전운 (3문장)","health":"건강운 (3문장)","overallDetail":"총운 상세 (오행 포함 4문장)","loveDetail":"애정 상세 (4문장)","moneyDetail":"금전 상세 (4문장)","healthDetail":"건강 상세 (4문장)","lucky":{"color":"세련된 색상명","colorHex":"hex코드","number":숫자,"direction":"방향","item":"아이템"},"score":50~95정수,"mbtiInsight":"MBTI 인사이트 한줄 (없으면 빈 문자열)"}`;
}

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
    .map(([name, count]) => `${name}(${count})`)
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
