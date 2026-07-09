import { Navigate } from 'react-router-dom';
import { usePanelistAuth } from '../context/PanelistAuthContext';
import Home from './Home';

export default function HomeGatePage() {
  const { isAuthenticated } = usePanelistAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Home />;
}
