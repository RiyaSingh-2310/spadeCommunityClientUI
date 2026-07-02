import { useEffect, useState } from 'react';
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
    const onScroll = () => setScrolled(window.scrollY > 12);
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

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner container-wide">
        <Logo />

        <button
          className="header__toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`} aria-label="Main navigation">
          <ul className="header__nav-list">
            {navLinks.map((link) => (
              <li key={link.label}>
                {'action' in link ? (
                  <button
                    type="button"
                    className="header__nav-link header__nav-link--action"
                    onClick={() => handleAuthAction(link.action)}
                  >
                    {link.label}
                  </button>
                ) : (
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
                    }
                    onClick={closeMenu}
                    end={link.path === '/'}
                  >
                    {link.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {menuOpen && (
          <div className="header__overlay" onClick={closeMenu} aria-hidden="true" />
        )}
      </div>
    </header>
  );
}
