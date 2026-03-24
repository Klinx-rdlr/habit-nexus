export interface Group {
  id: string;
  createdBy: string;
  name: string;
  description: string | null;
  inviteCode: string;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  code: string;
  expiresAt: string;
  isUsed: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalStreaks: number;
  longestStreak: number;
  habitsCompleted: number;
}
