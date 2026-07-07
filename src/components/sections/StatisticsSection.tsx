import { Users, ClipboardCheck, DollarSign, Globe2 } from 'lucide-react';
import Counter from '../ui/Counter';
import { statistics } from '../../data/mockData';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './StatisticsSection.css';

const statIcons = [Users, ClipboardCheck, DollarSign, Globe2];

export default function StatisticsSection() {
  const { ref, className } = useScrollReveal();

  return (
    <section className="statistics section" ref={ref}>
      <div className="container">
        <div className={`statistics__header ${className}`}>
          <h2 className="section-title">Trusted by Millions</h2>
          <p className="section-subtitle">
            Join a global community making an impact through research
          </p>
        </div>

        <div className="statistics__grid">
          {statistics.map((stat, index) => {
            const Icon = statIcons[index];
            return (
              <div
                key={stat.id}
                className={`statistics__item reveal reveal--delay-${index + 1} ${className.includes('reveal--visible') ? 'reveal--visible' : ''}`}
              >
                <div className="statistics__card">
                  <span className="statistics__icon" aria-hidden="true">
                    <Icon size={24} />
                  </span>
                  <Counter value={stat.value} suffix={stat.suffix} />
                  <p className="statistics__label">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
