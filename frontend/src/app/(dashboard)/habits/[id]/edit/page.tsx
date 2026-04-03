'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHabit, updateHabit } from '@/lib/api/habits';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
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

export default function EditHabitPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: habit, isLoading } = useQuery({
    queryKey: ['habit', id],
    queryFn: () => getHabit(id),
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [frequencyType, setFrequencyType] = useState<'daily' | 'custom'>('daily');
  const [scheduledDays, setScheduledDays] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (habit && !initialized) {
      setName(habit.name);
      setDescription(habit.description ?? '');
      setColor(habit.color);
      setFrequencyType(habit.frequencyType as 'daily' | 'custom');
      setScheduledDays(habit.scheduledDays ?? []);
      setInitialized(true);
      document.title = `Edit ${habit.name} | HabitMap`;
    }
  }, [habit, initialized]);

  function toggleDay(day: number) {
    setScheduledDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Habit name is required');
      return;
    }
    setNameError('');
    setIsSaving(true);

    try {
      await updateHabit(id, {
        name,
        description: description || undefined,
        color,
        frequencyType,
        scheduledDays: frequencyType === 'custom' ? scheduledDays : undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['habit', id] });
      await queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit updated!');
      router.push(`/habits/${id}`);
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.message || 'Failed to update habit');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Habit not found
        </h1>
        <Button onClick={() => router.push('/habits')} className="mt-6">
          Back to habits
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-surface-900 dark:text-surface-100">
        Edit habit
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Name"
          placeholder="e.g. Read for 30 minutes"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          error={nameError}
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
            onClick={() => router.push(`/habits/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving} className="flex-1">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
