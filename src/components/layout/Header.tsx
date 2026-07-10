import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Settings, X } from 'lucide-react';
import Logo from '../ui/Logo';
import { useAuthModal } from '../../context/AuthModalContext';
import { usePanelistAuth } from '../../context/PanelistAuthContext';
import './Header.css';

const publicLinks = [
  { label: 'Home', path: '/' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'About Us', path: '/about' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isAuthenticated, logout, user } = usePanelistAuth();
  const { openLogin } = useAuthModal();
  const profileMenuRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false);
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

  const handleAuthAction = () => {
    closeMenu();
    openLogin();
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    closeMenu();
    navigate('/');
  };

  const routeLinks = isAuthenticated
    ? [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Home', path: '/home' },
        { label: 'Redeem Rewards', path: '/redeem-rewards' },
        { label: 'Redeem History', path: '/redeem-history' },
      ]
    : publicLinks;

  const initials = (user?.name || 'P')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
                      end={link.path === '/' || link.path === '/home'}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
                {isAuthenticated ? (
                  <li className="site-header__profile" ref={profileMenuRef}>
                    <button
                      type="button"
                      className={`site-header__profile-trigger${profileOpen ? ' site-header__profile-trigger--open' : ''}`}
                      onClick={() => setProfileOpen((value) => !value)}
                      aria-expanded={profileOpen}
                      aria-label="Open account menu"
                    >
                      {user?.profile_image || user?.photo ? (
                        <img
                          src={user.profile_image ?? user.photo ?? ''}
                          alt=""
                          className="site-header__profile-avatar"
                        />
                      ) : (
                        <span className="site-header__profile-initials">{initials}</span>
                      )}
                    </button>
                    <div
                      className={`site-header__profile-menu${profileOpen ? ' site-header__profile-menu--open' : ''}`}
                    >
                      <button
                        type="button"
                        className="site-header__profile-item"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/settings');
                        }}
                      >
                        <Settings size={15} aria-hidden="true" />
                        Settings
                      </button>
                      <button type="button" className="site-header__profile-item" onClick={handleLogout}>
                        <LogOut size={15} aria-hidden="true" />
                        Logout
                      </button>
                    </div>
                  </li>
                ) : (
                  <li>
                    <button type="button" className="site-header__login-cta" onClick={handleAuthAction}>
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
              {routeLinks.map((link, index) => (
                <li
                  key={link.label}
                  className="site-header__dropdown-item"
                  style={{ '--item-index': index } as CSSProperties}
                >
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `site-header__dropdown-link${isActive ? ' site-header__dropdown-link--active' : ''}`
                    }
                    onClick={closeMenu}
                    end={link.path === '/' || link.path === '/home'}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              {isAuthenticated ? (
                <>
                  <li
                    className="site-header__dropdown-item"
                    style={{ '--item-index': routeLinks.length } as CSSProperties}
                  >
                    <button
                      type="button"
                      className="site-header__dropdown-link"
                      onClick={() => {
                        closeMenu();
                        navigate('/settings');
                      }}
                      tabIndex={menuOpen ? 0 : -1}
                    >
                      Settings
                    </button>
                  </li>
                  <li
                    className="site-header__dropdown-item"
                    style={{ '--item-index': routeLinks.length + 1 } as CSSProperties}
                  >
                    <button
                      type="button"
                      className="site-header__dropdown-link"
                      onClick={handleLogout}
                      tabIndex={menuOpen ? 0 : -1}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li
                  className="site-header__dropdown-item"
                  style={{ '--item-index': routeLinks.length } as CSSProperties}
                >
                  <button
                    type="button"
                    className="site-header__dropdown-login-cta"
                    onClick={handleAuthAction}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    Login
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
