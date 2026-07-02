import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import './AboutSection.css';

export default function AboutSection() {
  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="about__grid">
          <div className="about__image-wrapper">
            <img
              src="/images/about-image.jpg"
              alt="Spade Community members collaborating"
              loading="lazy"
            />
          </div>
          <div className="about__content">
            <h2 className="about__title">About Spade Community</h2>
            <p className="about__text">
              Spade Community is a leading online panel that connects members with
              market research opportunities from top brands worldwide. Our mission is
              to make it easy and rewarding for people to share their opinions and
              influence the products and services they use every day.
            </p>
            <p className="about__text">
              With millions of members across the globe, we provide a trusted platform
              where your voice matters. Join today and be part of a community that
              shapes the future of consumer research.
            </p>
            <Link to="/about">
              <Button variant="gradient" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
