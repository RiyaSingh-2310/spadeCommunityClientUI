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
          Your account is verified. Finish your questionnaire to unlock study matching and
          rewards tracking in your dashboard.
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
        <p className="hero-state__eyebrow">Account Activated</p>
        <h2 className="hero-state__title">Your account has been successfully activated.</h2>
        <p className="hero-state__body">
          You can now sign in. A questionnaire link has also been sent to your registered email —
          complete it to finish onboarding and start earning rewards.
        </p>
        {email && (
          <p className="hero-state__meta">
            Verified account: <strong>{email}</strong>
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
            Open Survey
            <ArrowRight size={18} />
          </button>
        ) : (
          <p className="hero-state__hint">
            <Sparkles size={14} />
            Check your inbox for the survey invitation if you prefer to complete it first.
          </p>
        )}
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
        <p className="hero-state__eyebrow">Verification Email Sent</p>
        <h2 className="hero-state__title">Check Your Email</h2>
        <p className="hero-state__body">
          We&apos;ve sent a verification email to your registered address. Please open the
          verification link to activate your account before signing in.
        </p>
        {email && (
          <p className="hero-state__meta">
            Sent to <strong>{email}</strong>
          </p>
        )}
        <p className="hero-state__hint">
          <Sparkles size={14} />
          Check spam if you don&apos;t see it within a few minutes. This message will return to
          the registration form shortly.
        </p>
      </div>
    );
  }

  return null;
}
