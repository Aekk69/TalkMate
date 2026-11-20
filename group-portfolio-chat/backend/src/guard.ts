export const REFUSAL = 'ขออภัย เรื่องนี้บอกไม่ได้ ถามเรื่องกลุ่มและสมาชิกของเราได้เลย เช่น ทักษะ ผลงาน หรือช่องทางติดต่อ';

// รูปแบบการโจมตีที่เจอบ่อย: ขอดูคำสั่งลับ / สั่งให้ลืมกฎ / สวมบทบาทอื่น / อ้างเป็นแอดมิน
const PATTERNS: RegExp[] = [
  /ignore\s+(all\s+|any\s+)?(previous|prior|above)/i,
  /(system|hidden)\s*prompt/i,
  /(reveal|show|print|repeat)\b.{0,30}\b(instructions|rules)/i,
  /ลืม.{0,10}กฎ/,
  /กฎ.{0,15}(ที่คุณมี|ของคุณ|ที่ได้รับ)/,
  /คำสั่ง.{0,10}(ลับ|ระบบ|ก่อนหน้า)/,
  /\bDAN\b|do anything now/i,
  /(developer|debug)\s*mode|โหมด(ดีบัก|นักพัฒนา)/i,
  /(ฉัน|ผม)คือ(แอดมิน|ผู้ดูแล)|i am (the )?admin/i,
];

export const looksLikeInjection = (text: string): boolean => PATTERNS.some((p) => p.test(text));

// ใส่รหัสลับ (canary) ไว้ใน system prompt ถ้าโผล่ในคำตอบ = prompt หลุด
export const leaksPrompt = (reply: string, canary: string): boolean => reply.includes(canary);
