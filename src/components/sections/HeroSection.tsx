import { useEffect, useState } from 'react';
import { Sparkles, Shield, Users, TrendingUp } from 'lucide-react';
import JoinForm from '../ui/JoinForm';
import HeroStateCard from '../ui/HeroStateCard';
import { useOnboardingState } from '../../hooks/useOnboardingState';
import { useScrollReveal } from '../../hooks/useScrollReveal';
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

export default function HeroSection() {
  const { ref: leftRef, className: leftClass } = useScrollReveal();
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal();
  const [captchaReady, setCaptchaReady] = useState(false);
  const [onboardingRefresh, setOnboardingRefresh] = useState(0);
  const onboarding = useOnboardingState(onboardingRefresh);

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

  const showJoinForm = onboarding.phase === 'none';
  const isMember = onboarding.phase === 'member';
  const listItems = isMember ? memberHighlights : highlights;
  const showRightCard = !isMember;

  return (
    <section className={`hero-v2${isMember ? ' hero-v2--member' : ''}`}>
      <div className="hero-v2__backdrop" aria-hidden="true">
        <div className="hero-v2__mesh" />
        <span className="hero-v2__orb hero-v2__orb--1" />
        <span className="hero-v2__orb hero-v2__orb--2" />
        <span className="hero-v2__orb hero-v2__orb--3" />
        <span className="hero-v2__grid" />
      </div>

      <div className={`hero-v2__inner container-wide${isMember ? ' hero-v2__inner--member hero-v2__inner--single' : ''}`}>
        <div ref={leftRef} className={`hero-v2__copy ${leftClass}${isMember ? ' hero-v2__copy--member' : ''}`}>
          <div className="hero-v2__badge">
            <Sparkles size={14} />
            {isMember ? 'Community Member' : 'Premium Research Community'}
          </div>

          <h1 className="hero-v2__title">
            {isMember ? (
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
            {isMember
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

          {/* <div className="hero-v2__metrics">
            {statistics.slice(0, 3).map((stat) => (
              <div key={stat.id} className="hero-v2__metric">
                <strong>
                  {stat.value}
                  {stat.suffix}
                </strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div> */}
        </div>

        {showRightCard ? (
          <div
            ref={rightRef}
            className={`hero-v2__panel reveal-opacity${rightVisible ? ' reveal--visible' : ''}`}
          >
            <div className="hero-v2__panel-glow" aria-hidden="true" />
            <div className="hero-v2__panel-card">
              {showJoinForm ? (
                <>
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
                </>
              ) : (
                <HeroStateCard phase={onboarding.phase} email={onboarding.email} />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
