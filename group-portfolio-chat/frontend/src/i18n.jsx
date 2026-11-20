import { createContext, useContext, useEffect, useState } from 'react';

const DICT = {
  th: {
    cat_say: 'เหมียว~ ถามอะไรเกี่ยวกับทีมได้เลย',
    intro_enter: 'เข้าสู่เว็บ ✦', intro_sub: 'Chat AI พร้อม Portfolio ของกลุ่ม', intro_hint: 'กด Enter หรือแตะปุ่มเพื่อเข้าสู่เว็บ',
    clear_confirm: 'กดอีกครั้งเพื่อล้าง', clear_error: 'ล้างประวัติไม่สำเร็จ ลองใหม่อีกครั้ง',
    clear_yes: 'ยืนยันล้าง', clear_no: 'ยกเลิก', clear_fail: 'ล้างประวัติไม่สำเร็จ ลองใหม่อีกครั้ง',
    nav_present: 'พรีเซนต์', theme_toggle: 'สลับโหมดสว่าง/มืด', cat_next: 'กดเพื่อเปลี่ยนแมวตัวอื่น', stickers: 'สติกเกอร์', pick_sticker: 'เลือกสติกเกอร์',
    nav_home: 'หน้าแรก', nav_portfolio: 'ผลงาน', nav_members: 'สมาชิก', nav_chat: 'แชต AI',
    home_eyebrow: 'Chat AI พร้อม Portfolio', cta_chat: '💬 คุยกับ AI', cta_team: 'รู้จักสมาชิก',
    home_team: 'ทีมของเรา', f1_t: 'ผลงาน', f1_d: 'ผลงานร่วมกันและของแต่ละคน', f2_t: 'ประวัติสมาชิก',
    f2_d: 'การศึกษา ทักษะ และเส้นทางของแต่ละคน', f3_t: 'แชตกับ AI', f3_d: 'ถามอะไรเกี่ยวกับทีมก็ได้ ตอบจากข้อมูลจริง',
    highlights: 'จุดเด่นของทีม', group_work: 'ผลงานร่วมกัน', members: 'สมาชิก', contact: 'ติดต่อเรา',
    view_profile: 'ดูประวัติ →', loading: 'กำลังโหลด…', load_error: 'โหลดข้อมูลไม่สำเร็จ',
    members_title: 'ประวัติสมาชิก', members_sub: 'รู้จักคนที่อยู่เบื้องหลัง TalkMate',
    education: 'การศึกษา', interests: 'ความสนใจ', timeline: 'เส้นทาง', skills: 'ทักษะ', works: 'ผลงาน',
    chat_hello: '👋 ถามอะไรเกี่ยวกับทีมและสมาชิกได้เลย', placeholder: 'พิมพ์คำถาม…', send: 'ส่ง',
    clear: 'ล้างประวัติ', confirm_clear: 'ล้างประวัติแชตทั้งหมด?', typing: 'กำลังพิมพ์…',
    conn_error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้',
    suggestions: ['ทีมนี้มีใครบ้าง?', 'จุดเด่นของทีมคืออะไร?', 'ใครเก่ง React?', 'ติดต่อทีมได้ทางไหน?'],
  },
  en: {
    cat_say: 'Meow~ ask me anything about the team',
    intro_enter: 'Enter the site ✦', intro_sub: 'Chat AI with a group Portfolio', intro_hint: 'Press Enter or tap the button to continue',
    clear_confirm: 'Tap again to clear', clear_error: 'Could not clear the history, please try again',
    clear_yes: 'Yes, clear', clear_no: 'Cancel', clear_fail: 'Could not clear the history, please try again',
    nav_present: 'Present', theme_toggle: 'Toggle light/dark mode', cat_next: 'Tap to change the cat', stickers: 'Stickers', pick_sticker: 'Pick a sticker',
    nav_home: 'Home', nav_portfolio: 'Portfolio', nav_members: 'Members', nav_chat: 'Chat AI',
    home_eyebrow: 'Chat AI with Portfolio', cta_chat: '💬 Chat with AI', cta_team: 'Meet the team',
    home_team: 'Our team', f1_t: 'Portfolio', f1_d: 'Shared work and each member’s projects', f2_t: 'Member profiles',
    f2_d: 'Education, skills and the path of each person', f3_t: 'Chat with AI', f3_d: 'Ask anything about the team, answered from real data',
    highlights: 'Team highlights', group_work: 'Group work', members: 'Members', contact: 'Contact',
    view_profile: 'View profile →', loading: 'Loading…', load_error: 'Could not load data',
    members_title: 'Member profiles', members_sub: 'Meet the people behind TalkMate',
    education: 'Education', interests: 'Interests', timeline: 'Timeline', skills: 'Skills', works: 'Work',
    chat_hello: '👋 Ask anything about the team and its members', placeholder: 'Type a question…', send: 'Send',
    clear: 'Clear history', confirm_clear: 'Clear the whole chat history?', typing: 'Typing…',
    conn_error: 'Cannot reach the server',
    suggestions: ['Who is on the team?', 'What are the team’s strengths?', 'Who is good at React?', 'How can I contact the team?'],
  },
};

const Ctx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'th');
  useEffect(() => { localStorage.setItem('lang', lang); document.documentElement.lang = lang; }, [lang]);
  const t = (k) => DICT[lang][k] ?? DICT.th[k] ?? k;
  // เลือกข้อความตามภาษา: en อยู่ใน profile.en / i18n.en ถ้าไม่มีให้ถอยกลับเป็นภาษาไทย
  const pick = (o, key) => {
    const base = o?.[key] ?? o?.profile?.[key];
    if (lang !== 'en') return base;
    return o?.profile?.en?.[key] ?? o?.i18n?.en?.[key] ?? base;
  };
  return <Ctx.Provider value={{ lang, setLang, t, pick }}>{children}</Ctx.Provider>;
}
export const useLang = () => useContext(Ctx);
