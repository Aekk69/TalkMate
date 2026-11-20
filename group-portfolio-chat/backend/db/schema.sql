-- ข้อมูล Portfolio (members 1 : N projects ผ่าน FK, member_id = NULL คือผลงานของทั้งกลุ่ม)
CREATE TABLE IF NOT EXISTS group_info (
  id INT PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  tagline TEXT,
  concept TEXT,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  contact JSONB NOT NULL DEFAULT '{}',
  i18n JSONB NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  sort INT NOT NULL DEFAULT 0,
  photo TEXT,
  profile JSONB NOT NULL DEFAULT '{}'
);
ALTER TABLE members ADD COLUMN IF NOT EXISTS photo TEXT; -- สำหรับ DB เวอร์ชันเก่า
ALTER TABLE members ADD COLUMN IF NOT EXISTS profile JSONB NOT NULL DEFAULT '{}';
ALTER TABLE group_info ADD COLUMN IF NOT EXISTS i18n JSONB NOT NULL DEFAULT '{}';
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  member_id INT REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech TEXT[] NOT NULL DEFAULT '{}'
);
-- ประวัติแชต (1 conversation : N messages)
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, id);
