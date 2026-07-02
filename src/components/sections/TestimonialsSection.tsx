import Carousel from '../ui/Carousel';
import { testimonials } from '../../data/mockData';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './TestimonialsSection.css';

export default function TestimonialsSection() {
  const { ref, className } = useScrollReveal();

  return (
    <section className="testimonials section" id="testimonials" ref={ref}>
      <div className="container">
        <div className={className}>
          <h2 className="section-title">What Our Members Say</h2>
          <p className="section-subtitle">
            Real stories from members earning rewards around the world
          </p>
        </div>
        <div className={`testimonials__carousel ${className.includes('reveal--visible') ? 'reveal reveal--visible' : 'reveal'}`}>
          <Carousel items={testimonials} />
        </div>
      </div>
    </section>
  );
}
