import type { ReactNode } from 'react';

/** Deterministic pseudo-random fill for the decorative heatmap background */
function isCellFilled(col: number, row: number): boolean {
  const n = ((col * 2654435761) ^ (row * 1234567891)) >>> 0;
  return n % 100 < 32;
}

function HeatmapDecoration() {
  const COLS = 58;
  const ROWS = 7;
  const SIZE = 11;
  const GAP = 3;
  const STEP = SIZE + GAP;

  return (
    <div
      className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <svg
        width={COLS * STEP}
        height={ROWS * STEP}
        className="opacity-[0.055]"
      >
        {Array.from({ length: COLS }, (_, c) =>
          Array.from({ length: ROWS }, (_, r) => {
            const filled = isCellFilled(c, r);
            return (
              <rect
                key={`${c}-${r}`}
                x={c * STEP}
                y={r * STEP}
                width={SIZE}
                height={SIZE}
                rx={2}
                style={{
                  fill: filled ? 'var(--hm-accent)' : 'var(--hm-surface)',
                }}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-hm-bg to-hm-bg-sunken px-4 py-12">
      <HeatmapDecoration />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + wordmark */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-hm-accent shadow-hm-glow">
            <span className="font-display text-xl font-bold text-white">H</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-hm-text-primary">
            HabitMap
          </h1>
          <p className="mt-1 text-sm text-hm-text-tertiary">
            Build habits. Stay accountable.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-card border border-hm-surface bg-hm-bg-elevated p-8 shadow-hm-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
