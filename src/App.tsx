import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import QuestionnaireLayout from './components/layout/QuestionnaireLayout';
import PortalLayout from './components/portal/PortalLayout';
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Questionnaire from './pages/Questionnaire';
import { LoginRedirect, JoinRedirect } from './pages/AuthRedirect';
import AccountActivation from './pages/AccountActivation';
import PortalDashboard from './pages/portal/PortalDashboard';
import PortalSurveys from './pages/portal/PortalSurveys';
import SurveyDetails from './pages/portal/SurveyDetails';
import PortalPlaceholder from './pages/portal/PortalPlaceholder';

const router = createBrowserRouter([
  {
    element: <PortalLayout />,
    children: [
      { path: '/portal', element: <PortalDashboard /> },
      { path: '/portal/surveys', element: <PortalSurveys /> },
      { path: '/portal/surveys/:surveyId', element: <SurveyDetails /> },
      {
        path: '/portal/analytics',
        element: (
          <PortalPlaceholder
            title="Analytics"
            description="Cross-project performance insights and trend analysis."
          />
        ),
      },
      {
        path: '/portal/clients',
        element: (
          <PortalPlaceholder
            title="Clients"
            description="Manage client accounts, contacts, and project assignments."
          />
        ),
      },
      {
        path: '/portal/settings',
        element: (
          <PortalPlaceholder
            title="Settings"
            description="Configure portal preferences, notifications, and team access."
          />
        ),
      },
    ],
  },
  {
    element: <QuestionnaireLayout />,
    children: [
      { path: '/questionnaire', element: <Questionnaire /> },
      { path: '/questionnaire/:secureToken', element: <Questionnaire /> },
      { path: '/community-users', element: <Questionnaire /> },
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
      { path: '/activate', element: <AccountActivation /> },
      { path: '/activate/:token', element: <AccountActivation /> },
      { path: '/login', element: <LoginRedirect /> },
      { path: '/join', element: <JoinRedirect /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
