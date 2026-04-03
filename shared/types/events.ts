export interface StreakBrokenEvent {
  type: 'streak.broken';
  userId: string;
  habitId: string;
  habitName: string;
  previousStreak: number;
  occurredAt: string;
}

export interface StreakMilestoneEvent {
  type: 'streak.milestone';
  userId: string;
  habitId: string;
  habitName: string;
  milestone: number;
  occurredAt: string;
}

export interface HabitCompletedEvent {
  type: 'habit.completed';
  userId: string;
  habitId: string;
  habitName: string;
  currentStreak: number;
  completedDate: string;
}

export interface MemberJoinedEvent {
  type: 'member.joined';
  groupId: string;
  groupName: string;
  userId: string;
  username: string;
}

export type HabitMapEvent =
  | StreakBrokenEvent
  | StreakMilestoneEvent
  | HabitCompletedEvent
  | MemberJoinedEvent;

export type test2 = "test2";