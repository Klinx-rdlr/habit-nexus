export interface HabitCompletedEvent {
  type: 'habit.completed';
  userId: string;
  habitId: string;
  habitName: string;
  currentStreak: number;
  completedDate: string;
}

export interface StreakMilestoneEvent {
  type: 'streak.milestone';
  userId: string;
  habitId: string;
  habitName: string;
  milestone: number;
  occurredAt: string;
}
