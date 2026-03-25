import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthClientService } from '../clients/auth-client.service';
import { HabitClientService, UserHabit } from '../clients/habit-client.service';
import { RedisService } from '../redis/redis.service';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalStreakDays?: number;
  completionRate?: number;
  habits: {
    id: string;
    name: string;
    color: string;
    currentStreak: number;
    longestStreak: number;
  }[];
  habitCount: number;
  dataAvailable: boolean;
}

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authClient: AuthClientService,
    private readonly habitClient: HabitClientService,
    private readonly redis: RedisService,
  ) {}

  async getLeaderboard(
    userId: string,
    groupId: string,
    rankBy: 'streaks' | 'completion' = 'streaks',
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) throw new NotFoundException('Group not found');

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('You are not a member of this group');

    // Check cache
    const cacheKey = `groups:leaderboard:${groupId}:${rankBy}`;
    const cached = await this.redis.get<ReturnType<typeof this.buildResponse>>(cacheKey);
    if (cached) return cached;

    const memberIds = group.members.map((m) => m.userId);

    // Fetch usernames and habits in parallel
    const [users, habitsMap] = await Promise.all([
      this.authClient.getUsersByIds(memberIds),
      this.fetchAllMemberHabits(memberIds),
    ]);

    const usernameMap = new Map(users.map((u) => [u.id, u.username]));

    const entries: LeaderboardEntry[] = memberIds.map((memberId) => {
      const habits = habitsMap.get(memberId);
      const username = usernameMap.get(memberId) || 'Unknown';

      if (!habits) {
        return {
          rank: 0,
          userId: memberId,
          username,
          habits: [],
          habitCount: 0,
          dataAvailable: false,
        };
      }

      const habitList = habits.map((h) => ({
        id: h.id,
        name: h.name,
        color: h.color,
        currentStreak: h.currentStreak,
        longestStreak: h.longestStreak,
      }));

      const entry: LeaderboardEntry = {
        rank: 0,
        userId: memberId,
        username,
        habits: habitList,
        habitCount: habits.length,
        dataAvailable: true,
      };

      if (rankBy === 'streaks') {
        entry.totalStreakDays = habits.reduce((sum, h) => sum + h.currentStreak, 0);
      } else {
        entry.completionRate = this.calculateWeeklyCompletionRate(habits);
      }

      return entry;
    });

    // Sort: available data first, then by metric descending
    entries.sort((a, b) => {
      if (a.dataAvailable !== b.dataAvailable) return a.dataAvailable ? -1 : 1;

      if (rankBy === 'streaks') {
        return (b.totalStreakDays ?? 0) - (a.totalStreakDays ?? 0);
      }
      return (b.completionRate ?? 0) - (a.completionRate ?? 0);
    });

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = entry.dataAvailable ? index + 1 : 0;
    });

    const result = this.buildResponse(group, rankBy, entries);
    await this.redis.set(cacheKey, result, 600); // 10 minutes TTL
    return result;
  }

  private buildResponse(
    group: { id: string; name: string },
    rankBy: string,
    entries: LeaderboardEntry[],
  ) {
    return {
      groupId: group.id,
      groupName: group.name,
      rankBy,
      entries,
      cachedAt: new Date().toISOString(),
    };
  }

  private async fetchAllMemberHabits(
    memberIds: string[],
  ): Promise<Map<string, UserHabit[] | null>> {
    const results = await Promise.all(
      memberIds.map(async (id) => {
        const habits = await this.habitClient.getHabitsByUserId(id);
        return [id, habits] as const;
      }),
    );
    return new Map(results);
  }

  private calculateWeeklyCompletionRate(habits: UserHabit[]): number {
    if (habits.length === 0) return 0;

    // For weekly completion rate we use a simplified calculation:
    // Sum of currentStreak across habits / total habits as a percentage proxy.
    // A more accurate calculation would require completion data for this week,
    // which would need an additional endpoint. For now, we approximate using
    // the ratio of habits with active streaks (currentStreak > 0).
    const activeHabits = habits.filter((h) => h.currentStreak > 0).length;
    return Math.round((activeHabits / habits.length) * 100);
  }
}
