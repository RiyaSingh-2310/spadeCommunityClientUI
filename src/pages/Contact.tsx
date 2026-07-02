import ContactSection from '../components/sections/ContactSection';
import './PageStyles.css';

export default function Contact() {
  return (
    <div className="page">
      <div className="page__hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch with our team</p>
        </div>
      </div>
      <ContactSection />
    </div>
  );
}
