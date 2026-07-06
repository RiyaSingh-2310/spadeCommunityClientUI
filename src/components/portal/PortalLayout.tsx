import { NavLink, Outlet, ScrollRestoration } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ClipboardList,
  LayoutDashboard,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import './PortalLayout.css';

const navItems = [
  { to: '/portal', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/portal/surveys', label: 'Surveys', icon: ClipboardList },
  { to: '/portal/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/portal/clients', label: 'Clients', icon: Users },
  { to: '/portal/settings', label: 'Settings', icon: Settings },
];

export default function PortalLayout() {
  return (
    <div className="portal-app">
      <aside className="portal-sidebar">
        <div className="portal-sidebar__brand">
          <span className="portal-sidebar__mark" aria-hidden="true" />
          <div>
            <strong>InsightForge</strong>
            <span>Client Portal</span>
          </div>
        </div>

        <nav className="portal-sidebar__nav" aria-label="Portal navigation">
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

        <div className="portal-sidebar__footer">
          <p>Demo environment</p>
          <small>Frontend preview · No backend</small>
        </div>
      </aside>

      <div className="portal-shell">
        <header className="portal-topbar">
          <div className="portal-topbar__search">
            <Search size={18} aria-hidden="true" />
            <input type="search" placeholder="Search projects, surveys, clients…" aria-label="Search" />
          </div>
          <div className="portal-topbar__actions">
            <button type="button" className="portal-topbar__icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="portal-topbar__badge">3</span>
            </button>
            <div className="portal-topbar__user">
              <span className="portal-topbar__avatar" aria-hidden="true">
                RS
              </span>
              <div>
                <strong>Riya Singh</strong>
                <span>Research Manager</span>
              </div>
            </div>
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
