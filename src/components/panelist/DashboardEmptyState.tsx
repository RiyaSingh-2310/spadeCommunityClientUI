import type { ReactNode } from 'react';

interface DashboardEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export default function DashboardEmptyState({ icon, title, description }: DashboardEmptyStateProps) {
  return (
    <div className="panelist-empty">
      {icon ? <div className="panelist-empty__icon">{icon}</div> : null}
      <p className="panelist-empty__title">{title}</p>
      {description ? <p className="panelist-empty__desc">{description}</p> : null}
    </div>
  );
}
