import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Headphones,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { contactInfo } from '../data/mockData';
import './PublicPages.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pub-page">
      <section className="pub-hero">
        <div className="container-wide pub-hero__inner">
          <p className="pub-hero__eyebrow">
            <Sparkles size={13} aria-hidden="true" />
            Contact Us
          </p>
          <h1>We&apos;re here to help</h1>
          <p>
            Have a question about your account, rewards, or surveys? Reach out and our support team
            will get back to you promptly.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="container-wide pub-contact-grid">
          <div>
            <div className="pub-info-card">
              <div className="pub-info-card__icon">
                <Mail size={18} aria-hidden="true" />
              </div>
              <div>
                <h4>Email</h4>
                <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
              </div>
            </div>

            <div className="pub-info-card">
              <div className="pub-info-card__icon">
                <Phone size={18} aria-hidden="true" />
              </div>
              <div>
                <h4>Phone</h4>
                <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
              </div>
            </div>

            <div className="pub-info-card">
              <div className="pub-info-card__icon">
                <Clock size={18} aria-hidden="true" />
              </div>
              <div>
                <h4>Office Hours</h4>
                <p>Monday – Friday, 9:00 AM – 6:00 PM IST</p>
              </div>
            </div>

            <div className="pub-info-card">
              <div className="pub-info-card__icon">
                <MapPin size={18} aria-hidden="true" />
              </div>
              <div>
                <h4>Address</h4>
                <p>{contactInfo.address}</p>
              </div>
            </div>

            <div className="pub-shortcuts">
              <Link to="/faq" className="pub-shortcut">
                <HelpCircle size={14} aria-hidden="true" />
                Browse FAQ
              </Link>
              <a href={`mailto:${contactInfo.email}`} className="pub-shortcut">
                <Headphones size={14} aria-hidden="true" />
                Email Support
              </a>
            </div>
          </div>

          <article className="pub-form-card">
            <h2 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Send us a message
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: 'var(--color-gray-500)' }}>
              Fill out the form and we&apos;ll respond within 1–2 business days.
            </p>

            {submitted ? (
              <div className="pub-success">
                <MessageSquare size={32} style={{ margin: '0 auto 12px', color: 'var(--color-secondary)' }} />
                <h3>Thank you!</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-gray-600)' }}>
                  Your message has been sent. We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form className="pub-form" onSubmit={handleSubmit}>
                <input
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, fullName: event.target.value }))}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
                <input
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(event) => setFormData((prev) => ({ ...prev, subject: event.target.value }))}
                  required
                />
                <textarea
                  placeholder="Your message"
                  rows={5}
                  value={formData.message}
                  onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                  required
                />
                <Button type="submit" variant="primary" size="md">
                  Send Message
                </Button>
              </form>
            )}
          </article>
        </div>
      </section>

      <section className="pub-section pub-section--muted">
        <div className="container-wide">
          <div className="pub-cta">
            <h2>Need quick answers?</h2>
            <p>
              Check our FAQ for instant help with account setup, surveys, rewards, and redemption.
            </p>
            <Link to="/faq">
              <Button variant="outline" size="md">
                Visit FAQ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
