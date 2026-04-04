'use client';

import { useEffect, useMemo, useState } from 'react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CELL_SIZE = 13;
const CELL_GAP = 3;
const CELL_STEP = CELL_SIZE + CELL_GAP;
const COLOR = '#6366f1'; // brand-500 indigo

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Simple seeded random for deterministic fake data */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateFakeData(): Record<string, boolean> {
  const data: Record<string, boolean> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rand = seededRandom(42);

  // Create a pattern with ~75% completion rate, with occasional streaks and gaps
  let momentum = 0.75;
  for (let i = 180; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const roll = rand();
    if (roll < momentum) {
      data[formatDate(d)] = true;
      momentum = Math.min(0.92, momentum + 0.02); // success breeds success
    } else {
      momentum = Math.max(0.5, momentum - 0.08); // miss drops momentum
    }
  }
  return data;
}

interface DayCell {
  dateStr: string;
  col: number;
  row: number;
  completed: boolean;
}

export function DemoHeatmap() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const { cells, monthLabels, totalCols } = useMemo(() => {
    const fakeData = generateFakeData();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(start.getDate() - 26 * 7);
    const startDay = start.getDay();
    const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
    start.setDate(start.getDate() + mondayOffset);

    const days: DayCell[] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;
    let col = 0;

    const cursor = new Date(start);
    while (cursor <= today) {
      const row = cursor.getDay() === 0 ? 6 : cursor.getDay() - 1;
      if (row === 0 && cursor > start) col++;

      const dateStr = formatDate(cursor);
      days.push({
        dateStr,
        col,
        row,
        completed: !!fakeData[dateStr],
      });

      if (cursor.getMonth() !== lastMonth) {
        months.push({ label: MONTH_NAMES[cursor.getMonth()], col });
        lastMonth = cursor.getMonth();
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return { cells: days, monthLabels: months, totalCols: col + 1 };
  }, []);

  const LEFT_PAD = 4;
  const TOP_PAD = 20;
  const svgWidth = LEFT_PAD + totalCols * CELL_STEP;
  const svgHeight = TOP_PAD + 7 * CELL_STEP;

  function getCellFill(completed: boolean): string {
    if (completed) return COLOR;
    return isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)';
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="mx-auto block"
        role="img"
        aria-label="Demo habit completion heatmap"
      >
        {monthLabels.map((m, i) => (
          <text
            key={`${m.label}-${i}`}
            x={LEFT_PAD + m.col * CELL_STEP}
            y={12}
            className="fill-surface-500 dark:fill-surface-400"
            fontSize={10}
          >
            {m.label}
          </text>
        ))}

        {cells.map((cell) => (
          <rect
            key={cell.dateStr}
            x={LEFT_PAD + cell.col * CELL_STEP}
            y={TOP_PAD + cell.row * CELL_STEP}
            width={CELL_SIZE}
            height={CELL_SIZE}
            rx={3}
            style={{ fill: getCellFill(cell.completed) }}
          />
        ))}
      </svg>
    </div>
  );
}
