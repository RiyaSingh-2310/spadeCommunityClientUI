import type { ReactNode } from 'react';
import { Zap, ClipboardList, Shield, Globe, Gift, Award } from 'lucide-react';
import { features } from '../../data/mockData';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './WhyJoinSection.css';

const iconMap: Record<string, ReactNode> = {
  zap: <Zap size={28} strokeWidth={2} />,
  clipboard: <ClipboardList size={28} strokeWidth={2} />,
  shield: <Shield size={28} strokeWidth={2} />,
  globe: <Globe size={28} strokeWidth={2} />,
  gift: <Gift size={28} strokeWidth={2} />,
  award: <Award size={28} strokeWidth={2} />,
};

export default function WhyJoinSection() {
  const { ref, className } = useScrollReveal();

  return (
    <section className="why-join section" id="why-join" ref={ref}>
      <div className="container">
        <div className={className}>
          <h2 className="section-title">Why Join Us</h2>
          <p className="section-subtitle">
            Everything you need to earn rewards while sharing opinions that matter
          </p>
        </div>

        <div className="why-join__grid">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`why-join__card reveal reveal--delay-${(index % 3) + 1} ${className.includes('reveal--visible') ? 'reveal--visible' : ''}`}
            >
              <div className="why-join__icon">{iconMap[feature.icon]}</div>
              <h3 className="why-join__title">{feature.title}</h3>
              <p className="why-join__description">{feature.description}</p>
              <span className="why-join__card-glow" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
