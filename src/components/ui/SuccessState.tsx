import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import './SuccessState.css';

interface SuccessStateProps {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  body?: ReactNode;
  meta?: ReactNode;
  note?: ReactNode;
  actions?: ReactNode;
  autoHint?: string;
  variant?: 'default' | 'premium';
  iconVariant?: 'default' | 'accent' | 'violet';
  exiting?: boolean;
  badges?: { label: string; success?: boolean }[];
}

export default function SuccessState({
  icon: Icon,
  eyebrow,
  title,
  body,
  meta,
  note,
  actions,
  autoHint,
  variant = 'default',
  iconVariant = 'default',
  exiting = false,
  badges,
}: SuccessStateProps) {
  const ringClass =
    iconVariant === 'accent'
      ? 'success-state__icon-ring--accent'
      : iconVariant === 'violet'
        ? 'success-state__icon-ring--violet'
        : '';

  const iconClass =
    iconVariant === 'accent' ? 'success-state__icon--accent' : 'success-state__icon';

  return (
    <div
      className={`success-state ${variant === 'premium' ? 'success-state--premium' : ''} ${exiting ? 'success-state--exiting' : ''}`}
      role="status"
    >
      <div className={`success-state__icon-ring ${ringClass}`}>
        <Icon className={iconClass} size={40} strokeWidth={1.75} aria-hidden="true" />
      </div>

      {eyebrow && <p className="success-state__eyebrow">{eyebrow}</p>}
      <h3 className="success-state__title">{title}</h3>

      {body && <div className="success-state__body">{body}</div>}
      {meta && <div className="success-state__meta">{meta}</div>}
      {note && <p className="success-state__note">{note}</p>}

      {badges && badges.length > 0 && (
        <div className="success-state__badges">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={`success-state__badge ${badge.success ? 'success-state__badge--success' : ''}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {actions && <div className="success-state__actions">{actions}</div>}
      {autoHint && <p className="success-state__auto-hint">{autoHint}</p>}
    </div>
  );
}
