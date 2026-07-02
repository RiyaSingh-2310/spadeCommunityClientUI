import { Shield, Users, Gift, Star, CheckCircle2 } from 'lucide-react';
import JoinForm from '../ui/JoinForm';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './HeroSection.css';

const trustIndicators = [
  { icon: Shield, label: 'Secure & Private' },
  { icon: Users, label: '2.5M+ Members' },
  { icon: Gift, label: '$2 Sign-up Bonus' },
];

const benefits = [
  'Earn rewards for sharing your opinions',
  'Flexible surveys that fit your schedule',
  'Trusted by leading research brands worldwide',
];

export default function HeroSection() {
  const { ref: marketingRef, className: marketingClass } = useScrollReveal();
  const { ref: formRef, className: formClass } = useScrollReveal();

  return (
    <section className="hero">
      <div className="hero__bg">
        <div className="hero__bg-image" />
        <div className="hero__bg-gradient" />
        <div className="hero__bg-orbs" aria-hidden="true">
          <span className="hero__orb hero__orb--1" />
          <span className="hero__orb hero__orb--2" />
          <span className="hero__orb hero__orb--3" />
        </div>
      </div>

      <div className="hero__content container-wide">
        <div ref={marketingRef} className={`hero__marketing ${marketingClass}`}>
          <span className="hero__badge">
            <Star size={14} fill="currentColor" />
            Trusted Research Community
          </span>

          <h1 className="hero__title">
            Join a trusted research community and{' '}
            <span className="hero__title-accent">get rewarded</span> for sharing your opinions
          </h1>

          <p className="hero__subtitle">
            Sign up for free and start earning exciting rewards today. Your voice shapes
            products and services used by millions worldwide.
          </p>

          <ul className="hero__benefits">
            {benefits.map((benefit) => (
              <li key={benefit} className="hero__benefit">
                <CheckCircle2 size={18} className="hero__benefit-icon" />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="hero__trust">
            {trustIndicators.map(({ icon: Icon, label }) => (
              <div key={label} className="hero__trust-item">
                <span className="hero__trust-icon">
                  <Icon size={18} />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div ref={formRef} className={`hero__form-wrapper ${formClass} reveal--delay-2`}>
          <div className="hero__form-card">
            <JoinForm />
          </div>
        </div>
      </div>
    </section>
  );
}
