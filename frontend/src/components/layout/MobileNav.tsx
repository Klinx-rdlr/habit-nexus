'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-0 z-50 w-72 animate-slide-in">
        <Sidebar onNavigate={onClose} />
        <button
          onClick={onClose}
          className="absolute right-3 top-4 rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
