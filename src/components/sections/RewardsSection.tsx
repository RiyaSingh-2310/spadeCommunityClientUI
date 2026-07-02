import { rewards } from '../../data/mockData';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './RewardsSection.css';

export default function RewardsSection() {
  const { ref, className } = useScrollReveal();

  return (
    <section className="rewards section" id="rewards" ref={ref}>
      <div className="container">
        <div className={className}>
          <h2 className="section-title section-title--light">
            Choose the reward that&apos;s perfect for you
          </h2>
          <p className="section-subtitle section-subtitle--light">
            Redeem your points for gift cards, cash, and more from trusted partners
          </p>
        </div>
        <div className="rewards__grid">
          {rewards.map((reward, index) => (
            <div
              key={reward.id}
              className={`rewards__card reveal reveal--delay-${(index % 3) + 1} ${className.includes('reveal--visible') ? 'reveal--visible' : ''}`}
            >
              <img src={reward.logo} alt={reward.name} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
