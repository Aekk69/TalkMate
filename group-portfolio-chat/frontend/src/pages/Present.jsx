import { Link } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { PRESENT } from '../presentData.js';
import { SNIPPETS } from '../presentSnippets.js';
import CatIcon from '../components/CatIcon.jsx';

// หน้าไว้พรีเซนต์: ตรวจตามโจทย์ + อธิบายโค้ดแบบง่าย + สคริปต์ demo
export default function Present() {
  const { lang } = useLang();
  const d = PRESENT[lang];
  return (
    <main className="page present">
      <div className="title-row"><CatIcon size={72} mood="cheer" /><div><h1 className="page-title">{d.title}</h1><p className="muted">{d.sub}</p></div></div>

      <section>
        <h2>{d.reqTitle}</h2>
        <div className="req-grid">
          {d.reqs.map(([n, title, desc, where, link]) => (
            <article className="card req" key={n}>
              <span className="num">{n}</span>
              <h3>{title}</h3><p>{desc}</p>
              <code>{where}</code>
              {link && <Link to={link}>{d.open} →</Link>}
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>{d.flowTitle}</h2>
        <ol className="flow">{d.flow.map(([a, b], i) => <li key={a}><b>{i + 1}. {a}</b><span>{b}</span></li>)}</ol>
      </section>

      <section>
        <h2>{d.codeTitle}</h2>
        {d.codes.map((c) => (
          <details className="card code" key={c.k}>
            <summary><b>{c.title}</b><code>{c.file}</code></summary>
            <ul>{c.what.map((w) => <li key={w}>{w}</li>)}</ul>
            <pre><code>{SNIPPETS[c.k]}</code></pre>
          </details>
        ))}
      </section>

      <section>
        <h2>{d.demoTitle}</h2>
        <ol className="demo card">{d.demo.map((s) => <li key={s}>{s}</li>)}</ol>
      </section>

      <section>
        <h2>{d.scoreTitle}</h2>
        {d.score.map(([label, pct, how]) => (
          <div className="score card" key={label}>
            <div className="score-head"><b>{label}</b><span>{pct}%</span></div>
            <div className="score-bar"><i style={{ width: `${pct * 2.5}%` }} /></div>
            <p className="muted">{how}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>{d.rolesTitle}</h2>
        <div className="grid">{d.roles.map(([who, what]) => <article className="card" key={who}><h3>{who}</h3><p>{what}</p></article>)}</div>
      </section>
    </main>
  );
}
