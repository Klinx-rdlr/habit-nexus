import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { HabitsService } from './habits.service';

describe('HabitsService', () => {
  let service: HabitsService;
  let prisma: Record<string, any>;
  let streaks: Record<string, any>;
  let redis: Record<string, any>;

  const userId = 'user-1';
  const otherUserId = 'user-2';

  const makeHabit = (overrides: Record<string, any> = {}) => ({
    id: 'habit-1',
    userId,
    name: 'Read',
    description: null,
    color: '#6366f1',
    frequencyType: 'daily',
    targetCount: 1,
    currentStreak: 0,
    longestStreak: 0,
    streakStartDate: null,
    isArchived: false,
    createdAt: new Date('2026-01-01'),
    schedule: [],
    ...overrides,
  });

  beforeEach(() => {
    prisma = {
      habit: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    streaks = {};
    redis = {};

    service = new HabitsService(prisma as any, streaks as any, redis as any);
  });

  describe('create', () => {
    it('should throw BadRequestException when frequencyType is custom but scheduledDays is empty', async () => {
      const dto = {
        name: 'Exercise',
        frequencyType: 'custom',
        scheduledDays: [],
      };

      await expect(service.create(userId, dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when frequencyType is custom but scheduledDays is undefined', async () => {
      const dto = {
        name: 'Exercise',
        frequencyType: 'custom',
      };

      await expect(service.create(userId, dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a daily habit successfully', async () => {
      const dto = { name: 'Read', frequencyType: 'daily' };
      const created = makeHabit();
      prisma.habit.create.mockResolvedValue(created);

      const result = await service.create(userId, dto as any);

      expect(prisma.habit.create).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('Read');
      expect(result.frequencyType).toBe('daily');
    });
  });

  describe('findAll', () => {
    it('should return only non-archived habits by default', async () => {
      const active = makeHabit({ id: 'h-1', name: 'Active' });
      prisma.habit.findMany.mockResolvedValue([active]);

      const result = await service.findAll(userId);

      expect(prisma.habit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, isArchived: false },
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Active');
    });

    it('should exclude archived habits after archiving', async () => {
      // First call returns active habits, simulating state after archive
      prisma.habit.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId, false);

      expect(prisma.habit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, isArchived: false },
        }),
      );
      expect(result).toHaveLength(0);
    });

    it('should return archived habits when archived=true', async () => {
      const archived = makeHabit({ id: 'h-2', name: 'Old', isArchived: true });
      prisma.habit.findMany.mockResolvedValue([archived]);

      const result = await service.findAll(userId, true);

      expect(prisma.habit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, isArchived: true },
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0].isArchived).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when habit does not exist', async () => {
      prisma.habit.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when habit belongs to another user', async () => {
      prisma.habit.findUnique.mockResolvedValue(
        makeHabit({ userId: otherUserId }),
      );

      await expect(service.findOne(userId, 'habit-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return the habit when it exists and belongs to the user', async () => {
      prisma.habit.findUnique.mockResolvedValue(makeHabit());

      const result = await service.findOne(userId, 'habit-1');

      expect(result.id).toBe('habit-1');
      expect(result.name).toBe('Read');
    });
  });

  describe('archive', () => {
    it('should throw NotFoundException when habit does not exist', async () => {
      prisma.habit.findUnique.mockResolvedValue(null);

      await expect(service.archive(userId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when habit belongs to another user', async () => {
      prisma.habit.findUnique.mockResolvedValue(
        makeHabit({ userId: otherUserId }),
      );

      await expect(service.archive(userId, 'habit-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should archive the habit and then findAll excludes it', async () => {
      prisma.habit.findUnique.mockResolvedValue(makeHabit());
      prisma.habit.update.mockResolvedValue(undefined);

      await service.archive(userId, 'habit-1');

      expect(prisma.habit.update).toHaveBeenCalledWith({
        where: { id: 'habit-1' },
        data: { isArchived: true },
      });

      // After archiving, findAll with archived=false should not include it
      prisma.habit.findMany.mockResolvedValue([]);
      const result = await service.findAll(userId, false);
      expect(result).toHaveLength(0);
    });
  });
});
