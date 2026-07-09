import { useState } from 'react';
import { NavLink, Outlet, ScrollRestoration } from 'react-router-dom';
import { Clock3, Gift, History, LayoutDashboard, Menu, Settings, UserRound, X } from 'lucide-react';
import { usePanelistAuth } from '../../context/PanelistAuthContext';
import './PanelistPortalLayout.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/redeem', label: 'Redeem Rewards', icon: Gift },
  { to: '/redeem-history', label: 'Redeem History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function PanelistPortalLayout() {
  const { user } = usePanelistAuth();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="panelist-portal">
      <button
        type="button"
        className="panelist-portal__toggle"
        onClick={() => setNavOpen((value) => !value)}
        aria-expanded={navOpen}
        aria-label={navOpen ? 'Close dashboard navigation' : 'Open dashboard navigation'}
      >
        {navOpen ? <X size={18} /> : <Menu size={18} />}
        Menu
      </button>

      <aside className={`panelist-portal__sidebar${navOpen ? ' panelist-portal__sidebar--open' : ''}`}>
        <div className="panelist-portal__brand">
          <p>Client Dashboard</p>
          <strong>{user?.name || 'Panelist'}</strong>
          <span>{user?.email || 'member@spade.com'}</span>
        </div>

        <nav className="panelist-portal__nav" aria-label="Dashboard navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `panelist-portal__link${isActive ? ' panelist-portal__link--active' : ''}`
              }
              onClick={() => setNavOpen(false)}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="panelist-portal__meta">
          <Clock3 size={15} />
          <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </aside>

      <div className="panelist-portal__content">
        <Outlet />
      </div>

      <ScrollRestoration />
    </div>
  );
}
