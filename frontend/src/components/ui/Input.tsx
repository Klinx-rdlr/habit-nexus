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
            className="block text-sm font-medium text-surface-700 dark:text-surface-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-lg border px-3 py-2.5 text-sm
            transition-colors placeholder:text-surface-400
            focus:outline-none focus:ring-2 focus:ring-offset-1
            dark:focus:ring-offset-surface-900
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700'
                : 'border-surface-200 focus:border-brand-500 focus:ring-brand-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100'
            }
            disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-surface-50 dark:disabled:bg-surface-800/50
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-surface-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
