import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import QuestionnaireLayout from './components/layout/QuestionnaireLayout';
import ActivationLayout from './components/layout/ActivationLayout';
import RequirePanelistAuth from './components/panelist-portal/RequirePanelistAuth';
import PanelistPortalLayout from './components/panelist-portal/PanelistPortalLayout';
import { PanelistAuthProvider } from './context/PanelistAuthContext';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Questionnaire from './pages/Questionnaire';
import QuestionnaireGroupPublic from './pages/QuestionnaireGroupPublic';
import { LoginRedirect, JoinRedirect } from './pages/AuthRedirect';
import AccountActivation from './pages/AccountActivation';
import PanelistDashboardPage from './pages/panelist/PanelistDashboardPage';
import PanelistProfilePage from './pages/panelist/PanelistProfilePage';
import PanelistRedeemPage from './pages/panelist/PanelistRedeemPage';
import PanelistRedeemHistoryPage from './pages/panelist/PanelistRedeemHistoryPage';
import PanelistSettingsPage from './pages/panelist/PanelistSettingsPage';
import HomeGatePage from './pages/HomeGatePage';

const router = createBrowserRouter([
  {
    element: <QuestionnaireLayout />,
    children: [
      { path: '/questionnaire', element: <Questionnaire /> },
      { path: '/questionnaire/:secureToken', element: <Questionnaire /> },
      { path: '/questionnaire-group/:groupId', element: <QuestionnaireGroupPublic /> },
      { path: '/community-users', element: <Questionnaire /> },
    ],
  },
  {
    element: <ActivationLayout />,
    children: [
      { path: '/activate', element: <AccountActivation /> },
      { path: '/activate/:token', element: <AccountActivation /> },
    ],
  },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomeGatePage /> },
      { path: '/about', element: <About /> },
      { path: '/faq', element: <FAQ /> },
      { path: '/contact', element: <Contact /> },
      { path: '/privacy-policy', element: <PrivacyPolicy /> },
      { path: '/login', element: <LoginRedirect /> },
      { path: '/join', element: <JoinRedirect /> },
      {
        element: <RequirePanelistAuth />,
        children: [
          {
            element: <PanelistPortalLayout />,
            children: [
              { path: '/dashboard', element: <PanelistDashboardPage /> },
              { path: '/profile', element: <PanelistProfilePage /> },
              { path: '/redeem', element: <PanelistRedeemPage /> },
              { path: '/redeem-history', element: <PanelistRedeemHistoryPage /> },
              { path: '/settings', element: <PanelistSettingsPage /> },
            ],
          },
          { path: '/member', element: <Navigate to="/dashboard" replace /> },
          { path: '/member/profile', element: <Navigate to="/profile" replace /> },
          { path: '/member/password', element: <Navigate to="/profile" replace /> },
          { path: '/member/rewards', element: <Navigate to="/redeem" replace /> },
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
