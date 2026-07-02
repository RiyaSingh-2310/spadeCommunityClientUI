import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  country: string;
  image: string;
  review: string;
  rating?: number;
}

interface CarouselProps {
  items: Testimonial[];
  autoPlayInterval?: number;
}

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="carousel__stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={16}
          className={`carousel__star${i < rating ? ' carousel__star--filled' : ''}`}
          fill={i < rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

export default function Carousel({ items, autoPlayInterval = 5000 }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    setIsAnimating(true);
    setCurrent(index);
    setTimeout(() => setIsAnimating(false), 400);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % items.length);
  }, [current, items.length, goTo]);

  const prev = () => {
    goTo((current - 1 + items.length) % items.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setCurrent((prev) => (prev + 1) % items.length);
      setTimeout(() => setIsAnimating(false), 400);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [items.length, autoPlayInterval]);

  const item = items[current];

  return (
    <div className="carousel">
      <div className={`carousel__content ${isAnimating ? 'carousel__content--animating' : ''}`}>
        <Quote className="carousel__quote-icon" size={36} />
        <StarRating rating={item.rating} />
        <p className="carousel__review">&ldquo;{item.review}&rdquo;</p>
        <div className="carousel__author">
          <img
            src={item.image}
            alt={item.name}
            className="carousel__avatar"
            loading="lazy"
          />
          <div className="carousel__author-info">
            <p className="carousel__name">{item.name}</p>
            <p className="carousel__country">{item.country}</p>
          </div>
        </div>
      </div>

      <div className="carousel__controls">
        <button className="carousel__btn" onClick={prev} aria-label="Previous testimonial">
          <ChevronLeft size={22} />
        </button>
        <div className="carousel__dots">
          {items.map((_, index) => (
            <button
              key={index}
              className={`carousel__dot ${index === current ? 'carousel__dot--active' : ''}`}
              onClick={() => goTo(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        <button className="carousel__btn" onClick={next} aria-label="Next testimonial">
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}
