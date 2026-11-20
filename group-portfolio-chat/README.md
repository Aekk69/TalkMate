# TalkMate — Chat AI พร้อม Portfolio ของกลุ่ม

เว็บแอปให้ผู้เยี่ยมชมแชตกับ AI เพื่อสอบถามผลงานและทักษะของกลุ่มและสมาชิกแต่ละคน

| ส่วน | เทคโนโลยี |
|---|---|
| หน้าเว็บ (2 หน้า: Portfolio, Chat) | React + Vite + React Router |
| Backend API | Node.js + Express + TypeScript |
| ฐานข้อมูล | PostgreSQL (ประวัติแชต + ข้อมูล Portfolio) |
| AI | OpenAI-compatible API (ค่าเริ่มต้น Gemini) — system prompt + ข้อมูล Portfolio จาก DB |
| CI/CD | GitHub Actions → Render |

## หน้าเว็บ
| เส้นทาง | หน้า |
|---|---|
| `/` | Intro: หน้าต้อนรับก่อนเข้าเว็บ (ปุ่มเข้าสู่เว็บ / กด Enter) |
| `/home` | Home: แนะนำ TalkMate และหน้าตาสมาชิก |
| `/portfolio` | Portfolio ของกลุ่มและสมาชิก |
| `/members` | ประวัติสมาชิกแต่ละคน |
| `/chat` | แชตกับ AI (ส่งสติกเกอร์แมวได้) |
| `/present` | หน้าไว้พรีเซนต์: ตรวจตามโจทย์ อธิบายโค้ดแบบง่าย สคริปต์ Demo |

ปุ่ม TH / EN บนแถบเมนูสลับภาษาทั้งเว็บ (จำค่าไว้ใน `localStorage`) ข้อความภาษาอังกฤษของข้อมูลอยู่ใน `portfolio.seed.json` ที่ `profile.en` และ `group.i18n.en`

### ธีมและแมวดำ
- ปุ่ม ☀️/🌙 สลับโหมดสว่าง/มืด (จำค่าไว้ ถ้ายังไม่เลือกจะตามเครื่อง)
- กดแมวที่โลโก้เพื่อเปลี่ยนเป็นสติกเกอร์แมวดำตัวอื่นเรื่อย ๆ (40 แบบ ไฟล์อยู่ที่ `frontend/public/cats/`)
- สติกเกอร์ในแชตส่งเป็นข้อความ `[[cat:N]]` ไม่ส่งให้ AI และเซิร์ฟเวอร์ตอบกลับด้วยสติกเกอร์ตัวอื่น
- ภาพสติกเกอร์เป็นงานของผู้สร้างต้นฉบับ ใช้ในโปรเจกต์เรียนนี้เท่านั้น ถ้าจะเผยแพร่ต่อควรขออนุญาตหรือใส่เครดิตผู้วาด

## โครงสร้าง
```
backend/   Express API (src/) + schema และ seed ของ DB (db/)
frontend/  React UI (src/pages/Portfolio.jsx, Chat.jsx)
.github/workflows/ci-cd.yml
render.yaml  (Blueprint สำหรับ deploy)
```

## วิธีติดตั้งและรัน (Local)
ต้องมี Node.js 20+ และ Docker

```bash
git clone <repo-url> && cd group-portfolio-chat
cp .env.example .env          # แล้วใส่ LLM_API_KEY ของคุณ
docker compose up -d          # เปิด PostgreSQL
npm --prefix backend install
npm --prefix frontend install
npm run check                 # type check (tsc --noEmit)
npm run dev:backend           # terminal 1 → http://localhost:3001
npm run dev:frontend          # terminal 2 → http://localhost:5173
```
ตอน server เริ่ม จะสร้างตารางและโหลดข้อมูลจาก `backend/db/portfolio.seed.json` ให้อัตโนมัติ

## แก้ข้อมูล Portfolio
แก้ `backend/db/portfolio.seed.json` (ชื่อกลุ่ม แนวคิด สมาชิก ทักษะ ผลงาน ช่องทางติดต่อ) แล้วรีสตาร์ท backend
ทั้งหน้า Portfolio และ AI จะใช้ข้อมูลชุดเดียวกันจาก DB

## ออกแบบฐานข้อมูล
- `members` 1 : N `projects` ผ่าน FK `projects.member_id` (NULL = ผลงานของทั้งกลุ่ม) ดึงด้วย `LEFT JOIN ... GROUP BY`
- `conversations` 1 : N `messages` ผ่าน FK `messages.conversation_id` (`role` มี `CHECK`, `text` เป็น `NOT NULL`)
- ทุก query ใช้ placeholder (`$1, $2`) ไม่ต่อสตริง SQL
- seed ข้อมูลใน transaction (`BEGIN/COMMIT/ROLLBACK`) ถ้าเคยรันเวอร์ชันเก่า ให้ `docker compose down -v` ก่อน

## AI Integration
System prompt แบ่ง 4 ส่วน (Persona / Task / Format / Rules) แล้วต่อด้วยข้อมูล Portfolio ที่อ่านจาก DB ใหม่ทุกครั้ง
- **ความจำ:** ส่งประวัติ `MAX_HISTORY` (ค่าเริ่มต้น 10) ข้อความล่าสุด ข้อความเกิน 1000 ตัวอักษรถูกปฏิเสธ
- **กันถูกหลอก (หลายชั้น):** กฎใน prompt → ตัวกรองข้อความ (`guard.ts`) → ตรวจคำตอบด้วยรหัสลับ (canary) ไม่มีชั้นไหนกันได้ 100% จึงซ้อนกัน
- **สลับผู้ให้บริการ:** แก้ `LLM_BASE_URL` / `LLM_MODEL` / `LLM_API_KEY` ใน `.env`
- **ไม่ commit key:** `.env` อยู่ใน `.gitignore`, ใช้ `.env.example` แทน

## API
- `GET /api/portfolio` ข้อมูลกลุ่ม/สมาชิก
- `GET /api/chat/:sessionId` ประวัติแชต (มี `createdAt`)
- `POST /api/chat` body `{ sessionId, message }` → `{ userMessage, assistantMessage }`
- `DELETE /api/chat/:sessionId` ล้างประวัติ

## Deploy (Render)
1. Push โค้ดขึ้น GitHub
2. Render → New → Blueprint → เลือก repo (ใช้ `render.yaml`) แล้วใส่ `LLM_API_KEY`
3. คัดลอก Deploy Hook URL ของ service ไปใส่ GitHub → Settings → Secrets → `RENDER_DEPLOY_HOOK_URL`
4. ทุกครั้งที่ push เข้า `main` pipeline จะ build, ทดสอบ แล้ว deploy อัตโนมัติ

## CI/CD
`.github/workflows/ci-cd.yml`: build frontend → type check + unit test guardrails → ยก Postgres ขึ้นมาทดสอบ API (smoke test) → deploy เมื่อ push เข้า `main`

## สมาชิก
- (ใส่ชื่อ + หน้าที่ของแต่ละคน)
