'use client';

import { useEffect, useMemo, useState } from 'react';

interface HeatmapCalendarProps {
  /** Map of "YYYY-MM-DD" → boolean (true = completed) */
  heatmap: Record<string, boolean>;
  /** Hex color for completed days (the habit's custom color) */
  color: string;
  frequencyType: string;
  /** Scheduled days (0=Mon … 6=Sun) for custom habits */
  scheduledDays?: number[];
}

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CELL_SIZE = 13;
const CELL_GAP = 3;
const CELL_STEP = CELL_SIZE + CELL_GAP;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Convert JS getDay() (0=Sun) to our schedule format (0=Mon … 6=Sun) */
function jsDayToScheduleDay(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

interface DayCell {
  date: Date;
  dateStr: string;
  col: number;
  row: number;
  completed: boolean;
  scheduled: boolean;
}

export function HeatmapCalendar({
  heatmap,
  color,
  frequencyType,
  scheduledDays = [],
}: HeatmapCalendarProps) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Go back ~26 weeks (6 months)
    const start = new Date(today);
    start.setDate(start.getDate() - 26 * 7);
    // Align to Monday
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
      const schedDay = jsDayToScheduleDay(cursor.getDay());
      const isScheduled =
        frequencyType === 'daily' || scheduledDays.includes(schedDay);

      days.push({
        date: new Date(cursor),
        dateStr,
        col,
        row,
        completed: !!heatmap[dateStr],
        scheduled: isScheduled,
      });

      if (cursor.getMonth() !== lastMonth) {
        months.push({ label: MONTH_NAMES[cursor.getMonth()], col });
        lastMonth = cursor.getMonth();
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return { cells: days, monthLabels: months, totalCols: col + 1 };
  }, [heatmap, frequencyType, scheduledDays]);

  const rgb = hexToRgb(color);
  const LEFT_PAD = 32;
  const TOP_PAD = 20;
  const svgWidth = LEFT_PAD + totalCols * CELL_STEP;
  const svgHeight = TOP_PAD + 7 * CELL_STEP;

  function getCellColor(cell: DayCell): string {
    if (cell.completed) return color;
    if (!cell.scheduled) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
  }

  function getDarkCellColor(cell: DayCell): string {
    if (cell.completed) return color;
    if (!cell.scheduled) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`;
  }

  function handleMouseEnter(cell: DayCell, e: React.MouseEvent) {
    const label = cell.completed
      ? 'Completed'
      : cell.scheduled
        ? 'Missed'
        : 'Not scheduled';
    setTooltip({
      text: `${formatDisplayDate(cell.date)} — ${label}`,
      x: e.clientX,
      y: e.clientY,
    });
  }

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="block"
        role="img"
        aria-label="Habit completion heatmap for the last 6 months"
      >
        {/* Month labels */}
        {monthLabels.map((m, i) => (
          <text
            key={`${m.label}-${i}`}
            x={LEFT_PAD + m.col * CELL_STEP}
            y={12}
            style={{ fill: 'var(--hm-text-tertiary)' }}
            fontSize={10}
            fontFamily="DM Sans, sans-serif"
          >
            {m.label}
          </text>
        ))}

        {/* Day labels */}
        {DAY_LABELS.map((label, i) =>
          label ? (
            <text
              key={label}
              x={0}
              y={TOP_PAD + i * CELL_STEP + CELL_SIZE - 2}
              style={{ fill: 'var(--hm-text-tertiary)' }}
              fontSize={10}
              fontFamily="DM Sans, sans-serif"
            >
              {label}
            </text>
          ) : null,
        )}

        {/* Day cells */}
        {cells.map((cell) => (
          <rect
            key={cell.dateStr}
            x={LEFT_PAD + cell.col * CELL_STEP}
            y={TOP_PAD + cell.row * CELL_STEP}
            width={CELL_SIZE}
            height={CELL_SIZE}
            rx={3}
            className="transition-opacity hover:opacity-75"
            style={{
              fill: isDark ? getDarkCellColor(cell) : getCellColor(cell),
            }}
            onMouseEnter={(e) => handleMouseEnter(cell, e)}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-hm-md"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 36,
            backgroundColor: 'var(--hm-text-primary)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
