import { useEffect, useRef, useState } from 'react';

interface AnimatedPointsProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function AnimatedPoints({
  value,
  suffix = ' pts',
  duration = 1400,
  className = '',
}: AnimatedPointsProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) return;
        setHasAnimated(true);
        const start = performance.now();

        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          setCount(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(animate);
          else setCount(value);
        };

        requestAnimationFrame(animate);
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    setCount(value);
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
