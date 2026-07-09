import type { ReactNode } from 'react';
import AnimatedPoints from './AnimatedPoints';

interface DashboardStatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  suffix?: string;
  loading?: boolean;
  accent?: 'violet' | 'cyan' | 'emerald' | 'amber';
}

export default function DashboardStatCard({
  icon,
  label,
  value,
  suffix = ' pts',
  loading = false,
  accent = 'violet',
}: DashboardStatCardProps) {
  return (
    <article className={`panelist-stat-card panelist-stat-card--${accent}`}>
      <div className="panelist-stat-card__icon">{icon}</div>
      <p className="panelist-stat-card__label">{label}</p>
      {loading ? (
        <div className="panelist-skeleton panelist-skeleton--value" aria-hidden="true" />
      ) : (
        <AnimatedPoints value={value} suffix={suffix} className="panelist-stat-card__value" />
      )}
    </article>
  );
}
