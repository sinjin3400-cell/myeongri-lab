import { Redis } from '@upstash/redis';

let redis;
function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return redis;
}

function generateId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const db = getRedis();

  // GET: 공유 데이터 조회
  if (req.method === 'GET') {
    const { id } = req.query;
    if (!id) { res.status(400).json({ error: 'id 필요' }); return; }

    try {
      const data = await db.get(`share:${id}`);
      if (!data) { res.status(404).json({ error: '만료되었거나 없는 공유' }); return; }
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: '조회 실패' });
    }
    return;
  }

  // POST: 공유 데이터 저장
  if (req.method === 'POST') {
    try {
      const data = req.body;
      if (!data || !data.n) { res.status(400).json({ error: '데이터 필요' }); return; }

      const id = generateId();
      // 24시간(86400초) 후 자동 삭제
      await db.set(`share:${id}`, data, { ex: 86400 });

      res.status(200).json({ id });
    } catch (err) {
      res.status(500).json({ error: '저장 실패' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
