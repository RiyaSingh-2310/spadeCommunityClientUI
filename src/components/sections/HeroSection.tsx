import { useCallback, useEffect, useState } from 'react';
import { Sparkles, Shield, Users, TrendingUp } from 'lucide-react';
import JoinForm from '../ui/JoinForm';
import HeroStateCard from '../ui/HeroStateCard';
import { useOnboardingState } from '../../hooks/useOnboardingState';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { usePanelistAuth } from '../../context/PanelistAuthContext';
import { useAutoDismiss } from '../../hooks/useAutoDismiss';
import { clearSignupSuccess } from '../../utils/signupSession';
import './HeroSection.css';

const highlights = [
  'Earn rewards for credible, high-quality research participation',
  'Flexible studies designed around your schedule',
  'Trusted by global brands and research institutions',
];

const memberHighlights = [
  'Your research profile is active and eligible for new studies',
  'Rewards are tracked automatically in your member dashboard',
  'Participation status updates as new opportunities become available',
];

const VERIFY_CARD_MS = 5000;
const VERIFY_FADE_MS = 400;

export default function HeroSection() {
  const { ref: leftRef, className: leftClass } = useScrollReveal();
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal();
  const { isAuthenticated } = usePanelistAuth();
  const [captchaReady, setCaptchaReady] = useState(false);
  const [onboardingRefresh, setOnboardingRefresh] = useState(0);
  const onboarding = useOnboardingState(onboardingRefresh);

  const handleVerifyDismiss = useCallback(() => {
    clearSignupSuccess();
    setOnboardingRefresh((v) => v + 1);
    window.dispatchEvent(new CustomEvent('onboarding-updated'));
  }, []);

  const { exiting: verifyExiting } = useAutoDismiss({
    active: !isAuthenticated && onboarding.phase === 'registered',
    delayMs: VERIFY_CARD_MS,
    fadeMs: VERIFY_FADE_MS,
    onDismiss: handleVerifyDismiss,
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');

    if (mq.matches) {
      setCaptchaReady(true);
    } else if (rightVisible) {
      const timer = window.setTimeout(() => setCaptchaReady(true), 120);
      return () => window.clearTimeout(timer);
    } else {
      setCaptchaReady(false);
    }

    const onChange = () => {
      if (mq.matches || rightVisible) {
        setCaptchaReady(true);
      } else {
        setCaptchaReady(false);
      }
    };

    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [rightVisible]);

  const showMemberCopy = !isAuthenticated && onboarding.phase === 'member';
  const showJoinForm = onboarding.phase === 'none';
  const showRightCard = !isAuthenticated && onboarding.phase !== 'member';
  const isExpandedHero = isAuthenticated || onboarding.phase === 'member';
  const listItems = showMemberCopy ? memberHighlights : highlights;
  const showVerifyCard =
    !isAuthenticated && (onboarding.phase === 'registered' || verifyExiting);

  return (
    <section
      className={`hero-v2${isExpandedHero ? ' hero-v2--expanded' : ''}${showMemberCopy ? ' hero-v2--member' : ''}`}
    >
      <div className="hero-v2__backdrop" aria-hidden="true">
        <div className="hero-v2__mesh" />
        <span className="hero-v2__orb hero-v2__orb--1" />
        <span className="hero-v2__orb hero-v2__orb--2" />
        <span className="hero-v2__orb hero-v2__orb--3" />
        <span className="hero-v2__grid" />
      </div>

      <div
        className={`hero-v2__inner container-wide${isExpandedHero ? ' hero-v2__inner--single' : ''}`}
      >
        <div
          ref={leftRef}
          className={`hero-v2__copy ${leftClass}${isExpandedHero ? ' hero-v2__copy--expanded' : ''}${showMemberCopy ? ' hero-v2__copy--member' : ''}`}
        >
          <div className="hero-v2__badge">
            <Sparkles size={14} />
            {showMemberCopy ? 'Community Member' : 'Premium Research Community'}
          </div>

          <h1 className="hero-v2__title">
            {showMemberCopy ? (
              <>
                You&apos;re all set.
                <span className="hero-v2__title-gradient"> Welcome back.</span>
              </>
            ) : (
              <>
                Shape the future of products.
                <span className="hero-v2__title-gradient"> Get rewarded</span> for your perspective.
              </>
            )}
          </h1>

          <p className="hero-v2__lead">
            {showMemberCopy
              ? 'Your onboarding is complete. Explore your dashboard, track rewards, and stay ready for your next research opportunity.'
              : 'Join an exclusive panel of verified members contributing to meaningful research — with transparent rewards and enterprise-grade privacy.'}
          </p>

          <ul className="hero-v2__list">
            {listItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="hero-v2__trust">
            <div className="hero-v2__trust-item">
              <Shield size={16} />
              <span>Enterprise Security</span>
            </div>
            <div className="hero-v2__trust-item">
              <Users size={16} />
              <span>2.5M+ Members</span>
            </div>
            <div className="hero-v2__trust-item">
              <TrendingUp size={16} />
              <span>$2 Welcome Bonus</span>
            </div>
          </div>
        </div>

        {showRightCard ? (
          <div
            ref={rightRef}
            className={`hero-v2__panel reveal-opacity${rightVisible ? ' reveal--visible' : ''}`}
          >
            <div className="hero-v2__panel-glow" aria-hidden="true" />
            <div className="hero-v2__panel-card">
              {showJoinForm ? (
                <div className="hero-v2__panel-form" key="join-form">
                  <div className="hero-v2__panel-header">
                    <div>
                      <p className="hero-v2__panel-eyebrow">Start in minutes</p>
                      <h2 className="hero-v2__panel-title">Join Our Survey</h2>
                    </div>
                    <span className="hero-v2__panel-badge">+$2 Bonus</span>
                  </div>
                  <JoinForm
                    captchaActive={captchaReady}
                    onSignupSuccess={() => setOnboardingRefresh((v) => v + 1)}
                  />
                </div>
              ) : (
                <div
                  className={`hero-v2__panel-state${showVerifyCard && verifyExiting ? ' hero-v2__panel-state--exiting' : ' hero-v2__panel-state--enter'}`}
                >
                  <HeroStateCard
                    phase={showVerifyCard ? 'registered' : onboarding.phase}
                    email={onboarding.email}
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
