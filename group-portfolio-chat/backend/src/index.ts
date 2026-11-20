import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { setup, getPortfolio, ensureConversation, listMessages, recentMessages, addMessage, clearMessages } from './db';
import { buildSystemPrompt, askLlm, isLlmConfigured } from './ai';
import { looksLikeInjection, leaksPrompt, REFUSAL } from './guard';

const MAX_HISTORY = Number(process.env.MAX_HISTORY ?? 10); // ความจำ: ส่งให้ AI แค่ N ข้อความล่าสุด
const MAX_LEN = 1000;
const SESSION_RE = /^[A-Za-z0-9-]{8,64}$/;
const STICKER_RE = /^\[\[cat:([0-9]|[1-3][0-9])\]\]$/; // สติกเกอร์แมว 0-39 (ส่งเป็นข้อความ [[cat:N]])
const REPLY_STICKERS = [3, 12, 10, 22, 23, 21, 15, 20];

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '20kb' }));

// กันยิงรัวเกินไป (เปลืองโควตา AI): 20 ครั้ง/นาที/IP
const hits = new Map<string, number[]>();
const tooMany = (ip: string): boolean => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 20;
};

app.get('/api/health', (_req, res) => { res.json({ ok: true, llmConfigured: isLlmConfigured() }); });

app.get('/api/portfolio', async (_req, res) => {
  try { res.json(await getPortfolio()); }
  catch (e) { console.error(e); res.status(500).json({ error: 'โหลดข้อมูลไม่สำเร็จ' }); }
});

app.get('/api/chat/:sessionId', async (req, res) => {
  const id = req.params.sessionId;
  if (!SESSION_RE.test(id)) { res.status(400).json({ error: 'sessionId ไม่ถูกต้อง' }); return; }
  try { res.json(await listMessages(id)); }
  catch (e) { console.error(e); res.status(500).json({ error: 'โหลดประวัติไม่สำเร็จ' }); }
});

app.delete('/api/chat/:sessionId', async (req, res) => {
  const id = req.params.sessionId;
  if (!SESSION_RE.test(id)) { res.status(400).json({ error: 'sessionId ไม่ถูกต้อง' }); return; }
  try { await clearMessages(id); res.json({ message: 'cleared' }); }
  catch (e) { console.error(e); res.status(500).json({ error: 'ล้างประวัติไม่สำเร็จ' }); }
});

app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = (req.body ?? {}) as { sessionId?: unknown; message?: unknown };
  if (typeof sessionId !== 'string' || !SESSION_RE.test(sessionId)) { res.status(400).json({ error: 'sessionId ไม่ถูกต้อง' }); return; }
  if (typeof message !== 'string' || !message.trim() || message.length > MAX_LEN) {
    res.status(400).json({ error: `ข้อความต้องไม่ว่างและไม่เกิน ${MAX_LEN} ตัวอักษร` }); return;
  }
  if (tooMany(req.ip ?? 'unknown')) { res.status(429).json({ error: 'ส่งถี่เกินไป รอสักครู่แล้วลองใหม่' }); return; }

  try {
    const text = message.trim();
    await ensureConversation(sessionId);
    const userMessage = await addMessage(sessionId, 'user', text);

    // สติกเกอร์: ไม่ส่งให้ AI ตอบกลับด้วยสติกเกอร์แมวตัวอื่นแทน
    const st = STICKER_RE.exec(text);
    if (st) {
      const pick = REPLY_STICKERS[(Number(st[1]) + userMessage.id) % REPLY_STICKERS.length];
      res.status(201).json({ userMessage, assistantMessage: await addMessage(sessionId, 'assistant', `[[cat:${pick}]]`) });
      return;
    }

    // ชั้นที่ 2: ตัวกรองข้อความ — ตรงรูปแบบโจมตี ปฏิเสธเลย ไม่ต้องเรียก AI
    if (looksLikeInjection(text)) {
      res.status(201).json({ userMessage, assistantMessage: await addMessage(sessionId, 'assistant', REFUSAL) });
      return;
    }
    if (!isLlmConfigured()) { res.status(503).json({ error: 'ยังไม่ได้ตั้งค่า LLM_API_KEY ฝั่ง server' }); return; }

    const history = (await recentMessages(sessionId, MAX_HISTORY)).filter((m) => !STICKER_RE.test(m.text)).map((m) => ({ role: m.role, content: m.text }));
    while (history[0]?.role === 'assistant') history.shift(); // ประวัติต้องขึ้นต้นด้วยข้อความผู้ใช้

    const canary = `CANARY-${randomUUID()}`;
    let reply = await askLlm(buildSystemPrompt(await getPortfolio(), canary), history);
    // ชั้นที่ 3: ตรวจคำตอบ — ถ้ารหัสลับโผล่ แปลว่า prompt หลุด ไม่ส่งต่อ
    if (leaksPrompt(reply, canary)) reply = REFUSAL;

    res.status(201).json({ userMessage, assistantMessage: await addMessage(sessionId, 'assistant', reply) });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: 'AI ตอบไม่ได้ในขณะนี้ ลองใหม่อีกครั้ง' });
  }
});

// Production: เสิร์ฟ React ที่ build แล้ว
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => { res.sendFile(path.join(dist, 'index.html')); });
}

const port = Number(process.env.PORT ?? 3001);
setup()
  .then(() => app.listen(port, () => console.log(`Server is running on port ${port}`)))
  .catch((e) => { console.error('DB setup failed', e); process.exit(1); });
