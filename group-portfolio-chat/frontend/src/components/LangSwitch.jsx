import { useLang } from '../i18n.jsx';

export default function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang" role="group" aria-label="Language">
      {['th', 'en'].map((l) => (
        <button key={l} className={lang === l ? 'on' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
