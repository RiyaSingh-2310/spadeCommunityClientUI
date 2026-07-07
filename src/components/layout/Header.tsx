import { useEffect, useState, type CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../ui/Logo';
import { navLinks } from '../../data/mockData';
import { useAuthModal } from '../../context/AuthModalContext';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openLogin, openSignup } = useAuthModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleAuthAction = (action: 'login' | 'signup') => {
    closeMenu();
    if (action === 'login') openLogin();
    else openSignup();
  };

  const routeLinks = navLinks.filter((link): link is { label: string; path: string } => 'path' in link);
  const actionLinks = navLinks.filter(
    (link): link is { label: string; action: 'login' | 'signup' } =>
      'action' in link && link.action !== 'signup'
  );
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
              </ul>

              <div className="site-header__actions">
                {actionLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    className={`site-header__action site-header__action--${link.action}`}
                    onClick={() => handleAuthAction(link.action)}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
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
                    <button
                      type="button"
                      className={`site-header__dropdown-action site-header__dropdown-action--${link.action}`}
                      onClick={() => handleAuthAction(link.action)}
                      tabIndex={menuOpen ? 0 : -1}
                    >
                      {link.label}
                    </button>
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
