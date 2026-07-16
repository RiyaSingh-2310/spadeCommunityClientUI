import { isRouteErrorResponse, Link, useNavigate, useRouteError } from 'react-router-dom';
import { ArrowLeft, Home, SearchX } from 'lucide-react';
import Button from '../components/ui/Button';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found__backdrop" aria-hidden="true">
        <span className="not-found__orb not-found__orb--1" />
        <span className="not-found__orb not-found__orb--2" />
      </div>

      <div className="not-found__card container-wide">
        <div className="not-found__icon">
          <SearchX size={28} aria-hidden="true" />
        </div>
        <p className="not-found__code">404</p>
        <h1>Page not found</h1>
        <p className="not-found__body">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Let&apos;s get you back to something useful.
        </p>
        <div className="not-found__actions">
          <Button variant="primary" size="md" onClick={() => navigate('/')}>
            <Home size={16} aria-hidden="true" />
            Go to Home
          </Button>
          <Button variant="outline" size="md" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} aria-hidden="true" />
            Go Back
          </Button>
        </div>
        <p className="not-found__links">
          Or visit{' '}
          <Link to="/about">About</Link>
          {', '}
          <Link to="/faq">FAQ</Link>
          {', or '}
          <Link to="/contact">Contact</Link>
        </p>
      </div>
    </div>
  );
}

export function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const title = is404 ? 'Page not found' : 'Something went wrong';
  const body = is404
    ? "The page you're looking for doesn't exist or may have been moved."
    : isRouteErrorResponse(error)
      ? error.statusText || 'An unexpected error occurred while loading this page.'
      : 'An unexpected error occurred while loading this page.';

  return (
    <div className="not-found">
      <div className="not-found__backdrop" aria-hidden="true">
        <span className="not-found__orb not-found__orb--1" />
        <span className="not-found__orb not-found__orb--2" />
      </div>

      <div className="not-found__card container-wide">
        <div className="not-found__icon">
          <SearchX size={28} aria-hidden="true" />
        </div>
        <p className="not-found__code">{is404 ? '404' : 'Error'}</p>
        <h1>{title}</h1>
        <p className="not-found__body">{body}</p>
        <div className="not-found__actions">
          <Button variant="primary" size="md" onClick={() => navigate('/')}>
            <Home size={16} aria-hidden="true" />
            Go to Home
          </Button>
          <Button variant="outline" size="md" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} aria-hidden="true" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
