// สติกเกอร์แมวดำ 40 แบบ (ตัดจากแผ่นสติกเกอร์ -> public/cats/cat-00..39.png)
export const CAT_COUNT = 40;
export const DEFAULT_CAT = 9;
export const catSrc = (i) => `/cats/cat-${String(i).padStart(2, '0')}.png`;
// อารมณ์ที่ใช้ในเว็บ
export const MOOD = { hello: 3, think: 4, typing: 36, love: 12, oops: 28, sad: 32, sleepy: 38, party: 23, cheer: 21, shy: 15, angel: 22, wow: 20 };
