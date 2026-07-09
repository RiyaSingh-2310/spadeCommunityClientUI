import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { height: 34 },
  md: { height: 42 },
  lg: { height: 52 },
};

export default function Logo({ className = '', variant = 'light', size = 'md' }: LogoProps) {
  const s = sizes[size];

  return (
    <Link to="/" className={`logo logo--${variant} logo--${size} ${className}`} aria-label="Spade Community Home">
      <img
        src="/images/brand-logo-horizontal.png"
        alt="Spade Community"
        className="logo__image"
        style={{ height: s.height }}
        width={Math.round(s.height * 3.375)}
        height={s.height}
        decoding="async"
      />
    </Link>
  );
}
