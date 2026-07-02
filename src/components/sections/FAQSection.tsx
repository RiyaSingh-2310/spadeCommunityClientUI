import Accordion from '../ui/Accordion';
import { faqItems } from '../../data/mockData';
import { Link } from 'react-router-dom';
import './FAQSection.css';

export default function FAQSection() {
  return (
    <section className="faq section" id="faq">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <Accordion items={faqItems} />
        <p className="faq__more">
          Have more questions?{' '}
          <Link to="/faq">View all FAQs</Link> or{' '}
          <Link to="/contact">contact us</Link>.
        </p>
      </div>
    </section>
  );
}
