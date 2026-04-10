'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-hm-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-card border bg-hm-bg-sunken px-4 py-3 text-sm
            text-hm-text-primary placeholder:text-hm-text-tertiary
            transition-colors
            focus:outline-none focus:ring-2
            disabled:cursor-not-allowed disabled:opacity-60
            ${
              error
                ? 'border-hm-danger focus:border-hm-danger focus:ring-hm-danger'
                : 'border-hm-surface focus:border-hm-accent focus:ring-hm-accent'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium text-hm-danger">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-hm-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
