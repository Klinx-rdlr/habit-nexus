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

export interface MemberJoinedEvent {
  type: 'member.joined';
  groupId: string;
  groupName: string;
  userId: string;
  username: string;
}
