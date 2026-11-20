import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../db');
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
const query = <T extends pg.QueryResultRow>(text: string, params?: unknown[]) => pool.query<T>(text, params);

export interface Project { name: string; description: string; tech: string[] }
export interface Member { id: number; name: string; role: string; bio: string; skills: string[]; photo?: string | null; projects: Project[];
  profile?: Record<string, any> } // ประวัติสมาชิก (education, timeline, ...) + en
export interface Group {
  name: string; tagline: string; concept: string; highlights: string[];
  contact: Record<string, string>; group_projects: Project[];
  i18n?: Record<string, any>; // ข้อความภาษาอังกฤษ { en: { tagline, concept, highlights } }
}
export interface Portfolio { group: Group; members: Member[] }
export interface ChatMessage { id: number; role: 'user' | 'assistant'; text: string; createdAt: string }

interface Seed {
  group: Omit<Group, 'group_projects'> & { group_projects: Partial<Project>[] };
  members: (Omit<Member, 'id' | 'projects'> & { projects: Partial<Project>[] })[];
}

// สร้างตาราง + โหลด portfolio.seed.json ใน transaction เดียว (สำเร็จทั้งหมดหรือไม่เปลี่ยนเลย)
export async function setup(): Promise<void> {
  await pool.query(fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8'));
  const seed: Seed = JSON.parse(fs.readFileSync(path.join(dir, 'portfolio.seed.json'), 'utf8'));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const g = seed.group;
    await client.query(
      `INSERT INTO group_info (id, name, tagline, concept, highlights, contact, i18n) VALUES (1,$1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET name=$1, tagline=$2, concept=$3, highlights=$4, contact=$5, i18n=$6`,
      [g.name, g.tagline, g.concept, g.highlights, JSON.stringify(g.contact), JSON.stringify(g.i18n ?? {})]);
    await client.query('DELETE FROM projects');
    await client.query('DELETE FROM members');
    const addProject = (memberId: number | null, p: Partial<Project>) =>
      client.query('INSERT INTO projects (member_id, title, description, tech) VALUES ($1,$2,$3,$4)',
        [memberId, p.name, p.description, p.tech ?? []]);
    for (const p of g.group_projects) await addProject(null, p);
    for (const [i, m] of seed.members.entries()) {
      const { rows } = await client.query<{ id: number }>(
        'INSERT INTO members (name, role, bio, skills, sort, photo, profile) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [m.name, m.role, m.bio, m.skills, i, m.photo ?? null, JSON.stringify(m.profile ?? {})]);
      for (const p of m.projects) await addProject(rows[0].id, p);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// JOIN: members + projects (FK member_id) แล้ว GROUP BY รวมโปรเจกต์ของแต่ละคนเป็น array
export async function getPortfolio(): Promise<Portfolio> {
  const g = (await query<Omit<Group, 'group_projects'>>(
    'SELECT name, tagline, concept, highlights, contact, i18n FROM group_info WHERE id = 1')).rows[0];
  const groupProjects = (await query<Project>(
    'SELECT title AS name, description, tech FROM projects WHERE member_id IS NULL ORDER BY id')).rows;
  const members = (await query<Member>(
    `SELECT m.id, m.name, m.role, m.bio, m.skills, m.photo, m.profile,
            COALESCE(json_agg(json_build_object('name', p.title, 'description', p.description, 'tech', p.tech)
                     ORDER BY p.id) FILTER (WHERE p.id IS NOT NULL), '[]') AS projects
     FROM members m LEFT JOIN projects p ON p.member_id = m.id
     GROUP BY m.id ORDER BY m.sort`)).rows;
  return { group: { ...g, group_projects: groupProjects }, members };
}

// ---------- chat ----------
const toMsg = (r: { id: number; role: 'user' | 'assistant'; text: string; created_at: Date }): ChatMessage =>
  ({ id: r.id, role: r.role, text: r.text, createdAt: r.created_at.toISOString() }); // ISO + Z → ไม่มีปัญหา timezone
type Row = Parameters<typeof toMsg>[0];

export async function ensureConversation(id: string): Promise<void> {
  await query('INSERT INTO conversations (id) VALUES ($1) ON CONFLICT DO NOTHING', [id]);
}
export async function listMessages(id: string): Promise<ChatMessage[]> {
  const { rows } = await query<Row>(
    'SELECT id, role, text, created_at FROM messages WHERE conversation_id = $1 ORDER BY id', [id]);
  return rows.map(toMsg);
}
export async function recentMessages(id: string, limit: number): Promise<ChatMessage[]> {
  const { rows } = await query<Row>(
    `SELECT * FROM (SELECT id, role, text, created_at FROM messages WHERE conversation_id = $1
                    ORDER BY id DESC LIMIT $2) t ORDER BY id`, [id, limit]);
  return rows.map(toMsg);
}
export async function addMessage(id: string, role: 'user' | 'assistant', text: string): Promise<ChatMessage> {
  const { rows } = await query<Row>(
    'INSERT INTO messages (conversation_id, role, text) VALUES ($1,$2,$3) RETURNING id, role, text, created_at',
    [id, role, text]);
  return toMsg(rows[0]);
}
export async function clearMessages(id: string): Promise<void> {
  await query('DELETE FROM messages WHERE conversation_id = $1', [id]);
}
