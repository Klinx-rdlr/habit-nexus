'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-hm-accent text-white hover:bg-hm-accent-hover focus-visible:ring-hm-accent',
  secondary:
    'bg-hm-bg-elevated text-hm-text-primary border border-hm-surface hover:bg-hm-bg-sunken focus-visible:ring-hm-surface',
  danger:
    'bg-hm-danger text-white hover:opacity-90 focus-visible:ring-hm-danger',
  ghost:
    'text-hm-text-secondary hover:bg-hm-bg-sunken hover:text-hm-text-primary focus-visible:ring-hm-surface',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      className = '',
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-card font-medium transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:pointer-events-none disabled:opacity-50
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
