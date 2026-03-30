import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CompletionsService } from './completions.service';

describe('CompletionsService', () => {
  let service: CompletionsService;
  let prisma: Record<string, any>;
  let streaks: Record<string, any>;
  let redis: Record<string, any>;
  let events: Record<string, any>;

  const userId = 'user-1';
  const habitId = 'habit-1';
  const timezone = 'Asia/Manila';

  const makeHabit = (overrides: Record<string, any> = {}) => ({
    id: habitId,
    userId,
    name: 'Read',
    description: null,
    color: '#6366f1',
    frequencyType: 'daily',
    targetCount: 1,
    currentStreak: 5,
    longestStreak: 10,
    streakStartDate: null,
    isArchived: false,
    createdAt: new Date('2026-01-01'),
    schedule: [],
    ...overrides,
  });

  const makeCompletion = (overrides: Record<string, any> = {}) => ({
    id: 'comp-1',
    habitId,
    completedDate: new Date('2026-03-30'),
    note: null,
    createdAt: new Date('2026-03-30T08:00:00Z'),
    ...overrides,
  });

  beforeEach(() => {
    prisma = {
      habit: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      completion: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    streaks = {
      getTodayInTimezone: jest.fn().mockReturnValue('2026-03-30'),
      parseDate: jest.fn((d: string) => new Date(d)),
      formatDate: jest.fn((d: Date) => d.toISOString().split('T')[0]),
      subtractDays: jest.fn((d: Date, n: number) => {
        const result = new Date(d);
        result.setDate(result.getDate() - n);
        return result;
      }),
      calculateStreak: jest.fn().mockReturnValue({ currentStreak: 5, longestStreak: 10 }),
      isScheduledDay: jest.fn().mockReturnValue(true),
    };
    redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    events = {
      publishHabitCompleted: jest.fn(),
      checkAndPublishMilestone: jest.fn(),
    };

    service = new CompletionsService(
      prisma as any,
      streaks as any,
      redis as any,
      events as any,
    );
  });

  describe('complete', () => {
    it('should throw ConflictException when completing a habit twice on the same day', async () => {
      prisma.habit.findUnique.mockResolvedValue(makeHabit());
      prisma.completion.findUnique.mockResolvedValue(makeCompletion());

      await expect(
        service.complete(userId, habitId, { date: '2026-03-30' } as any, timezone),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when habit does not exist', async () => {
      prisma.habit.findUnique.mockResolvedValue(null);

      await expect(
        service.complete(userId, habitId, {} as any, timezone),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when habit belongs to another user', async () => {
      prisma.habit.findUnique.mockResolvedValue(makeHabit({ userId: 'user-2' }));

      await expect(
        service.complete(userId, habitId, {} as any, timezone),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create a completion successfully', async () => {
      const habit = makeHabit();
      prisma.habit.findUnique
        .mockResolvedValueOnce(habit)     // initial lookup
        .mockResolvedValueOnce(habit)     // recalculateStreak lookup
        .mockResolvedValueOnce({ ...habit, currentStreak: 6 }); // post-update lookup
      prisma.completion.findUnique.mockResolvedValue(null);
      prisma.completion.create.mockResolvedValue(makeCompletion());
      prisma.completion.findMany.mockResolvedValue([]);
      prisma.habit.update.mockResolvedValue(undefined);

      const result = await service.complete(userId, habitId, {} as any, timezone);

      expect(result.id).toBe('comp-1');
      expect(prisma.completion.create).toHaveBeenCalledTimes(1);
      expect(events.publishHabitCompleted).toHaveBeenCalled();
    });
  });

  describe('undo', () => {
    it('should throw NotFoundException when completion does not exist for the given date', async () => {
      prisma.habit.findUnique.mockResolvedValue(makeHabit());
      prisma.completion.findUnique.mockResolvedValue(null);

      await expect(
        service.undo(userId, habitId, '2026-03-30', timezone),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when habit does not exist', async () => {
      prisma.habit.findUnique.mockResolvedValue(null);

      await expect(
        service.undo(userId, habitId, '2026-03-30', timezone),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when habit belongs to another user', async () => {
      prisma.habit.findUnique.mockResolvedValue(makeHabit({ userId: 'user-2' }));

      await expect(
        service.undo(userId, habitId, '2026-03-30', timezone),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should delete the completion successfully', async () => {
      const habit = makeHabit();
      prisma.habit.findUnique
        .mockResolvedValueOnce(habit)   // initial lookup
        .mockResolvedValueOnce(habit);  // recalculateStreak lookup
      prisma.completion.findUnique.mockResolvedValue(makeCompletion());
      prisma.completion.delete.mockResolvedValue(undefined);
      prisma.completion.findMany.mockResolvedValue([]);
      prisma.habit.update.mockResolvedValue(undefined);

      await service.undo(userId, habitId, '2026-03-30', timezone);

      expect(prisma.completion.delete).toHaveBeenCalledWith({
        where: { id: 'comp-1' },
      });
    });
  });

  describe('getStats', () => {
    it('should return correct completionRate when there are scheduled days', async () => {
      const habit = makeHabit();
      prisma.habit.findUnique.mockResolvedValue(habit);
      prisma.completion.findMany.mockResolvedValue([
        makeCompletion({ completedDate: new Date('2026-03-30') }),
        makeCompletion({ completedDate: new Date('2026-03-29') }),
        makeCompletion({ completedDate: new Date('2026-03-28') }),
      ]);
      prisma.completion.count.mockResolvedValue(50);

      // isScheduledDay returns true for all days (daily habit), so scheduledCount = 30
      // 3 out of 30 dates have completions
      // But we need completionDates to actually match what formatDate returns
      // formatDate mock will produce the ISO date string from the Date
      // The completion dates are 2026-03-30, 2026-03-29, 2026-03-28
      // subtractDays from 2026-03-30 for i=0..29 gives 2026-03-30 down to 2026-03-01
      // So 3 of 30 scheduled days are completed => rate = Math.round(3/30*100) = 10

      const result = await service.getStats(userId, habitId, timezone);

      expect(result.completionRate).toBe(10);
      expect(result.totalCompletions).toBe(50);
      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(10);
      expect(result.heatmap).toBeDefined();
    });

    it('should return completionRate of 0 when no days are scheduled', async () => {
      const habit = makeHabit({ frequencyType: 'custom', schedule: [] });
      prisma.habit.findUnique.mockResolvedValue(habit);
      prisma.completion.findMany.mockResolvedValue([]);
      prisma.completion.count.mockResolvedValue(0);

      // No days are scheduled for custom with empty schedule
      streaks.isScheduledDay.mockReturnValue(false);

      const result = await service.getStats(userId, habitId, timezone);

      expect(result.completionRate).toBe(0);
      expect(result.totalCompletions).toBe(0);
    });

    it('should throw NotFoundException when habit does not exist', async () => {
      prisma.habit.findUnique.mockResolvedValue(null);

      await expect(
        service.getStats(userId, habitId, timezone),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return cached result when available', async () => {
      const cached = {
        currentStreak: 5,
        longestStreak: 10,
        totalCompletions: 50,
        completionRate: 80,
        heatmap: {},
      };
      redis.get.mockResolvedValue(cached);

      const result = await service.getStats(userId, habitId, timezone);

      expect(result).toEqual(cached);
      expect(prisma.habit.findUnique).not.toHaveBeenCalled();
    });
  });
});
