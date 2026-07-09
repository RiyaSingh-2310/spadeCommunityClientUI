type BadgeVariant = 'pending' | 'approved' | 'rejected' | 'completed' | 'in-progress';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

function normalizeVariant(status: string): BadgeVariant {
  const lower = status.toLowerCase();
  if (lower.includes('reject')) return 'rejected';
  if (lower.includes('approv') || lower.includes('success') || lower.includes('complete')) return 'approved';
  if (lower.includes('progress')) return 'in-progress';
  if (lower.includes('pending')) return 'pending';
  return 'completed';
}

function formatLabel(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes('reject')) return 'Rejected';
  if (lower.includes('approv')) return 'Approved';
  if (lower.includes('complete')) return 'Completed';
  if (lower.includes('progress')) return 'In Progress';
  if (lower.includes('pending')) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const variant = normalizeVariant(status);
  return (
    <span className={`panelist-badge panelist-badge--${variant} ${className}`.trim()}>
      {formatLabel(status)}
    </span>
  );
}
