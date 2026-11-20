import { useTheme } from '../theme.jsx';
import { useLang } from '../i18n.jsx';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useLang();
  return (
    <button type="button" className="theme-btn" onClick={toggle} aria-label={t('theme_toggle')} title={t('theme_toggle')}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
