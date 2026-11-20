import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { usePortfolio } from '../usePortfolio.js';
import CatIcon from '../components/CatIcon.jsx';
import LangSwitch from '../components/LangSwitch.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

// ดาวระยิบระยับ (ตำแหน่งคงที่ ไม่สุ่ม)
const STARS = Array.from({ length: 14 }, (_, i) => ({ left: (i * 37 + 11) % 96, top: (i * 53 + 7) % 70, delay: (i % 7) * 0.6 }));

// หน้าต้อนรับก่อนเข้าหน้า Home
export default function Intro() {
  const { t, pick } = useLang();
  const go = useNavigate();
  const { data } = usePortfolio();

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') go('/home'); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return (
    <main className="intro">
      {STARS.map((s, i) => (
        <span key={i} className="twinkle" style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }} />
      ))}
      <div className="intro-lang"><LangSwitch /><ThemeToggle /></div>
      <div className="mascot">
        <div className="say">{t('cat_say')}</div>
        <CatIcon size={150} clickable />
      </div>
      <h1 className="intro-title">TalkMate</h1>
      <p className="tagline">{t('intro_sub')}</p>
      <button className="btn enter" onClick={() => go('/home')}>{t('intro_enter')}</button>
      {data && <p className="intro-names">{data.members.map((m) => pick(m, 'name')).join(' · ')}</p>}
      <p className="intro-hint">{t('intro_hint')}</p>
    </main>
  );
}
