import { Test, TestingModule } from '@nestjs/testing';
import { DailyCheckerWorker } from './daily-checker.worker';
import { AuthClientService } from '../clients/auth-client.service';
import { HabitClientService } from '../clients/habit-client.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GroupClientService } from '../clients/group-client.service';

describe('DailyCheckerWorker', () => {
  let worker: DailyCheckerWorker;
  let authClient: { getUsersByTimezone: jest.Mock };
  let habitClient: { getHabitsByUserId: jest.Mock };
  let notifications: { create: jest.Mock };
  let groupClient: { getGroupsByUserId: jest.Mock };

  beforeEach(async () => {
    authClient = { getUsersByTimezone: jest.fn() };
    habitClient = { getHabitsByUserId: jest.fn() };
    notifications = { create: jest.fn() };
    groupClient = { getGroupsByUserId: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyCheckerWorker,
        { provide: AuthClientService, useValue: authClient },
        { provide: HabitClientService, useValue: habitClient },
        { provide: NotificationsService, useValue: notifications },
        { provide: GroupClientService, useValue: groupClient },
      ],
    }).compile();

    worker = module.get<DailyCheckerWorker>(DailyCheckerWorker);
  });

  describe('getTimezonesMidnightNow', () => {
    it('should return an array of timezone strings', () => {
      const result = worker.getTimezonesMidnightNow();
      expect(Array.isArray(result)).toBe(true);
      for (const tz of result) {
        expect(typeof tz).toBe('string');
      }
    });
  });

  describe('processTimezone', () => {
    it('should process all users in a timezone', async () => {
      authClient.getUsersByTimezone.mockResolvedValue([
        { id: 'u1', username: 'alice' },
        { id: 'u2', username: 'bob' },
      ]);
      habitClient.getHabitsByUserId.mockResolvedValue([]);
      groupClient.getGroupsByUserId.mockResolvedValue([]);

      await worker.processTimezone('Asia/Manila');

      expect(authClient.getUsersByTimezone).toHaveBeenCalledWith('Asia/Manila');
      expect(habitClient.getHabitsByUserId).toHaveBeenCalledTimes(2);
    });

    it('should handle errors for individual users without crashing', async () => {
      authClient.getUsersByTimezone.mockResolvedValue([
        { id: 'u1', username: 'alice' },
        { id: 'u2', username: 'bob' },
      ]);
      habitClient.getHabitsByUserId
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce([]);
      groupClient.getGroupsByUserId.mockResolvedValue([]);

      await expect(worker.processTimezone('Asia/Manila')).resolves.not.toThrow();
      expect(habitClient.getHabitsByUserId).toHaveBeenCalledTimes(2);
    });

    it('should detect broken streak and create notification', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const format = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      authClient.getUsersByTimezone.mockResolvedValue([
        { id: 'u1', username: 'alice' },
      ]);
      habitClient.getHabitsByUserId.mockResolvedValue([
        {
          id: 'h1',
          name: 'Exercise',
          frequencyType: 'daily',
          scheduledDays: [],
          currentStreak: 0,
          longestStreak: 5,
          color: '#6366f1',
          recentCompletions: [format(twoDaysAgo)],
        },
      ]);
      groupClient.getGroupsByUserId.mockResolvedValue([]);

      await worker.processTimezone('UTC');

      expect(notifications.create).toHaveBeenCalledWith(
        'u1',
        'streak.broken',
        expect.stringContaining('streak on Exercise was broken'),
        expect.objectContaining({ habitId: 'h1' }),
      );
    });

    it('should not notify for streak break if yesterday was completed', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const format = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      authClient.getUsersByTimezone.mockResolvedValue([
        { id: 'u1', username: 'alice' },
      ]);
      habitClient.getHabitsByUserId.mockResolvedValue([
        {
          id: 'h1',
          name: 'Exercise',
          frequencyType: 'daily',
          scheduledDays: [],
          currentStreak: 3,
          longestStreak: 5,
          color: '#6366f1',
          recentCompletions: [format(yesterday)],
        },
      ]);
      groupClient.getGroupsByUserId.mockResolvedValue([]);

      await worker.processTimezone('UTC');

      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('should not notify if no previous streak existed', async () => {
      authClient.getUsersByTimezone.mockResolvedValue([
        { id: 'u1', username: 'alice' },
      ]);
      habitClient.getHabitsByUserId.mockResolvedValue([
        {
          id: 'h1',
          name: 'Exercise',
          frequencyType: 'daily',
          scheduledDays: [],
          currentStreak: 0,
          longestStreak: 0,
          color: '#6366f1',
          recentCompletions: [],
        },
      ]);
      groupClient.getGroupsByUserId.mockResolvedValue([]);

      await worker.processTimezone('UTC');

      expect(notifications.create).not.toHaveBeenCalled();
    });
  });

  describe('checkStreaks', () => {
    it('should process forced timezone', async () => {
      authClient.getUsersByTimezone.mockResolvedValue([]);

      await worker.checkStreaks('America/New_York');

      expect(authClient.getUsersByTimezone).toHaveBeenCalledWith('America/New_York');
    });
  });
});
