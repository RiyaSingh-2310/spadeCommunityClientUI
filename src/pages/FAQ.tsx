import Accordion from '../components/ui/Accordion';
import { faqItems } from '../data/mockData';
import './PageStyles.css';

export default function FAQ() {
  return (
    <div className="page">
      <div className="page__hero">
        <div className="container">
          <h1>FAQ</h1>
          <p>Find answers to commonly asked questions</p>
        </div>
      </div>
      <div className="page__content container">
        <Accordion items={faqItems} />
      </div>
    </div>
  );
}
