import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
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
    <motion.article
      className={`panelist-stat-card panelist-stat-card--${accent}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -3 }}
    >
      <div className="panelist-stat-card__icon">{icon}</div>
      <p className="panelist-stat-card__label">{label}</p>
      {loading ? (
        <div className="panelist-skeleton panelist-skeleton--value" aria-hidden="true" />
      ) : (
        <AnimatedPoints value={value} suffix={suffix} className="panelist-stat-card__value" />
      )}
    </motion.article>
  );
}
