import { api } from './client';

export interface HabitResponse {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  frequencyType: string;
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  streakStartDate: string | null;
  isArchived: boolean;
  createdAt: string;
  scheduledDays?: number[];
}

export interface TodayHabitResponse extends HabitResponse {
  completedToday: boolean;
}

export interface CompletionResponse {
  id: string;
  habitId: string;
  completedDate: string;
  note: string | null;
  createdAt: string;
}

export interface HabitStatsResponse {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  heatmap: Record<string, boolean>;
}

export async function createHabit(body: {
  name: string;
  description?: string;
  color?: string;
  frequencyType: string;
  targetCount?: number;
  scheduledDays?: number[];
}): Promise<HabitResponse> {
  const { data } = await api.post<HabitResponse>('/habits', body);
  return data;
}

export async function getHabits(
  archived?: boolean,
): Promise<HabitResponse[]> {
  const { data } = await api.get<HabitResponse[]>('/habits', {
    params: archived !== undefined ? { archived } : undefined,
  });
  return data;
}

export async function getTodayHabits(): Promise<TodayHabitResponse[]> {
  const { data } = await api.get<TodayHabitResponse[]>('/habits/today');
  return data;
}

export async function getHabit(id: string): Promise<HabitResponse> {
  const { data } = await api.get<HabitResponse>(`/habits/${id}`);
  return data;
}

export async function updateHabit(
  id: string,
  body: {
    name?: string;
    description?: string;
    color?: string;
    frequencyType?: string;
    targetCount?: number;
    scheduledDays?: number[];
  },
): Promise<HabitResponse> {
  const { data } = await api.patch<HabitResponse>(`/habits/${id}`, body);
  return data;
}

export async function deleteHabit(id: string): Promise<void> {
  await api.delete(`/habits/${id}`);
}

export async function completeHabit(
  id: string,
  body?: { date?: string; note?: string },
): Promise<CompletionResponse> {
  const { data } = await api.post<CompletionResponse>(
    `/habits/${id}/complete`,
    body ?? {},
  );
  return data;
}

export async function undoCompletion(
  id: string,
  date: string,
): Promise<void> {
  await api.delete(`/habits/${id}/complete/${date}`);
}

export async function getCompletions(
  id: string,
  params?: { from?: string; to?: string },
): Promise<CompletionResponse[]> {
  const { data } = await api.get<CompletionResponse[]>(
    `/habits/${id}/completions`,
    { params },
  );
  return data;
}

export async function getHabitStats(id: string): Promise<HabitStatsResponse> {
  const { data } = await api.get<HabitStatsResponse>(`/habits/${id}/stats`);
  return data;
}
