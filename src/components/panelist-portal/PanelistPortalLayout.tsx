import { NavLink, Outlet, ScrollRestoration } from 'react-router-dom';
import { Gift, LayoutDashboard, LogOut, Lock, UserRound } from 'lucide-react';
import { usePanelistAuth } from '../../context/PanelistAuthContext';
import '../portal/PortalLayout.css';
import './PanelistPortalLayout.css';

const navItems = [
  { to: '/member', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/member/profile', label: 'Profile', icon: UserRound },
  { to: '/member/password', label: 'Password', icon: Lock },
  { to: '/member/rewards', label: 'Rewards', icon: Gift },
];

export default function PanelistPortalLayout() {
  const { user, logout } = usePanelistAuth();

  return (
    <div className="portal-app panelist-portal-app">
      <aside className="portal-sidebar">
        <div className="portal-sidebar__brand">
          <span className="portal-sidebar__mark" aria-hidden="true" />
          <div>
            <strong>Spade Community</strong>
            <span>Panelist Portal</span>
          </div>
        </div>

        <nav className="portal-sidebar__nav" aria-label="Panelist portal navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `portal-sidebar__link${isActive ? ' portal-sidebar__link--active' : ''}`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="portal-sidebar__footer panelist-portal-sidebar__footer">
          <p>{user?.name || 'Panelist'}</p>
          <small>{user?.email}</small>
          <button type="button" className="panelist-portal-logout" onClick={logout}>
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="portal-shell">
        <header className="portal-topbar panelist-portal-topbar">
          <div>
            <p className="panelist-portal-topbar__eyebrow">Your account</p>
            <h1 className="panelist-portal-topbar__title">Panelist Portal</h1>
          </div>
          <div className="panelist-portal-balance">
            <span>Reward balance</span>
            <strong>{Number(user?.balance_point ?? 0).toLocaleString()} pts</strong>
          </div>
        </header>

        <main className="portal-main">
          <Outlet />
        </main>
      </div>

      <ScrollRestoration />
    </div>
  );
}
