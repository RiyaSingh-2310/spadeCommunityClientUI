import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import QuestionnaireLayout from './components/layout/QuestionnaireLayout';
import PanelistPortalLayout from './components/panelist-portal/PanelistPortalLayout';
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
import PanelistProfilePage from './pages/panelist/PanelistProfilePage';
import PanelistPasswordPage from './pages/panelist/PanelistPasswordPage';
import PanelistRewardsPage from './pages/panelist/PanelistRewardsPage';

const router = createBrowserRouter([
  {
    element: <RequirePanelistAuth />,
    children: [
      {
        element: <PanelistPortalLayout />,
        children: [
          { path: '/member', element: <PanelistDashboardPage /> },
          { path: '/member/profile', element: <PanelistProfilePage /> },
          { path: '/member/password', element: <PanelistPasswordPage /> },
          { path: '/member/rewards', element: <PanelistRewardsPage /> },
        ],
      },
    ],
  },
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
