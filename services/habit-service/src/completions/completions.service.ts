import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StreaksService } from '../streaks/streaks.service';
import { RedisService } from '../redis/redis.service';
import { EventsService } from '../events/events.service';
import { CreateCompletionDto } from './dto/create-completion.dto';

@Injectable()
export class CompletionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streaks: StreaksService,
    private readonly redis: RedisService,
    private readonly events: EventsService,
  ) {}

  async complete(userId: string, habitId: string, dto: CreateCompletionDto, timezone: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
      include: { schedule: true },
    });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();

    const dateStr = dto.date || this.streaks.getTodayInTimezone(timezone);
    const previousStreak = habit.currentStreak;

    const existing = await this.prisma.completion.findUnique({
      where: { habitId_completedDate: { habitId, completedDate: new Date(dateStr) } },
    });
    if (existing) throw new ConflictException('Already completed for this date');

    const completion = await this.prisma.completion.create({
      data: {
        habitId,
        completedDate: new Date(dateStr),
        note: dto.note,
      },
    });

    await this.recalculateStreak(habitId, timezone);
    await this.invalidateCache(userId, habitId);

    // Get updated streak value
    const updated = await this.prisma.habit.findUnique({ where: { id: habitId } });
    const currentStreak = updated?.currentStreak ?? 0;

    // Publish habit.completed event
    this.events.publishHabitCompleted({
      userId,
      habitId,
      habitName: habit.name,
      currentStreak,
      completedDate: dateStr,
    });

    // Check and publish streak milestone events
    this.events.checkAndPublishMilestone(
      userId,
      habitId,
      habit.name,
      previousStreak,
      currentStreak,
    );

    return this.toResponse(completion);
  }

  async undo(userId: string, habitId: string, date: string, timezone: string) {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();

    const completion = await this.prisma.completion.findUnique({
      where: { habitId_completedDate: { habitId, completedDate: new Date(date) } },
    });
    if (!completion) throw new NotFoundException('Completion not found for this date');

    await this.prisma.completion.delete({ where: { id: completion.id } });

    await this.recalculateStreak(habitId, timezone);
    await this.invalidateCache(userId, habitId);
  }

  async findHistory(userId: string, habitId: string, from?: string, to?: string) {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();

    const where: Record<string, unknown> = { habitId };
    if (from || to) {
      where.completedDate = {};
      if (from) (where.completedDate as Record<string, unknown>).gte = new Date(from);
      if (to) (where.completedDate as Record<string, unknown>).lte = new Date(to);
    }

    const completions = await this.prisma.completion.findMany({
      where,
      orderBy: { completedDate: 'desc' },
    });

    return completions.map((c) => this.toResponse(c));
  }

  async getStats(userId: string, habitId: string, timezone: string) {
    const cacheKey = `habits:stats:${habitId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
      include: { schedule: true },
    });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();

    const today = this.streaks.getTodayInTimezone(timezone);
    const sixMonthsAgo = this.streaks.formatDate(
      this.streaks.subtractDays(this.streaks.parseDate(today), 180),
    );

    const completions = await this.prisma.completion.findMany({
      where: {
        habitId,
        completedDate: { gte: new Date(sixMonthsAgo) },
      },
    });

    const completionDates = new Set(
      completions.map((c) => c.completedDate.toISOString().split('T')[0]),
    );

    const scheduledDays = habit.schedule.map((s) => s.dayOfWeek);
    const streakResult = this.streaks.calculateStreak(
      habit.frequencyType,
      scheduledDays,
      completionDates,
      timezone,
    );

    // Completion rate: scheduled days in last 30 that were completed
    let scheduledCount = 0;
    let completedCount = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = this.streaks.subtractDays(this.streaks.parseDate(today), i);
      if (this.streaks.isScheduledDay(habit.frequencyType, scheduledDays, checkDate)) {
        scheduledCount++;
        if (completionDates.has(this.streaks.formatDate(checkDate))) {
          completedCount++;
        }
      }
    }
    const completionRate = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;

    // Heatmap: date → boolean for last 6 months
    const heatmap: Record<string, boolean> = {};
    for (let i = 0; i < 180; i++) {
      const d = this.streaks.formatDate(
        this.streaks.subtractDays(this.streaks.parseDate(today), i),
      );
      heatmap[d] = completionDates.has(d);
    }

    // Total completions across all time
    const totalCompletions = await this.prisma.completion.count({
      where: { habitId },
    });

    const result = {
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      totalCompletions,
      completionRate,
      heatmap,
    };

    await this.redis.set(cacheKey, result, 600); // 10 minutes TTL
    return result;
  }

  private async recalculateStreak(habitId: string, timezone: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
      include: { schedule: true },
    });
    if (!habit) return;

    const completions = await this.prisma.completion.findMany({
      where: { habitId },
    });

    const completionDates = new Set(
      completions.map((c) => c.completedDate.toISOString().split('T')[0]),
    );
    const scheduledDays = habit.schedule.map((s) => s.dayOfWeek);

    const result = this.streaks.calculateStreak(
      habit.frequencyType,
      scheduledDays,
      completionDates,
      timezone,
    );

    await this.prisma.habit.update({
      where: { id: habitId },
      data: {
        currentStreak: result.currentStreak,
        longestStreak: result.longestStreak,
        streakStartDate:
          result.currentStreak > 0
            ? this.streaks.subtractDays(
                this.streaks.parseDate(this.streaks.getTodayInTimezone(timezone)),
                result.currentStreak - 1,
              )
            : null,
      },
    });
  }

  private async invalidateCache(userId: string, habitId: string) {
    await this.redis.del(
      `habits:today:${userId}`,
      `habits:stats:${habitId}`,
    );
  }

  private toResponse(completion: {
    id: string;
    habitId: string;
    completedDate: Date;
    note: string | null;
    createdAt: Date;
  }) {
    return {
      id: completion.id,
      habitId: completion.habitId,
      completedDate: completion.completedDate.toISOString().split('T')[0],
      note: completion.note,
      createdAt: completion.createdAt.toISOString(),
    };
  }
}
