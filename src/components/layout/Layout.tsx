import { Outlet, ScrollRestoration } from 'react-router-dom';
import { AuthModalProvider } from '../../context/AuthModalContext';
import Header from './Header';
import Footer from './Footer';
import AuthModals from '../ui/AuthModals';

export default function Layout() {
  return (
    <AuthModalProvider>
      <div className="app-layout">
        <Header />
        <main className="app-main">
          <Outlet />
        </main>
        <Footer />
        <AuthModals />
        <ScrollRestoration />
      </div>
    </AuthModalProvider>
  );
}
