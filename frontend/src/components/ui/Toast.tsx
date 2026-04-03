'use client';

import { useContext } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { ToastContext, type Toast as ToastType } from '@/context/ToastContext';

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastType;
  onDismiss: (id: string) => void;
}) {
  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`
        flex items-center gap-3 rounded-lg border px-4 py-3 shadow-card
        ${toast.dismissing ? 'animate-toast-out' : 'animate-toast-in'}
        ${
          isSuccess
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
        }
      `}
    >
      {isSuccess ? (
        <CheckCircle className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}
      <p className="text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-auto shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const context = useContext(ToastContext);
  if (!context) return null;
  const { toasts, dismiss } = context;

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2 max-sm:left-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}
