import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Gift,
  Mail,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';
import './HeroStateCard.css';

export type HeroCardPhase =
  | 'none'
  | 'registered'
  | 'activated'
  | 'member'
  | 'surveyPending';

interface HeroStateCardProps {
  phase: HeroCardPhase;
  email?: string;
  surveyPath?: string | null;
}

export default function HeroStateCard({ phase, email, surveyPath }: HeroStateCardProps) {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  if (phase === 'surveyPending') {
    return (
      <div className="hero-state hero-state--activated">
        <div className="hero-state__glow" aria-hidden="true" />
        <div className="hero-state__icon-wrap hero-state__icon-wrap--activated">
          <ClipboardList size={32} strokeWidth={1.75} />
        </div>
        <p className="hero-state__eyebrow">Survey Pending</p>
        <h2 className="hero-state__title">Complete your profile survey</h2>
        <p className="hero-state__body">
          Your account is active. Finish your questionnaire to unlock study matching and rewards
          tracking in your dashboard.
        </p>
        {email && (
          <p className="hero-state__meta">
            Signed in as <strong>{email}</strong>
          </p>
        )}
        {surveyPath ? (
          <button
            type="button"
            className="hero-state__cta hero-state__cta--member"
            onClick={() => navigate(surveyPath)}
          >
            Continue Survey
            <ArrowRight size={18} />
          </button>
        ) : (
          <p className="hero-state__hint">
            <Sparkles size={14} />
            Open the survey link from your email to continue.
          </p>
        )}
        <button
          type="button"
          className="hero-state__cta hero-state__cta--secondary"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  if (phase === 'member') {
    return (
      <div className="hero-state hero-state--member">
        <div className="hero-state__glow hero-state__glow--member" aria-hidden="true" />
        <div className="hero-state__member-badge">
          <Star size={12} />
          Community Member
        </div>
        <div className="hero-state__icon-wrap hero-state__icon-wrap--member">
          <BadgeCheck size={34} strokeWidth={1.75} />
        </div>
        <p className="hero-state__eyebrow">Research Profile Active</p>
        <h2 className="hero-state__title">Welcome Back</h2>
        <p className="hero-state__body">
          Your onboarding is complete. You&apos;re eligible for new studies and reward
          opportunities matched to your profile.
        </p>
        {email && (
          <p className="hero-state__meta">
            Member account: <strong>{email}</strong>
          </p>
        )}
        <div className="hero-state__stats">
          <div className="hero-state__stat hero-state__stat--active">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span className="hero-state__stat-value">Active</span>
            <span className="hero-state__stat-label">Member Status</span>
          </div>
          <div className="hero-state__stat hero-state__stat--bonus">
            <Gift size={16} aria-hidden="true" />
            <span className="hero-state__stat-value">$2</span>
            <span className="hero-state__stat-label">Welcome Bonus</span>
          </div>
        </div>
        <ul className="hero-state__checklist">
          <li>
            <CheckCircle2 size={15} aria-hidden="true" />
            Profile verified
          </li>
          <li>
            <CheckCircle2 size={15} aria-hidden="true" />
            Survey completed
          </li>
          <li>
            <CheckCircle2 size={15} aria-hidden="true" />
            Ready for new studies
          </li>
        </ul>
        <button
          type="button"
          className="hero-state__cta hero-state__cta--member"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  if (phase === 'activated') {
    return (
      <div className="hero-state hero-state--activated">
        <div className="hero-state__glow" aria-hidden="true" />
        <div className="hero-state__icon-wrap hero-state__icon-wrap--activated">
          <UserCheck size={32} strokeWidth={1.75} />
        </div>
        <p className="hero-state__eyebrow">Account Active</p>
        <h2 className="hero-state__title">You&apos;re ready to sign in</h2>
        <p className="hero-state__body">
          Your account was activated when you opened your survey link. Sign in with the same
          credentials you used during registration. If you haven&apos;t finished the survey yet,
          continue from the link in your email.
        </p>
        {email && (
          <p className="hero-state__meta">
            Account: <strong>{email}</strong>
          </p>
        )}
        <button
          type="button"
          className="hero-state__cta hero-state__cta--member"
          onClick={openLogin}
        >
          Sign In
          <ArrowRight size={18} />
        </button>
        {surveyPath ? (
          <button
            type="button"
            className="hero-state__cta hero-state__cta--secondary"
            onClick={() => navigate(surveyPath)}
          >
            Continue Survey
            <ArrowRight size={18} />
          </button>
        ) : null}
      </div>
    );
  }

  if (phase === 'registered') {
    return (
      <div className="hero-state hero-state--registered">
        <div className="hero-state__glow" aria-hidden="true" />
        <div className="hero-state__icon-wrap hero-state__icon-wrap--registered">
          <Mail size={32} strokeWidth={1.75} />
        </div>
        <p className="hero-state__eyebrow">Check Your Email</p>
        <h2 className="hero-state__title">Survey link sent</h2>
        <p className="hero-state__body">
          A survey link has been sent to your email. Please check your email to continue.
        </p>
        {email && (
          <p className="hero-state__meta">
            Sent to <strong>{email}</strong>
          </p>
        )}
        <p className="hero-state__hint">
          <Sparkles size={14} />
          Opening the link activates your account and opens the survey. Check spam if you
          don&apos;t see it within a few minutes.
        </p>
      </div>
    );
  }

  return null;
}
