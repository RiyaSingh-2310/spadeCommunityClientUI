import Button from '../components/ui/Button';
import { useAuthModal } from '../context/AuthModalContext';
import './PageStyles.css';

export default function About() {
  const { openSignup } = useAuthModal();

  return (
    <div className="page">
      <div className="page__hero page__hero--about">
        <div className="container">
          <h1>About Spade Community</h1>
          <p>Empowering voices worldwide through meaningful market research</p>
        </div>
      </div>

      <div className="page__content container">
        <div className="page__intro">
          <p>
            Spade Community is a leading online panel that connects members with
            market research opportunities from top brands worldwide. Our mission is
            to make it easy and rewarding for people to share their opinions and
            influence the products and services they use every day.
          </p>
        </div>

        <div className="page__grid">
          <div className="page__image">
            <img src="/images/about-image.jpg" alt="About Spade Community" />
          </div>
          <div className="page__text">
            <h2>Company Overview</h2>
            <p>
              Spade Community is a premier online research panel operated by Spade
              Market Research (P) Ltd. We connect everyday consumers with leading
              brands and research companies, enabling members to share their opinions
              and earn rewards for their valuable insights.
            </p>
            <p>
              Founded with the vision of making market research accessible and
              rewarding for everyone, we have grown into a global community of
              millions of members across 50+ countries.
            </p>
            <p>
              With millions of members across the globe, we provide a trusted platform
              where your voice matters. Join today and be part of a community that
              shapes the future of consumer research.
            </p>
          </div>
        </div>

        <div className="page__values">
          <div className="page__value-card">
            <span className="page__value-icon">🎯</span>
            <h2>Our Mission</h2>
            <p>
              We believe that every opinion matters. Our platform empowers members
              to influence the products and services they use while earning exciting
              rewards for their participation. We are committed to maintaining the
              highest standards of data privacy and security.
            </p>
          </div>
          <div className="page__value-card">
            <span className="page__value-icon">🌍</span>
            <h2>Our Vision</h2>
            <p>
              To become the world&apos;s most trusted and rewarding community research
              platform — where every member&apos;s voice drives innovation, shapes better
              products, and creates meaningful impact across industries and borders.
            </p>
          </div>
        </div>

        <div className="page__cta">
          <Button variant="gradient" size="lg" onClick={openSignup}>
            Join Our Community
          </Button>
        </div>
      </div>
    </div>
  );
}
