import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { LangProvider, useLang } from './i18n.jsx';
import { ThemeProvider } from './theme.jsx';
import { CatProvider } from './CatContext.jsx';
import Intro from './pages/Intro.jsx';
import Home from './pages/Home.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Members from './pages/Members.jsx';
import Chat from './pages/Chat.jsx';
import Present from './pages/Present.jsx';
import CatIcon from './components/CatIcon.jsx';
import LangSwitch from './components/LangSwitch.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import './styles.css';

function Nav() {
  const { t } = useLang();
  return (
    <nav className="nav">
      <div className="brand"><CatIcon size={40} clickable /><Link to="/home">TalkMate</Link></div>
      <NavLink to="/home">{t('nav_home')}</NavLink>
      <NavLink to="/portfolio">{t('nav_portfolio')}</NavLink>
      <NavLink to="/members">{t('nav_members')}</NavLink>
      <NavLink to="/chat">{t('nav_chat')}</NavLink>
      <NavLink to="/present">{t('nav_present')}</NavLink>
      <LangSwitch />
      <ThemeToggle />
    </nav>
  );
}

function App() {
  const intro = useLocation().pathname === '/'; // หน้าต้อนรับไม่มีเมนู/ท้ายเว็บ
  return (
    <>
      {!intro && <Nav />}
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/home" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/members" element={<Members />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/present" element={<Present />} />
      </Routes>
      {!intro && <footer className="foot"><CatIcon size={26} mood="hello" /> <span>TalkMate · Bangkok University · Web Technology</span></footer>}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <LangProvider>
      <CatProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CatProvider>
    </LangProvider>
  </ThemeProvider>
);
