const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(404).end(); return; }

  try {
    const { systemPrompt, userPrompt } = req.body;
    if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');

    const safeSystemPrompt = systemPrompt + '\n반드시 JSON 형식으로만 응답하세요.';

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.85,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: safeSystemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      throw new Error(errText || `OpenAI 오류 ${r.status}`);
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenAI 응답 형식 오류');

    const result = JSON.parse(text);
    res.status(200).json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '서버 오류';
    res.status(500).send(msg);
  }
}
