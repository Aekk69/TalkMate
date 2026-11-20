import { createContext, useContext, useEffect, useState } from 'react';
import { CAT_COUNT, DEFAULT_CAT } from './cats.js';

const Ctx = createContext(null);

// เก็บว่าตอนนี้ใช้สติกเกอร์แมวตัวไหน กดโลโก้แล้วเปลี่ยนไปตัวถัดไปเรื่อย ๆ
export function CatProvider({ children }) {
  const [idx, setIdx] = useState(() => {
    const n = Number(localStorage.getItem('cat'));
    return Number.isInteger(n) && n >= 0 && n < CAT_COUNT ? n : DEFAULT_CAT;
  });
  const [tick, setTick] = useState(0); // เปลี่ยนค่าทุกครั้งที่กด เพื่อเล่นแอนิเมชันเด้งใหม่
  useEffect(() => { localStorage.setItem('cat', String(idx)); }, [idx]);
  const next = () => { setIdx((i) => (i + 1) % CAT_COUNT); setTick((x) => x + 1); };
  return <Ctx.Provider value={{ idx, next, tick }}>{children}</Ctx.Provider>;
}
export const useCat = () => useContext(Ctx);
