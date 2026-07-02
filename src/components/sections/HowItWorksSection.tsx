import { steps } from '../../data/mockData';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './HowItWorksSection.css';

export default function HowItWorksSection() {
  const { ref, className } = useScrollReveal();

  return (
    <section className="how-it-works section" id="how-it-works" ref={ref}>
      <div className="container">
        <div className={className}>
          <h2 className="section-title">3 Simple Steps</h2>
          <p className="section-subtitle">
            Getting started is easy — join, share your opinions, and earn rewards.
          </p>
        </div>
        <div className="how-it-works__grid">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`how-it-works__step reveal reveal--delay-${index + 1} ${className.includes('reveal--visible') ? 'reveal--visible' : ''}`}
            >
              {index > 0 && (
                <div className="how-it-works__connector" aria-hidden="true">
                  <div className="how-it-works__connector-line" />
                  <div className="how-it-works__connector-arrow">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="how-it-works__card">
                <span className="how-it-works__number">{step.id}</span>
                <div className="how-it-works__image-wrapper">
                  <img src={step.image} alt={step.title} loading="lazy" />
                </div>
                <h3 className="how-it-works__title">{step.title}</h3>
                <p className="how-it-works__description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
