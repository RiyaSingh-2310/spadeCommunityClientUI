import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Questionnaire from './pages/Questionnaire';
import { LoginRedirect, JoinRedirect } from './pages/AuthRedirect';
import AccountActivation from './pages/AccountActivation';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/faq', element: <FAQ /> },
      { path: '/contact', element: <Contact /> },
      { path: '/privacy-policy', element: <PrivacyPolicy /> },
      { path: '/questionnaire', element: <Questionnaire /> },
      { path: '/questionnaire/:secureToken', element: <Questionnaire /> },
      { path: '/community-users', element: <Questionnaire /> },
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
