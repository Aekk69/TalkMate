import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);

// โหมดสว่าง/มืด: จำค่าไว้ใน localStorage ถ้ายังไม่เคยเลือกให้ตามเครื่อง (ตั้งค่าเริ่มต้นใน index.html กันจอวาบ)
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
  }, [theme]);
  return <Ctx.Provider value={{ theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}>{children}</Ctx.Provider>;
}
export const useTheme = () => useContext(Ctx);
