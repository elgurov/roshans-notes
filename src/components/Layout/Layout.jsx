import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const NAV_LINKS = [
  { to: '/', label: 'Главная', end: true },
  { to: '/heroes', label: 'Герои' },
  { to: '/explore', label: 'Разведка' },
  { to: '/dashboard', label: 'Кабинет' },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Закрываем мобильное меню при смене страницы
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const linkClass = ({ isActive }) =>
    isActive ? 'nav__link nav__link--active' : 'nav__link';

  return (
    <div className="layout">
      <header className="header">
        <div className="header__inner">
          <Link to="/" className="logo" aria-label="Заметки Рошана — на главную">
            <span className="logo__mark" aria-hidden="true">
              ◆
            </span>
            <span className="logo__text">Логово Рошана</span>
          </Link>

          <button
            type="button"
            className="burger"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            id="main-nav"
            className={menuOpen ? 'nav nav--open' : 'nav'}
            aria-label="Основная навигация"
          >
            <ul className="nav__list">
              {NAV_LINKS.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end} className={linkClass}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="nav__auth">
              {user ? (
                <>
                  <span className="nav__user">{user.name}</span>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn--ghost">
                    Войти
                  </Link>
                  <Link to="/register" className="btn btn--primary">
                    Создать аккаунт
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <p className="footer__brand">Логово Рошана</p>
          <p className="footer__note">
            Учебный проект. Данные о героях предоставляет OpenDota API. Dota 2
            — торговая марка Valve Corporation.
          </p>
          <p className="footer__copy">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
