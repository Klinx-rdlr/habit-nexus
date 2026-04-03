import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notification: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      notification: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('findAll', () => {
    it('should return paginated notifications', async () => {
      const notifications = [
        {
          id: 'n1',
          userId: 'u1',
          type: 'streak.milestone',
          message: 'You hit 7 days!',
          isRead: false,
          metadata: null,
          createdAt: new Date('2026-03-30'),
        },
      ];
      prisma.notification.findMany.mockResolvedValue(notifications);
      prisma.notification.count.mockResolvedValue(1);

      const result = await service.findAll('u1');

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.data[0].id).toBe('n1');
    });

    it('should filter unread notifications', async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      await service.findAll('u1', true);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', isRead: false },
        }),
      );
    });

    it('should paginate correctly', async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(50);

      const result = await service.findAll('u1', undefined, 3, 10);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.totalPages).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notification = {
        id: 'n1',
        userId: 'u1',
        type: 'streak.milestone',
        message: 'msg',
        isRead: false,
        metadata: null,
        createdAt: new Date(),
      };
      prisma.notification.findUnique.mockResolvedValue(notification);
      prisma.notification.update.mockResolvedValue({
        ...notification,
        isRead: true,
      });

      const result = await service.markAsRead('u1', 'n1');

      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException for non-existent notification', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('u1', 'fake')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for another user notification', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 'n1',
        userId: 'other-user',
        type: 'test',
        message: 'msg',
        isRead: false,
        metadata: null,
        createdAt: new Date(),
      });

      await expect(service.markAsRead('u1', 'n1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead('u1');

      expect(result.markedCount).toBe(5);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', isRead: false },
        data: { isRead: true },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return the unread count', async () => {
      prisma.notification.count.mockResolvedValue(3);

      const result = await service.getUnreadCount('u1');

      expect(result.unreadCount).toBe(3);
    });

    it('should return 0 when no unread notifications', async () => {
      prisma.notification.count.mockResolvedValue(0);

      const result = await service.getUnreadCount('u1');

      expect(result.unreadCount).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a notification with metadata', async () => {
      const created = {
        id: 'n1',
        userId: 'u1',
        type: 'streak.milestone',
        message: '7-day streak!',
        isRead: false,
        metadata: { habitId: 'h1' },
        createdAt: new Date(),
      };
      prisma.notification.create.mockResolvedValue(created);

      const result = await service.create(
        'u1',
        'streak.milestone',
        '7-day streak!',
        { habitId: 'h1' },
      );

      expect(result).toEqual(created);
    });

    it('should create a notification without metadata', async () => {
      prisma.notification.create.mockResolvedValue({
        id: 'n1',
        userId: 'u1',
        type: 'test',
        message: 'Hello',
        isRead: false,
        metadata: null,
        createdAt: new Date(),
      });

      await service.create('u1', 'test', 'Hello');

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          type: 'test',
          message: 'Hello',
          metadata: undefined,
        },
      });
    });
  });
});
