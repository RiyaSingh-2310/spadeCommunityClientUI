import { useCallback, useEffect, useState } from 'react';
import { Sparkles, Shield, Users, TrendingUp } from 'lucide-react';
import JoinForm from '../ui/JoinForm';
import HeroStateCard, { type HeroCardPhase } from '../ui/HeroStateCard';
import { useOnboardingState } from '../../hooks/useOnboardingState';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { usePanelistAuth } from '../../context/PanelistAuthContext';
import { useAutoDismiss } from '../../hooks/useAutoDismiss';
import { clearSignupSuccess } from '../../utils/signupSession';
import { saveMemberComplete, getMemberComplete } from '../../utils/memberSession';
import { getSurveyPath, isSurveyCompleted } from '../../utils/surveyStatus';
import './HeroSection.css';

const highlights = [
  'Earn rewards for credible, high-quality research participation',
  'Flexible studies designed around your schedule',
  'Trusted by global brands and research institutions',
];

/** Registration success card (survey-link email) stays visible for 1 minute. */
const VERIFY_CARD_MS = 60_000;
const VERIFY_FADE_MS = 400;

export default function HeroSection() {
  const { ref: leftRef, className: leftClass } = useScrollReveal();
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal();
  const { isAuthenticated, user } = usePanelistAuth();
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

  // Persist survey completion from auth/profile so Home state survives logout/refresh.
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (!isSurveyCompleted(user)) return;
    if (getMemberComplete()) return;

    saveMemberComplete({
      email: user.email,
      completedAt: new Date().toISOString(),
    });

    const timer = window.setTimeout(() => {
      setOnboardingRefresh((v) => v + 1);
      window.dispatchEvent(new CustomEvent('onboarding-updated'));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, user]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');

    const enableCaptcha = () => {
      setCaptchaReady(true);
    };

    let timer = 0;

    if (mq.matches) {
      timer = window.setTimeout(enableCaptcha, 0);
    } else if (rightVisible) {
      timer = window.setTimeout(enableCaptcha, 120);
    } else {
      timer = window.setTimeout(() => setCaptchaReady(false), 0);
    }

    const onChange = () => {
      if (mq.matches || rightVisible) {
        setCaptchaReady(true);
      } else {
        setCaptchaReady(false);
      }
    };

    mq.addEventListener('change', onChange);
    return () => {
      window.clearTimeout(timer);
      mq.removeEventListener('change', onChange);
    };
  }, [rightVisible]);

  const surveyCompleted =
    onboarding.phase === 'member' || (isAuthenticated && isSurveyCompleted(user));
  const surveyPending = isAuthenticated && !surveyCompleted;
  const surveyPath = getSurveyPath(user);

  // A: not registered → join form
  const showJoinForm = !isAuthenticated && onboarding.phase === 'none';
  // B: registered, email link not clicked yet (survey link pending)
  const showVerifyCard =
    !isAuthenticated && (onboarding.phase === 'registered' || verifyExiting);
  // C: email link clicked → account activated; survey may still be pending
  const showActivatedCard =
    !isAuthenticated && onboarding.phase === 'activated' && !verifyExiting;
  // D: logged in + survey not completed
  const showSurveyPendingCard = surveyPending;
  // E: survey completed → hide registration/survey boxes, center marketing content
  const showCompleteCentered = surveyCompleted;

  const showRightCard =
    !showCompleteCentered &&
    (showJoinForm || showVerifyCard || showActivatedCard || showSurveyPendingCard);

  const isExpandedHero = !showRightCard;
  const listItems = highlights;

  let cardPhase: HeroCardPhase = 'none';
  if (showVerifyCard) cardPhase = 'registered';
  else if (showSurveyPendingCard) cardPhase = 'surveyPending';
  else if (showActivatedCard) cardPhase = 'activated';

  return (
    <section className={`hero-v2${isExpandedHero ? ' hero-v2--expanded' : ''}`}>
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
          className={`hero-v2__copy ${leftClass}${isExpandedHero ? ' hero-v2__copy--expanded' : ''}`}
        >
          <div className="hero-v2__badge">
            <Sparkles size={14} />
            Premium Research Community
          </div>

          <h1 className="hero-v2__title">
            Shape the future of products.
            <span className="hero-v2__title-gradient"> Get rewarded</span> for your perspective.
          </h1>

          <p className="hero-v2__lead">
            Join an exclusive panel of verified members contributing to meaningful research —
            with transparent rewards and enterprise-grade privacy.
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
                    phase={cardPhase}
                    email={user?.email ?? onboarding.email}
                    surveyPath={surveyPath}
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
