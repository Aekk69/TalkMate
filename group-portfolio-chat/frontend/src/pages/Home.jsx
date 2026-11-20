import { Link } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { usePortfolio } from '../usePortfolio.js';
import CatIcon from '../components/CatIcon.jsx';

export default function Home() {
  const { t, pick } = useLang();
  const { data } = usePortfolio();
  const g = data?.group;
  return (
    <main className="page">
      <header className="hero home">
        <div>
          <p className="eyebrow">{t('home_eyebrow')}</p>
          <h1>{g?.name ?? 'TalkMate'}</h1>
          <p className="tagline">{g ? pick(g, 'tagline') : ''}</p>
          <div className="actions">
            <Link className="btn" to="/chat">{t('cta_chat')}</Link>
            <Link className="btn ghost-btn" to="/members">{t('cta_team')}</Link>
          </div>
        </div>
        <div className="mascot">
          <div className="say">{t('cat_say')}</div>
          <CatIcon size={170} clickable />
        </div>
      </header>

      {data && (
        <section>
          <h2>{t('home_team')}</h2>
          <div className="faces">
            {data.members.map((m) => (
              <Link to="/members" key={m.id} className="face">
                <div className="avatar big">{m.photo ? <img src={m.photo} alt={pick(m, 'name')} /> : m.name.slice(0, 1)}</div>
                <b>{pick(m, 'name')}</b>
                <span>{pick(m, 'role')}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="grid">
          {[['/portfolio', 'f1'], ['/members', 'f2'], ['/chat', 'f3']].map(([to, k]) => (
            <Link key={to} to={to} className="card card-link">
              <h3>{t(`${k}_t`)}</h3>
              <p className="muted">{t(`${k}_d`)}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
