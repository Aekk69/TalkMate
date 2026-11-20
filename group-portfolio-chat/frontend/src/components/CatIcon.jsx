import { useCat } from '../CatContext.jsx';
import { useLang } from '../i18n.jsx';
import { MOOD, catSrc } from '../cats.js';

// สติกเกอร์แมวดำ: ไม่ใส่ mood = ตัวที่เลือกอยู่, clickable = กดแล้วเปลี่ยนตัวถัดไป
export default function CatIcon({ size = 36, mood, clickable = false }) {
  const { idx, next, tick } = useCat();
  const { t } = useLang();
  const i = mood != null ? (MOOD[mood] ?? mood) : idx;
  const img = <img key={clickable ? tick : 'x'} className={clickable ? 'cat-img pop' : 'cat-img'} src={catSrc(i)} width={size} height={size} alt="" />;
  if (!clickable) return <span className="cat" style={{ width: size, height: size }}>{img}</span>;
  return (
    <button type="button" className="cat-btn" style={{ width: size, height: size }} onClick={next} aria-label={t('cat_next')} title={t('cat_next')}>
      {img}
    </button>
  );
}
