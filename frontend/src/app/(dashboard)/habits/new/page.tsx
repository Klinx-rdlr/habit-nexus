'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHabit } from '@/lib/api/habits';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { AxiosError } from 'axios';

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function NewHabitPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [frequencyType, setFrequencyType] = useState<'daily' | 'custom'>(
    'daily',
  );
  const [scheduledDays, setScheduledDays] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'New Habit | HabitMap';
  }, []);

  function toggleDay(day: number) {
    setScheduledDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createHabit({
        name,
        description: description || undefined,
        color,
        frequencyType,
        scheduledDays:
          frequencyType === 'custom' ? scheduledDays : undefined,
      });
      toast.success('Habit created!');
      router.push('/today');
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.message || 'Failed to create habit');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-surface-900 dark:text-surface-100">
        New habit
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Name"
          placeholder="e.g. Read for 30 minutes"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
        />

        <Input
          label="Description (optional)"
          placeholder="Why this habit matters to you"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Color
          </label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-10 w-10 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-surface-900' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Frequency
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFrequencyType('daily')}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                frequencyType === 'daily'
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-700'
                  : 'border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800'
              }`}
            >
              Every day
            </button>
            <button
              type="button"
              onClick={() => setFrequencyType('custom')}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                frequencyType === 'custom'
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-700'
                  : 'border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800'
              }`}
            >
              Custom days
            </button>
          </div>

          {frequencyType === 'custom' && (
            <div className="flex flex-wrap gap-2 pt-2">
              {DAYS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    scheduledDays.includes(i)
                      ? 'bg-brand-600 text-white'
                      : 'border border-surface-200 text-surface-600 hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800'
                  }`}
                >
                  {label.charAt(0)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            Create habit
          </Button>
        </div>
      </form>
    </div>
  );
}
