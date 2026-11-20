import { Link } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { usePortfolio } from '../usePortfolio.js';

export default function Portfolio() {
  const { t, pick } = useLang();
  const { data, error } = usePortfolio();
  if (error) return <p className="center">{t('load_error')}</p>;
  if (!data) return <p className="center">{t('loading')}</p>;
  const { group: g, members } = data;

  return (
    <main className="page">
      <header className="hero">
        <h1>{g.name}</h1>
        <p className="tagline">{pick(g, 'tagline')}</p>
        <p>{pick(g, 'concept')}</p>
        <Link className="btn" to="/chat">{t('cta_chat')}</Link>
      </header>

      <section>
        <h2>{t('highlights')}</h2>
        <ul className="chips">{(pick(g, 'highlights') ?? []).map((h) => <li key={h}>{h}</li>)}</ul>
      </section>

      <section>
        <h2>{t('group_work')}</h2>
        <div className="grid">
          {g.group_projects?.map((p) => (
            <article className="card" key={p.name}>
              <h3>{p.name}</h3><p>{p.description}</p>
              <div className="chips">{p.tech?.map((x) => <span key={x}>{x}</span>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>{t('members')}</h2>
        <div className="grid">
          {members.map((m) => (
            <article className="card" key={m.id}>
              <div className="avatar">{m.photo ? <img src={m.photo} alt={pick(m, 'name')} /> : m.name.slice(0, 1)}</div>
              <h3>{pick(m, 'name')}</h3>
              <p className="role">{pick(m, 'role')}</p>
              <p>{pick(m, 'bio')}</p>
              <div className="chips">{m.skills?.map((s) => <span key={s}>{s}</span>)}</div>
              {m.projects?.map((p) => <p className="proj" key={p.name}><b>{p.name}</b> — {p.description}</p>)}
              <Link to="/members">{t('view_profile')}</Link>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>{t('contact')}</h2>
        <ul className="contact">
          {g.contact?.email && <li>✉️ <a href={`mailto:${g.contact.email}`}>{g.contact.email}</a></li>}
          {g.contact?.github && <li>🐙 <a href={g.contact.github} target="_blank" rel="noreferrer">{g.contact.github}</a></li>}
          {g.contact?.line && <li>💚 LINE: {g.contact.line}</li>}
        </ul>
      </section>
    </main>
  );
}
