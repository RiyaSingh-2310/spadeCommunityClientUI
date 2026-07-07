import { Banknote, Gift, Sparkles, Wallet } from 'lucide-react';
import { rewards } from '../../data/mockData';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './RewardsSection.css';

const rewardTypes = [
  { icon: Gift, label: 'Gift Cards', desc: 'Redeem with leading retail partners' },
  { icon: Banknote, label: 'Cash Rewards', desc: 'Direct payouts to your preferred method' },
  { icon: Wallet, label: 'Digital Wallets', desc: 'Instant transfers to popular wallets' },
  { icon: Sparkles, label: 'Exclusive Perks', desc: 'Bonus incentives for active members' },
];

export default function RewardsSection() {
  const { ref, className } = useScrollReveal();

  return (
    <section className="rewards-v2 section" id="rewards" ref={ref}>
      <div className="container">
        <div className={`rewards-v2__intro ${className}`}>
          <span className="rewards-v2__label">Rewards</span>
          <h2 className="section-title section-title--light">
            Membership rewards that feel premium
          </h2>
          <p className="section-subtitle section-subtitle--light">
            Flexible redemption options designed for a global research community.
          </p>
        </div>

        <div className="rewards-v2__types">
          {rewardTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div
                key={type.label}
                className={`rewards-v2__type reveal reveal--delay-${(index % 4) + 1} ${className.includes('reveal--visible') ? 'reveal--visible' : ''}`}
              >
                <div className="rewards-v2__type-icon">
                  <Icon size={22} />
                </div>
                <h3>{type.label}</h3>
                <p>{type.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="rewards-v2__partners">
          <p className="rewards-v2__partners-label">Trusted redemption partners</p>
          <div className="rewards-v2__grid">
            {rewards.map((reward, index) => (
              <div
                key={reward.id}
                className={`rewards-v2__partner reveal reveal--delay-${(index % 3) + 1} ${className.includes('reveal--visible') ? 'reveal--visible' : ''}`}
              >
                <img src={reward.logo} alt={reward.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
