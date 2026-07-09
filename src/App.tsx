import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import QuestionnaireLayout from './components/layout/QuestionnaireLayout';
import RequirePanelistAuth from './components/panelist-portal/RequirePanelistAuth';
import { PanelistAuthProvider } from './context/PanelistAuthContext';
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Questionnaire from './pages/Questionnaire';
import QuestionnaireGroupPublic from './pages/QuestionnaireGroupPublic';
import { LoginRedirect, JoinRedirect } from './pages/AuthRedirect';
import AccountActivation from './pages/AccountActivation';
import PanelistDashboardPage from './pages/panelist/PanelistDashboardPage';
import PanelistSettingsPage from './pages/panelist/PanelistSettingsPage';

const router = createBrowserRouter([
  {
    element: <QuestionnaireLayout />,
    children: [
      { path: '/questionnaire', element: <Questionnaire /> },
      { path: '/questionnaire/:secureToken', element: <Questionnaire /> },
      { path: '/questionnaire-group/:groupId', element: <QuestionnaireGroupPublic /> },
      { path: '/community-users', element: <Questionnaire /> },
      { path: '/activate', element: <AccountActivation /> },
      { path: '/activate/:token', element: <AccountActivation /> },
    ],
  },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/faq', element: <FAQ /> },
      { path: '/contact', element: <Contact /> },
      { path: '/privacy-policy', element: <PrivacyPolicy /> },
      { path: '/login', element: <LoginRedirect /> },
      { path: '/join', element: <JoinRedirect /> },
      {
        element: <RequirePanelistAuth />,
        children: [
          { path: '/dashboard', element: <PanelistDashboardPage /> },
          { path: '/settings', element: <PanelistSettingsPage /> },
          { path: '/member', element: <Navigate to="/dashboard" replace /> },
          { path: '/member/profile', element: <Navigate to="/settings" replace /> },
          { path: '/member/password', element: <Navigate to="/settings" replace /> },
          { path: '/member/rewards', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <PanelistAuthProvider>
      <RouterProvider router={router} />
    </PanelistAuthProvider>
  );
}
