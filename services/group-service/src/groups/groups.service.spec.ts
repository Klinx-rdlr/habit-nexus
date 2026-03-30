import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { GroupsService } from './groups.service';

describe('GroupsService', () => {
  let service: GroupsService;
  let prisma: Record<string, any>;
  let authClient: Record<string, any>;
  let habitClient: Record<string, any>;
  let redis: Record<string, any>;
  let events: Record<string, any>;

  beforeEach(() => {
    prisma = {
      group: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      groupMember: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
      groupInvite: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    authClient = {
      getUsersByIds: jest.fn().mockResolvedValue([]),
    };

    habitClient = {
      getHabitsByUserId: jest.fn().mockResolvedValue([]),
    };

    redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    events = {
      publishMemberJoined: jest.fn(),
    };

    service = new GroupsService(
      prisma as any,
      authClient as any,
      habitClient as any,
      redis as any,
      events as any,
    );
  });

  describe('join', () => {
    it('should throw NotFoundException for an invalid invite code', async () => {
      prisma.group.findUnique.mockResolvedValue(null);
      prisma.groupInvite.findUnique.mockResolvedValue(null);

      await expect(service.join('user-1', 'bad-code')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.join('user-1', 'bad-code')).rejects.toThrow(
        'Invalid invite code',
      );
    });

    it('should throw ConflictException when joining via permanent invite code and already a member', async () => {
      prisma.group.findUnique.mockResolvedValue({
        id: 'group-1',
        name: 'Test Group',
        inviteCode: 'permanent-code',
        members: [{ userId: 'user-1', role: 'member' }],
      });

      await expect(service.join('user-1', 'permanent-code')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.join('user-1', 'permanent-code')).rejects.toThrow(
        'You are already a member of this group',
      );
    });

    it('should throw ConflictException when joining via generated invite and already a member', async () => {
      prisma.group.findUnique.mockResolvedValue(null);
      prisma.groupInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        code: 'generated-code',
        groupId: 'group-1',
        isUsed: false,
        expiresAt: new Date(Date.now() + 86400000), // tomorrow
        group: {
          id: 'group-1',
          name: 'Test Group',
          members: [{ userId: 'user-1', role: 'member' }],
        },
      });

      await expect(service.join('user-1', 'generated-code')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.join('user-1', 'generated-code')).rejects.toThrow(
        'You are already a member of this group',
      );
    });
  });

  describe('removeMember', () => {
    it('should throw ForbiddenException when a non-admin tries to remove a member', async () => {
      const groupId = 'group-1';
      const userId = 'regular-user';
      const targetUserId = 'target-user';

      prisma.group.findUnique.mockResolvedValue({ id: groupId });
      prisma.groupMember.findUnique.mockResolvedValue({
        groupId,
        userId,
        role: 'member',
      });

      await expect(
        service.removeMember(userId, groupId, targetUserId),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.removeMember(userId, groupId, targetUserId),
      ).rejects.toThrow('Admin access required');
    });

    it('should throw BadRequestException when the last admin tries to remove themselves', async () => {
      const groupId = 'group-1';
      const adminId = 'admin-user';

      // requireAdmin check: group exists, user is admin
      prisma.group.findUnique.mockResolvedValue({ id: groupId });
      prisma.groupMember.findUnique.mockResolvedValue({
        groupId,
        userId: adminId,
        role: 'admin',
      });
      // Only one admin in the group
      prisma.groupMember.count.mockResolvedValue(1);

      await expect(
        service.removeMember(adminId, groupId, adminId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.removeMember(adminId, groupId, adminId),
      ).rejects.toThrow('Cannot remove yourself as the last admin');
    });
  });

  describe('createInvite', () => {
    it('should throw ForbiddenException when a non-admin tries to generate an invite', async () => {
      const groupId = 'group-1';
      const userId = 'regular-user';

      prisma.group.findUnique.mockResolvedValue({ id: groupId });
      prisma.groupMember.findUnique.mockResolvedValue({
        groupId,
        userId,
        role: 'member',
      });

      await expect(service.createInvite(userId, groupId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.createInvite(userId, groupId)).rejects.toThrow(
        'Admin access required',
      );
    });
  });
});
