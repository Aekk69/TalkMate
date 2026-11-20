import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n.jsx';
import CatIcon from '../components/CatIcon.jsx';
import { CAT_COUNT, catSrc } from '../cats.js';

const getSession = () => {
  let id = localStorage.getItem('sessionId');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('sessionId', id); }
  return id;
};
const STICKER_RE = /^\[\[cat:(\d{1,2})\]\]$/; // สติกเกอร์ส่งเป็นข้อความ [[cat:N]]

export default function Chat() {
  const { lang, t } = useLang();
  const sessionId = useRef(getSession()).current;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [panel, setPanel] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const bottom = useRef(null);
  const time = (iso) => new Date(iso).toLocaleTimeString(lang === 'en' ? 'en-GB' : 'th-TH', { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    fetch(`/api/chat/${sessionId}`).then((r) => r.json()).then((d) => Array.isArray(d) && setMessages(d)).catch(() => {});
  }, [sessionId]);
  useEffect(() => {
    if (!confirming) return undefined;
    const id = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(id);
  }, [confirming]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const note = (text) => ({ id: `e${Date.now()}`, role: 'assistant', text: `⚠️ ${text}`, createdAt: new Date().toISOString() });

  async function send(text) {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    setInput(''); setPanel(false);
    const temp = { id: `t${Date.now()}`, role: 'user', text: message, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, temp]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
      });
      const data = await res.json();
      setMessages((m) => res.ok
        ? [...m.filter((x) => x.id !== temp.id), data.userMessage, data.assistantMessage]
        : [...m, note(data.error)]);
    } catch { setMessages((m) => [...m, note(t('conn_error'))]); }
    finally { setLoading(false); }
  }

  // กดครั้งแรก = ขอยืนยัน (ปุ่มเปลี่ยนเป็นสีแดง 4 วินาที) กดอีกครั้ง = ล้างจริง ไม่ใช้ confirm() ที่บางเบราว์เซอร์/iframe บล็อก
  async function clearHistory() {
    if (!messages.length) return;
    if (!confirming) { setConfirming(true); return; }
    setConfirming(false);
    try {
      const res = await fetch(`/api/chat/${sessionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('clear failed');
      setMessages([]);
    } catch { setMessages((m) => [...m, note(t('clear_error'))]); }
  }

  const body = (text) => {
    const m = STICKER_RE.exec(text);
    return m ? <img className="sticker" src={catSrc(Number(m[1]))} width={96} height={96} alt="sticker" /> : text;
  };

  return (
    <div className="chat-wrap">
      <main className="chat">
        <div className="msgs">
          {messages.length === 0 && (
            <div className="empty">
              <CatIcon size={110} mood="hello" />
              <p>{t('chat_hello')}</p>
              <div className="chips">{t('suggestions').map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`row ${m.role}`}>
              {m.role === 'assistant' && <CatIcon size={44} mood={m.text.startsWith('⚠️') ? 'oops' : undefined} />}
              <div className={`bubble ${m.role}${STICKER_RE.test(m.text) ? ' sticker-bubble' : ''}`}>
                {body(m.text)}<div className="time">{time(m.createdAt)}</div>
              </div>
            </div>
          ))}
          {loading && <div className="row assistant"><CatIcon size={44} mood="typing" /><div className="bubble assistant typing">{t('typing')}</div></div>}
          <div ref={bottom} />
        </div>

        {panel && (
          <div className="sticker-panel" role="dialog" aria-label={t('pick_sticker')}>
            {Array.from({ length: CAT_COUNT }, (_, i) => (
              <button key={i} type="button" onClick={() => send(`[[cat:${i}]]`)} aria-label={`${t('stickers')} ${i + 1}`}>
                <img src={catSrc(i)} width={52} height={52} alt="" />
              </button>
            ))}
          </div>
        )}
        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <button type="button" className={`ghost${confirming ? ' danger' : ''}`} onClick={clearHistory} disabled={!messages.length}>
            {confirming ? t('clear_confirm') : t('clear')}
          </button>
          <button type="button" className="sticker-toggle" onClick={() => setPanel((p) => !p)} aria-expanded={panel} title={t('stickers')}>
            <img src={catSrc(12)} width={30} height={30} alt={t('stickers')} />
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('placeholder')} maxLength={1000} />
          <button disabled={loading || !input.trim()}>{t('send')}</button>
        </form>
      </main>
    </div>
  );
}
