import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  variant?: 'default' | 'modal';
  showPasswordToggle?: boolean;
}

export default function Input({
  label,
  icon,
  error,
  id,
  variant = 'default',
  showPasswordToggle = false,
  type = 'text',
  className = '',
  ...props
}: InputProps) {
  const inputId = id || props.name;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPasswordField = showPasswordToggle || type === 'password';
  const resolvedType = isPasswordField && showPasswordToggle
    ? passwordVisible
      ? 'text'
      : 'password'
    : type;

  return (
    <div
      className={`input-group ${error ? 'input-group--error' : ''} ${variant === 'modal' ? 'input-group--modal' : ''} ${showPasswordToggle ? 'input-group--password' : ''} ${className}`}
    >
      {label && (
        <label htmlFor={inputId} className="input-group__label">
          {label}
        </label>
      )}
      <div className="input-group__wrapper">
        {icon && <span className="input-group__icon">{icon}</span>}
        <input
          id={inputId}
          className="input-group__input"
          type={resolvedType}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="input-group__toggle"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={passwordVisible}
            tabIndex={0}
            disabled={props.disabled}
          >
            {passwordVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        )}
      </div>
      {error && <span className="input-group__error">{error}</span>}
    </div>
  );
}
