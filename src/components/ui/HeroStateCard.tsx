import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Gift,
  Mail,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { OnboardingPhase } from '../../hooks/useOnboardingState';
import './HeroStateCard.css';

interface HeroStateCardProps {
  phase: OnboardingPhase;
  email?: string;
}

export default function HeroStateCard({ phase, email }: HeroStateCardProps) {
  const navigate = useNavigate();

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
          onClick={() => navigate('/portal')}
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
          A questionnaire link has been sent to your registered email address. Please check
          your inbox and complete your profile to participate in upcoming research
          opportunities.
        </p>
        {email && (
          <p className="hero-state__meta">
            Questionnaire invitation sent to <strong>{email}</strong>
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
        <p className="hero-state__eyebrow">Almost There</p>
        <h2 className="hero-state__title">Verify Your Email</h2>
        <p className="hero-state__body">
          We sent an activation link to your inbox. Confirm your email to activate your
          research community profile.
        </p>
        {email && (
          <p className="hero-state__meta">
            Sent to <strong>{email}</strong>
          </p>
        )}
        <p className="hero-state__hint">
          <Sparkles size={14} />
          Check spam if you don&apos;t see it within a few minutes.
        </p>
      </div>
    );
  }

  return null;
}
