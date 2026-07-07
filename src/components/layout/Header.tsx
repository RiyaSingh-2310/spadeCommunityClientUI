import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';
import { CircleUserRound, Menu, X } from 'lucide-react';
import Logo from '../ui/Logo';
import { navLinks } from '../../data/mockData';
import { useAuthModal } from '../../context/AuthModalContext';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => window.localStorage.getItem('panelist_ui_logged_in') === 'true'
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const { openLogin } = useAuthModal();
  const profileMenuRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      setIsLoggedIn(window.localStorage.getItem('panelist_ui_logged_in') === 'true');
    };

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('ui-auth-changed', syncAuthState);
    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('ui-auth-changed', syncAuthState);
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleAuthAction = (action: 'login' | 'signup') => {
    closeMenu();
    if (action === 'login') openLogin();
  };

  const logout = () => {
    window.localStorage.removeItem('panelist_ui_logged_in');
    window.dispatchEvent(new CustomEvent('ui-auth-changed'));
    setProfileOpen(false);
    closeMenu();
  };

  const routeLinks = navLinks.filter((link): link is { label: string; path: string } => 'path' in link);
  const mobileLinks = navLinks.filter(
    (link) => !('action' in link && link.action === 'signup')
  );

  return (
    <header
      className={`site-header ${scrolled ? 'site-header--scrolled' : ''}${menuOpen ? ' site-header--menu-open' : ''}`}
    >
      <div
        className={`site-header__overlay${menuOpen ? ' site-header__overlay--visible' : ''}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />
      <div className="site-header__shell container-wide">
        <div className={`site-header__frame${menuOpen ? ' site-header__frame--open' : ''}`}>
          <div className="site-header__bar">
            <Logo variant="dark" size="sm" />

            <button
              className="site-header__toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="site-header-mobile-nav"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <nav className="site-header__nav site-header__nav--desktop" aria-label="Main navigation">
              <ul className="site-header__links">
                {routeLinks.map((link) => (
                  <li key={link.label}>
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `site-header__link${isActive ? ' site-header__link--active' : ''}`
                      }
                      end={link.path === '/'}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
                {isLoggedIn ? (
                  <li className="site-header__profile" ref={profileMenuRef}>
                    <button
                      type="button"
                      className={`site-header__profile-trigger${profileOpen ? ' site-header__profile-trigger--open' : ''}`}
                      onClick={() => setProfileOpen((v) => !v)}
                      aria-expanded={profileOpen}
                      aria-label="Open profile menu"
                    >
                      <CircleUserRound size={20} />
                    </button>
                    <div className={`site-header__profile-menu${profileOpen ? ' site-header__profile-menu--open' : ''}`}>
                      <button type="button" className="site-header__profile-item" disabled>
                        Profile
                      </button>
                      <button type="button" className="site-header__profile-item" onClick={logout}>
                        Logout
                      </button>
                    </div>
                  </li>
                ) : (
                  <li>
                    <button
                      type="button"
                      className="site-header__link site-header__link--button"
                      onClick={() => handleAuthAction('login')}
                    >
                      Login
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          <nav
            id="site-header-mobile-nav"
            className="site-header__dropdown"
            aria-label="Mobile navigation"
            aria-hidden={!menuOpen}
          >
            <ul className="site-header__dropdown-list">
              {mobileLinks.map((link, index) => (
                <li
                  key={link.label}
                  className="site-header__dropdown-item"
                  style={{ '--item-index': index } as CSSProperties}
                >
                  {'path' in link ? (
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `site-header__dropdown-link${isActive ? ' site-header__dropdown-link--active' : ''}`
                      }
                      onClick={closeMenu}
                      end={link.path === '/'}
                      tabIndex={menuOpen ? 0 : -1}
                    >
                      {link.label}
                    </NavLink>
                  ) : (
                    isLoggedIn ? (
                      <button
                        type="button"
                        className="site-header__dropdown-link"
                        onClick={logout}
                        tabIndex={menuOpen ? 0 : -1}
                      >
                        Logout
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="site-header__dropdown-link"
                        onClick={() => handleAuthAction(link.action)}
                        tabIndex={menuOpen ? 0 : -1}
                      >
                        {link.label}
                      </button>
                    )
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
