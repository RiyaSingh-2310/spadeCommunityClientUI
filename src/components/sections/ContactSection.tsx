import { useState, type FormEvent } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { contactInfo } from '../../data/mockData';
import './ContactSection.css';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="contact section" id="contact">
      <div className="container">
        <h2 className="section-title">Contact Us</h2>
        <div className="contact__grid">
          <form className="contact__form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="contact__success">
                <h3>Thank you!</h3>
                <p>Your message has been sent. We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <>
                <Input
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  required
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
                <Input
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  required
                />
                <div className="input-group">
                  <textarea
                    name="message"
                    className="contact__textarea"
                    placeholder="Message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    required
                  />
                </div>
                <Button type="submit" variant="primary" size="lg">
                  Submit
                </Button>
              </>
            )}
          </form>

          <div className="contact__info">
            <div className="contact__info-item">
              <Mail size={24} className="contact__info-icon" />
              <div>
                <h4>Email</h4>
                <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
              </div>
            </div>
            <div className="contact__info-item">
              <Phone size={24} className="contact__info-icon" />
              <div>
                <h4>Phone</h4>
                <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
              </div>
            </div>
            <div className="contact__info-item">
              <MapPin size={24} className="contact__info-icon" />
              <div>
                <h4>Address</h4>
                <p>{contactInfo.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
