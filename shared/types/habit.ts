export interface Habit {
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
}

export interface Completion {
  id: string;
  habitId: string;
  completedDate: string;
  note: string | null;
  createdAt: string;
}

export interface HabitSchedule {
  id: string;
  habitId: string;
  dayOfWeek: number;
}

export interface HabitWithStats extends Habit {
  completions?: Completion[];
  schedule?: HabitSchedule[];
}
