import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 32, title: '1.02rem', subtitle: '0.66rem' },
  md: { icon: 38, title: '1.16rem', subtitle: '0.72rem' },
  lg: { icon: 44, title: '1.32rem', subtitle: '0.78rem' },
};

export default function Logo({ className = '', variant = 'light', size = 'md' }: LogoProps) {
  const s = sizes[size];

  return (
    <Link to="/" className={`logo logo--${variant} ${className}`} aria-label="Spade Community Home">
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo__mark"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="12" fill="url(#logo-grad)" />
        <path
          d="M20 9C15.5 13 13 16.5 13 20.5C13 24 15.5 27 20 31C24.5 27 27 24 27 20.5C27 16.5 24.5 13 20 9Z"
          fill="white"
          fillOpacity="0.95"
        />
        <circle cx="20" cy="20.5" r="3.25" fill="url(#logo-grad)" />
        <defs>
          <linearGradient id="logo-grad" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F46E5" />
            <stop offset="0.55" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="logo__wordmark">
        <span className="logo__title" style={{ fontSize: s.title }}>
          Spade
        </span>
        <span className="logo__subtitle" style={{ fontSize: s.subtitle }}>
          Community
        </span>
      </div>
    </Link>
  );
}
