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

/**
 * 사주 + MBTI 기반 AI 운세 요청
 */
export async function requestFortune(
  info: UserInfo,
  mbti: MbtiType | null,
  period: FortunePeriod = 'today'
): Promise<FortuneResult> {
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

  return res.json() as Promise<FortuneResult>;
}

function buildSystemPrompt(
  mbtiProfile: (typeof MBTI_PROFILES)[keyof typeof MBTI_PROFILES] | null,
  periodLabel: string
): string {
  const mbtiSection = mbtiProfile
    ? `

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
사주의 오행 에너지를 이 유형의 강점·약점과 연결해서 설명하세요.`
    : `
## 일반 해석 모드
MBTI 정보가 없으므로 범용적이면서도 따뜻한 말투로 해석합니다.
20~30대가 공감할 수 있는 친근한 어조를 사용하세요.`;

  return `당신은 "명리연구소"의 수석 사주 분석가입니다.
동양 철학(사주명리학)에 깊은 이해를 가지고 있으며, 현대인의 언어로 사주를 쉽고 따뜻하게 풀어줍니다.

## 핵심 원칙
1. 사주팔자의 천간·지지·오행 조합을 정확히 분석합니다.
2. 오늘의 일진(日辰)과 사용자 사주의 상호작용을 구체적으로 해석합니다.
3. 매번 다른 구체적인 내용을 제공합니다. 일반론 금지.
4. 시간, 숫자, 방향 등 구체적인 가이드를 포함합니다.
5. 20~30대가 공감할 수 있는 친근하면서도 전문적인 톤을 유지합니다.
6. 부정적인 운세도 긍정적 조언과 함께 전달합니다.
${mbtiSection}

## 출력 형식 (반드시 이 JSON 형식으로)
{
  "summaryLine": "${periodLabel}의 핵심 한줄 메시지 (30자 이내)",
  "overall": "${periodLabel} 총운 (3~4문장, 구체적)",
  "love": "${periodLabel} 애정운 (3~4문장, 구체적)",
  "money": "${periodLabel} 금전운 (3~4문장, 구체적)",
  "health": "${periodLabel} 건강운 (3~4문장, 구체적)",
  "overallDetail": "총운 상세 해석 (오행 분석 포함, 5~6문장)",
  "loveDetail": "애정운 상세 해석 (5~6문장)",
  "moneyDetail": "금전운 상세 해석 (5~6문장)",
  "healthDetail": "건강운 상세 해석 (5~6문장)",
  "lucky": {
    "color": "세련된 행운 색상 이름 (예: 코발트블루, 인디고핑크, 올리브그린, 버건디레드, 샴페인골드, 라벤더퍼플, 민트그린, 피치코랄 등)",
    "colorHex": "해당 색상의 정확한 hex 코드",
    "number": 행운 숫자,
    "direction": "행운 방향",
    "item": "행운 아이템"
  },
  "score": ${periodLabel} 운세 점수 (50~95 사이 정수),
  "mbtiInsight": "MBTI 기반 특별 인사이트 한줄 (MBTI 없으면 빈 문자열)"
}`;
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
