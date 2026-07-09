import { Outlet } from 'react-router-dom';
import './ActivationLayout.css';

export default function ActivationLayout() {
  return (
    <main className="activation-layout">
      <Outlet />
    </main>
  );
}
