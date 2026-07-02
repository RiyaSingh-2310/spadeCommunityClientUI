import { Link } from 'react-router-dom';
import logo from "../../assets/SpadeCommunitylogoWhite.png"

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size: _size = 'md' }: LogoProps) {
  return (
    <Link to="/" className={`logo ${className}`} aria-label="Spade Community Home">
      {/* <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="30" cy="30" r="28" stroke="#00bcd4" strokeWidth="2" fill="#111" />
        <path
          d="M30 12 C22 20, 18 28, 22 34 C26 38, 30 36, 30 36 C30 36, 34 38, 38 34 C42 28, 38 20, 30 12Z"
          fill="#00bcd4"
          opacity="0.9"
        />
        <path
          d="M12 30 C20 22, 28 18, 34 22 C38 26, 36 30, 36 30 C36 30, 38 34, 34 38 C28 42, 20 38, 12 30Z"
          fill="#e91e63"
          opacity="0.8"
        />
        <path
          d="M30 48 C38 40, 42 32, 38 26 C34 22, 30 24, 30 24 C30 24, 26 22, 22 26 C18 32, 22 40, 30 48Z"
          fill="#00bcd4"
          opacity="0.7"
        />
        <path
          d="M48 30 C40 38, 32 42, 26 38 C22 34, 24 30, 24 30 C24 30, 22 26, 26 22 C32 18, 40 22, 48 30Z"
          fill="#e91e63"
          opacity="0.9"
        />
        <circle cx="30" cy="30" r="6" fill="#fff" />
      </svg>
      <div className="logo__text">
        <span className="logo__spade" style={{ fontSize: s.spade }}>
          SPADE
        </span>
        <span className="logo__community" style={{ fontSize: s.community }}>
          COMMUNITY
        </span>
      </div> */}
      <img src={logo} alt="Spade Community Logo" className="logo__image" />
    </Link>
  );
}
