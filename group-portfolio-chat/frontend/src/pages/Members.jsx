import { useLang } from '../i18n.jsx';
import { usePortfolio } from '../usePortfolio.js';

export default function Members() {
  const { t, pick } = useLang();
  const { data, error } = usePortfolio();
  if (error) return <p className="center">{t('load_error')}</p>;
  if (!data) return <p className="center">{t('loading')}</p>;

  return (
    <main className="page">
      <h1 className="page-title">{t('members_title')}</h1>
      <p className="muted">{t('members_sub')}</p>

      {data.members.map((m) => {
        const edu = pick(m, 'education');
        const uni = pick(m, 'university'), fac = pick(m, 'faculty'), major = pick(m, 'major');
        const interests = pick(m, 'interests') ?? [];
        const timeline = pick(m, 'timeline') ?? [];
        const quote = pick(m, 'quote');
        return (
          <article className="profile" key={m.id}>
            <div className="portrait">
              {m.photo ? <img src={m.photo} alt={pick(m, 'name')} /> : <div className="avatar big">{m.name.slice(0, 1)}</div>}
            </div>
            <div>
              <h2>{pick(m, 'name')}</h2>
              <p className="role">{pick(m, 'role')}</p>
              {quote && <blockquote>{quote}</blockquote>}
              <p>{pick(m, 'bio')}</p>

              {(uni || fac || major) ? (
                <>
                  <h3>{t('education')}</h3>
                  <div className="edu">
                    {uni && <div><span>🎓</span>{uni}</div>}
                    {fac && <div><span>🏛️</span>{fac}</div>}
                    {major && <div><span>🤖</span>{major}</div>}
                  </div>
                </>
              ) : edu && <><h3>{t('education')}</h3><p>{edu}</p></>}
              <h3>{t('skills')}</h3>
              <div className="chips">{m.skills?.map((s) => <span key={s}>{s}</span>)}</div>
              {interests.length > 0 && <><h3>{t('interests')}</h3><div className="chips">{interests.map((i) => <span key={i}>{i}</span>)}</div></>}
              {timeline.length > 0 && (
                <>
                  <h3>{t('timeline')}</h3>
                  <ul className="timeline">{timeline.map((x) => <li key={x.year + x.text}><b>{x.year}</b><span>{x.text}</span></li>)}</ul>
                </>
              )}
              {m.projects?.length > 0 && (
                <>
                  <h3>{t('works')}</h3>
                  {m.projects.map((p) => <p className="proj" key={p.name}><b>{p.name}</b> — {p.description}</p>)}
                </>
              )}
            </div>
          </article>
        );
      })}
    </main>
  );
}
