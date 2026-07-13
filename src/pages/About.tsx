import {
  Globe,
  Heart,
  Lightbulb,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuthModal } from '../context/AuthModalContext';
import { features, statistics, steps } from '../data/mockData';
import './PublicPages.css';

const valueIcons = [Heart, Target, Shield, Users];
const whyJoin = [
  'Earn rewards for credible, high-quality research participation',
  'Flexible studies designed around your schedule',
  'Trusted by global brands and research institutions',
  'Transparent payouts with enterprise-grade privacy',
];

export default function About() {
  const { openSignup } = useAuthModal();

  return (
    <div className="pub-page">
      <section className="pub-hero">
        <div className="container-wide pub-hero__inner">
          <p className="pub-hero__eyebrow">
            <Sparkles size={13} aria-hidden="true" />
            About Spade Community
          </p>
          <h1>Empowering voices that shape better products</h1>
          <p>
            We connect panelists with meaningful market research opportunities from leading brands
            worldwide — rewarding your perspective with transparency and care.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="container-wide pub-split">
          <div className="pub-split__image">
            <img src="/images/about-image.jpg" alt="Spade Community research panel" />
          </div>
          <div className="pub-split__content">
            <h2>Our Mission</h2>
            <p>
              Spade Community is a premier online research panel operated by Spade Market Research (P)
              Ltd. We believe every opinion matters and empower members to influence the products and
              services they use every day.
            </p>
            <p>
              Founded with the vision of making market research accessible and rewarding, we have grown
              into a global community of millions of members across 50+ countries.
            </p>
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--muted">
        <div className="container-wide">
          <div className="pub-section__head">
            <h2>Our Vision</h2>
            <p>
              To become the world&apos;s most trusted community research platform — where every voice
              drives innovation and creates meaningful impact.
            </p>
          </div>
          <div className="pub-grid-2">
            <article className="pub-card">
              <div className="pub-card__icon">
                <Lightbulb size={20} aria-hidden="true" />
              </div>
              <h3>Meaningful Impact</h3>
              <p>
                Your feedback directly influences product development, policy decisions, and customer
                experiences across industries.
              </p>
            </article>
            <article className="pub-card">
              <div className="pub-card__icon">
                <Globe size={20} aria-hidden="true" />
              </div>
              <h3>Global Reach</h3>
              <p>
                Join a diverse community spanning continents, cultures, and perspectives — all united by
                the power of honest insight.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pub-section">
        <div className="container-wide">
          <div className="pub-section__head">
            <h2>Why Join Our Community</h2>
            <p>Become part of a premium research network built for modern panelists.</p>
          </div>
          <div className="pub-grid-2">
            {whyJoin.map((item) => (
              <article key={item} className="pub-card">
                <div className="pub-card__icon">
                  <Zap size={18} aria-hidden="true" />
                </div>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--muted">
        <div className="container-wide">
          <div className="pub-section__head">
            <h2>How It Works</h2>
            <p>Three simple steps to start earning rewards for sharing your opinions.</p>
          </div>
          <div className="pub-steps">
            {steps.map((step) => (
              <article key={step.id} className="pub-step">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section">
        <div className="container-wide">
          <div className="pub-section__head">
            <h2>Community Values</h2>
            <p>Principles that guide how we build trust with every member.</p>
          </div>
          <div className="pub-grid-4">
            {features.slice(0, 4).map((feature, index) => {
              const Icon = valueIcons[index] ?? Sparkles;
              return (
                <article key={feature.id} className="pub-card">
                  <div className="pub-card__icon">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--muted">
        <div className="container-wide">
          <div className="pub-section__head">
            <h2>Trust &amp; Security</h2>
            <p>
              Your data is protected with industry-standard security practices. We never sell personal
              information and maintain strict confidentiality across every study.
            </p>
          </div>
          <div className="pub-grid-3">
            <article className="pub-card">
              <div className="pub-card__icon">
                <Shield size={18} aria-hidden="true" />
              </div>
              <h3>Enterprise Security</h3>
              <p>Encrypted data handling and secure authentication protect your account.</p>
            </article>
            <article className="pub-card">
              <div className="pub-card__icon">
                <Users size={18} aria-hidden="true" />
              </div>
              <h3>Verified Community</h3>
              <p>Every member is verified to ensure research quality and platform integrity.</p>
            </article>
            <article className="pub-card">
              <div className="pub-card__icon">
                <Target size={18} aria-hidden="true" />
              </div>
              <h3>Transparent Rewards</h3>
              <p>Clear point tracking and straightforward redemption with no hidden fees.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="pub-section">
        <div className="container-wide">
          <div className="pub-section__head">
            <h2>By the Numbers</h2>
            <p>A growing community making a global impact.</p>
          </div>
          <div className="pub-grid-4">
            {statistics.map((stat) => (
              <article key={stat.id} className="pub-stat">
                <strong>
                  {stat.value >= 1_000_000
                    ? `${(stat.value / 1_000_000).toFixed(1)}M`
                    : stat.value.toLocaleString()}
                  {stat.suffix}
                </strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--muted">
        <div className="container-wide">
          <div className="pub-cta">
            <h2>Ready to share your perspective?</h2>
            <p>
              Join thousands of panelists earning rewards while shaping the products and services of
              tomorrow.
            </p>
            <Button variant="primary" size="lg" onClick={openSignup}>
              Join Our Community
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
