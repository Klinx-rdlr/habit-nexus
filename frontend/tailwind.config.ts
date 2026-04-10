import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hm: {
          bg:              'var(--hm-bg)',
          'bg-elevated':   'var(--hm-bg-elevated)',
          'bg-sunken':     'var(--hm-bg-sunken)',
          surface:         'var(--hm-surface)',
          accent:          'var(--hm-accent)',
          'accent-hover':  'var(--hm-accent-hover)',
          'accent-subtle': 'var(--hm-accent-subtle)',
          success:         'var(--hm-success)',
          'success-subtle':'var(--hm-success-subtle)',
          warning:         'var(--hm-warning)',
          'warning-subtle':'var(--hm-warning-subtle)',
          danger:          'var(--hm-danger)',
          'danger-subtle': 'var(--hm-danger-subtle)',
        },
        'hm-text': {
          primary:   'var(--hm-text-primary)',
          secondary: 'var(--hm-text-secondary)',
          tertiary:  'var(--hm-text-tertiary)',
        },
        'hm-heat': {
          0: 'var(--hm-heat-0)',
          1: 'var(--hm-heat-1)',
          2: 'var(--hm-heat-2)',
          3: 'var(--hm-heat-3)',
          4: 'var(--hm-heat-4)',
        },
        // Kept for backward-compat with pages not yet redesigned
        surface: {
          0:   '#ffffff',
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        card: '12px',
        '4xl': '2rem',
      },
      boxShadow: {
        'hm-sm':   'var(--hm-shadow-sm)',
        'hm-md':   'var(--hm-shadow-md)',
        'hm-lg':   'var(--hm-shadow-lg)',
        'hm-glow': 'var(--hm-shadow-glow)',
        soft: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 2px 8px 0 rgb(0 0 0 / 0.04)',
      },
      animation: {
        'fade-in':       'fadeIn 0.2s ease-out both',
        'slide-up':      'cardSlideUp 0.3s ease-out both',
        'check-pulse':   'checkPulse 0.3s ease-out',
        'check-ripple':  'checkRipple 0.45s ease-out forwards',
        'flame-flicker': 'flameFlicker 2s ease-in-out infinite',
        'urgent-pulse':  'urgentPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        cardSlideUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        checkPulse: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        checkRipple: {
          '0%':   { transform: 'scale(0)',   opacity: '0.5' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        flameFlicker: {
          '0%, 100%': { transform: 'scaleY(1) rotate(0deg)' },
          '25%':      { transform: 'scaleY(1.05) rotate(-2deg)' },
          '75%':      { transform: 'scaleY(0.97) rotate(2deg)' },
        },
        urgentPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.65' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
