export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 dark:bg-surface-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
            <span className="text-lg font-bold text-white">H</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            HabitMap
          </h1>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-surface-0 p-8 shadow-card dark:border-surface-800 dark:bg-surface-900">
          {children}
        </div>
      </div>
    </div>
  );
}
