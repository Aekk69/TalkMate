import { useEffect, useState } from 'react';

let cache; // โหลดครั้งเดียว ใช้ร่วมกันทุกหน้า
export function usePortfolio() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    cache ??= fetch('/api/portfolio').then((r) => { if (!r.ok) throw new Error(); return r.json(); });
    cache.then(setData).catch(() => { cache = undefined; setError(true); });
  }, []);
  return { data, error };
}
