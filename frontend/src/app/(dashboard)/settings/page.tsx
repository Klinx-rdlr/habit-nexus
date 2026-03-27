'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setTheme(getTheme());
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', next);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-surface-900 dark:text-surface-100">
        Settings
      </h1>

      <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
              Appearance
            </p>
            <p className="mt-0.5 text-xs text-surface-500">
              Toggle between light and dark mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
          >
            {theme === 'dark' ? (
              <>
                <Moon className="h-4 w-4" />
                Dark
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                Light
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
