import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePanelistAuth } from '../../context/PanelistAuthContext';

export default function RequirePanelistAuth() {
  const { isAuthenticated } = usePanelistAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
