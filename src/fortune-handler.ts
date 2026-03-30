/**
 * 명리연구소 — 서버 API 핸들러 (Express / Hono / Next.js 등에서 사용)
 *
 * POST /api/fortune
 *
 * 클라이언트에서 보내는 body:
 * {
 *   info: UserInfo,
 *   mbti: MbtiType | null,
 *   period: FortunePeriod,
 *   saju: string,
 *   ohaengBalance: Record<string, number>,
 *   todayPillar: string,
 *   systemPrompt: string,
 *   userPrompt: string,
 * }
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FortuneRequestBody {
  info: {
    name: string;
    birthDate: string;
    gender: string;
    birthSijin: string | null;
    birthTimeUnknown: boolean;
  };
  mbti: string | null;
  period: 'today' | 'week' | 'month';
  saju: string;
  ohaengBalance: Record<string, number>;
  todayPillar: string;
  systemPrompt: string;
  userPrompt: string;
}

export async function handleFortuneRequest(body: FortuneRequestBody) {
  const { systemPrompt, userPrompt } = body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답이 비어있어요.');
    }

    const result = JSON.parse(content);

    // 유효성 검증 및 기본값 보정
    return {
      overall: result.overall || '오늘 하루도 좋은 에너지가 함께해요.',
      love: result.love || '사랑에 대한 기대를 갖고 하루를보내세요.',
      money: result.money || '소비보다 저축에 집중하면 좋은 날이에요.',
      health: result.health || '가벼운 산책으로 활력을 충전해보세요.',
      summaryLine: result.summaryLine || '오늘은 좋은 기운이 함께하는 날이에요',
      overallDetail: result.overallDetail || '',
      loveDetail: result.loveDetail || '',
      moneyDetail: result.moneyDetail || '',
      healthDetail: result.healthDetail || '',
      lucky: {
        color: result.lucky?.color || '파랑',
        colorHex: result.lucky?.colorHex || '#5b8def',
        number: result.lucky?.number ?? Math.floor(Math.random() * 45) + 1,
        direction: result.lucky?.direction || '동쪽',
        item: result.lucky?.item || '따뜻한 음료',
      },
      score: Math.min(95, Math.max(50, result.score ?? 75)),
      mbtiInsight: result.mbtiInsight || '',
    };
  } catch (error) {
    console.error('Fortune API error:', error);
    throw new Error('운세 분석 중 오류가 발생했어요. 다시 시도해주세요.');
  }
}

/**
 * Express.js 라우터 예시
 *
 * import express from 'express';
 * import { handleFortuneRequest } from './fortune-handler';
 *
 * const router = express.Router();
 * router.post('/api/fortune', async (req, res) => {
 *   try {
 *     const result = await handleFortuneRequest(req.body);
 *     res.json(result);
 *   } catch (e) {
 *     res.status(500).json({ error: e.message });
 *   }
 * });
 */
