import { steps } from '../../data/mockData';
import { UserPlus, ClipboardList, Gift } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './HowItWorksSection.css';

const stepIcons = [UserPlus, ClipboardList, Gift];

export default function HowItWorksSection() {
  const { ref, className } = useScrollReveal();

  return (
    <section className="process section" id="how-it-works" ref={ref}>
      <div className="container">
        <div className={`process__intro ${className}`}>
          <span className="process__label">How it works</span>
          <h2 className="section-title">Three steps to meaningful rewards</h2>
          <p className="section-subtitle">
            A streamlined journey from signup to your first redemption — designed for clarity.
          </p>
        </div>

        <div className="process__timeline">
          <div className="process__track" aria-hidden="true" />
          {steps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <article
                key={step.id}
                className={`process__step reveal reveal--delay-${index + 1} ${className.includes('reveal--visible') ? 'reveal--visible' : ''}`}
              >
                <div className="process__node">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <div className="process__card">
                  <span className="process__step-num">0{step.id}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
