import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const SYSTEM = `당신은 한국어로 답하는 운세·명리 콘텐츠 작가입니다.
사주(명리)의 개념을 MBTI 성향 언어로 풀어 재해석합니다.
- 과학적·의학적 단정, 불안 조장, 과도한 미신적 단정은 피합니다.
- 톤은 따뜻하고 긍정적이되 현실적인 조언을 섞습니다.
- 각 항목은 3~5문장 정도의 짧은 문단으로 작성합니다.
- 반드시 아래 JSON 형식만 출력하고, 다른 텍스트는 넣지 마세요.
- 모든 본문은 한국어로만 작성하세요. 영어 단어(budget, plan, tip, energy 등)를 섞지 말고 한국어로 번역해서 쓰세요. (MBTI 유형명 같은 고유명사만 예외)`;

const SIJIN_LABEL = {
  ja: '자시(子) 23:30~01:30',
  chuk: '축시(丑) 01:30~03:30',
  in: '인시(寅) 03:30~05:30',
  myo: '묘시(卯) 05:30~07:30',
  jin: '진시(辰) 07:30~09:30',
  sa: '사시(巳) 09:30~11:30',
  o: '오시(午) 11:30~13:30',
  mi: '미시(未) 13:30~15:30',
  sin: '신시(申) 15:30~17:30',
  yu: '유시(酉) 17:30~19:30',
  sul: '술시(戌) 19:30~21:30',
  hae: '해시(亥) 21:30~23:30',
};

function buildUserPayload(body) {
  const { info, mbti } = body;
  let timeDesc;
  if (info.birthTimeUnknown) {
    timeDesc =
      '출생 시각 미상(대략 자시 등으로 간주하지 말고 일반적으로 서술)';
  } else if (info.birthSijin && SIJIN_LABEL[info.birthSijin]) {
    timeDesc = `출생 시진: ${SIJIN_LABEL[info.birthSijin]}`;
  } else {
    timeDesc = '출생 시각 미상';
  }
  const birthLine = String(info.birthDate || '').includes('.')
    ? info.birthDate.replace(/\./g, '-')
    : info.birthDate;
  return `다음 정보로 운세를 작성해 주세요.

이름: ${info.name}
생년월일: ${birthLine}
성별: ${info.gender}
${timeDesc}
사용자 MBTI: ${mbti ?? '미입력(일반적인 MBTI 언어로 균형 있게 서술)'}

JSON 스키마:
{
  "summaryLine": "한 줄 요약 (MBTI 톤)",
  "overall": "총운",
  "love": "애정운",
  "money": "금전운",
  "health": "건강운"
}`;
}

async function openaiJson(userContent) {
  if (!OPENAI_KEY) {
    throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');
  }
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userContent },
      ],
    }),
  });
  if (!r.ok) {
    const errText = await r.text();
    throw new Error(errText || `OpenAI 오류 ${r.status}`);
  }
  const data = await r.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text || typeof text !== 'string') {
    throw new Error('OpenAI 응답 형식 오류');
  }
  return JSON.parse(text);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/fortune') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    try {
      const parsed = JSON.parse(body);
      const userContent = buildUserPayload(parsed);
      const result = await openaiJson(userContent);
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(
        JSON.stringify({
          overall: String(result.overall ?? ''),
          love: String(result.love ?? ''),
          money: String(result.money ?? ''),
          health: String(result.health ?? ''),
          summaryLine: String(result.summaryLine ?? ''),
        })
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : '서버 오류';
      res.writeHead(500, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(msg);
    }
    return;
  }

  res.writeHead(404);
  res.end();
});

const PORT = Number(process.env.PORT) || 8787;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[명리연구소 API] http://127.0.0.1:${PORT}`);
});
