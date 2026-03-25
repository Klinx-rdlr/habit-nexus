import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthClientService } from '../clients/auth-client.service';
import { HabitClientService } from '../clients/habit-client.service';
import { RedisService } from '../redis/redis.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authClient: AuthClientService,
    private readonly habitClient: HabitClientService,
    private readonly redis: RedisService,
  ) {}

  async create(userId: string, dto: CreateGroupDto) {
    const inviteCode = this.generateInviteCode();

    const group = await this.prisma.group.create({
      data: {
        createdBy: userId,
        name: dto.name,
        description: dto.description,
        inviteCode,
        members: {
          create: {
            userId,
            role: 'admin',
          },
        },
      },
      include: { members: true },
    });

    return this.toResponse(group);
  }

  async findAll(userId: string) {
    const cacheKey = `groups:user:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const groups = await this.prisma.group.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = groups.map((g) => ({
      id: g.id,
      createdBy: g.createdBy,
      name: g.name,
      description: g.description,
      inviteCode: g.inviteCode,
      memberCount: g._count.members,
      createdAt: g.createdAt.toISOString(),
    }));

    await this.redis.set(cacheKey, result, 300);
    return result;
  }

  async findOne(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: { orderBy: { joinedAt: 'asc' } },
      },
    });

    if (!group) throw new NotFoundException('Group not found');

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('You are not a member of this group');

    const userIds = group.members.map((m) => m.userId);

    // Fetch usernames and habits in parallel
    const [users, ...habitResults] = await Promise.all([
      this.authClient.getUsersByIds(userIds),
      ...userIds.map((id) => this.habitClient.getHabitsByUserId(id)),
    ]);

    const usernameMap = new Map(users.map((u) => [u.id, u.username]));
    const habitsMap = new Map(
      userIds.map((id, i) => [id, habitResults[i]]),
    );

    return {
      id: group.id,
      createdBy: group.createdBy,
      name: group.name,
      description: group.description,
      inviteCode: group.inviteCode,
      memberCount: group.members.length,
      createdAt: group.createdAt.toISOString(),
      members: group.members.map((m) => {
        const habits = habitsMap.get(m.userId);
        const habitSummary = habits !== null && habits !== undefined
          ? {
              activeHabitCount: habits.length,
              totalStreakDays: habits.reduce((sum, h) => sum + h.currentStreak, 0),
            }
          : { activeHabitCount: null, totalStreakDays: null };

        return {
          id: m.id,
          userId: m.userId,
          username: usernameMap.get(m.userId) || 'Unknown',
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
          ...habitSummary,
        };
      }),
    };
  }

  async update(userId: string, groupId: string, dto: UpdateGroupDto) {
    await this.requireAdmin(userId, groupId);

    const updated = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        name: dto.name,
        description: dto.description,
      },
      include: { members: true },
    });

    await this.invalidateGroupCaches(groupId);
    return this.toResponse(updated);
  }

  async delete(userId: string, groupId: string) {
    await this.requireAdmin(userId, groupId);

    await this.prisma.$transaction([
      this.prisma.groupInvite.deleteMany({ where: { groupId } }),
      this.prisma.groupMember.deleteMany({ where: { groupId } }),
      this.prisma.group.delete({ where: { id: groupId } }),
    ]);

    await this.invalidateGroupCaches(groupId);
  }

  async join(userId: string, code: string) {
    const group = await this.prisma.group.findUnique({
      where: { inviteCode: code },
      include: { members: true },
    });

    if (!group) {
      // Check group_invites table for generated invite codes
      const invite = await this.prisma.groupInvite.findUnique({
        where: { code },
        include: { group: { include: { members: true } } },
      });

      if (!invite) throw new NotFoundException('Invalid invite code');
      if (invite.isUsed) throw new BadRequestException('Invite code has already been used');
      if (invite.expiresAt < new Date()) throw new BadRequestException('Invite code has expired');

      const alreadyMember = invite.group.members.some((m) => m.userId === userId);
      if (alreadyMember) throw new ConflictException('You are already a member of this group');

      await this.prisma.$transaction([
        this.prisma.groupMember.create({
          data: { groupId: invite.groupId, userId, role: 'member' },
        }),
        this.prisma.groupInvite.update({
          where: { id: invite.id },
          data: { isUsed: true },
        }),
      ]);

      await this.invalidateGroupCaches(invite.groupId);
      return { message: 'Joined group successfully', groupId: invite.groupId };
    }

    const alreadyMember = group.members.some((m) => m.userId === userId);
    if (alreadyMember) throw new ConflictException('You are already a member of this group');

    await this.prisma.groupMember.create({
      data: { groupId: group.id, userId, role: 'member' },
    });

    await this.invalidateGroupCaches(group.id);
    return { message: 'Joined group successfully', groupId: group.id };
  }

  async removeMember(userId: string, groupId: string, targetUserId: string) {
    await this.requireAdmin(userId, groupId);

    if (userId === targetUserId) {
      const adminCount = await this.prisma.groupMember.count({
        where: { groupId, role: 'admin' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot remove yourself as the last admin');
      }
    }

    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });

    if (!member) throw new NotFoundException('Member not found in this group');

    await this.prisma.groupMember.delete({
      where: { id: member.id },
    });

    await this.invalidateGroupCaches(groupId);
  }

  async createInvite(userId: string, groupId: string) {
    await this.requireAdmin(userId, groupId);

    const code = this.generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiration

    const invite = await this.prisma.groupInvite.create({
      data: { groupId, code, expiresAt },
    });

    return {
      id: invite.id,
      code: invite.code,
      expiresAt: invite.expiresAt.toISOString(),
      isUsed: invite.isUsed,
    };
  }

  async getActiveInvite(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) throw new NotFoundException('Group not found');

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('You are not a member of this group');

    // Return the group's permanent invite code
    return {
      inviteCode: group.inviteCode,
      groupId: group.id,
      groupName: group.name,
    };
  }

  private async requireAdmin(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) throw new NotFoundException('Group not found');

    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!member) throw new ForbiddenException('You are not a member of this group');
    if (member.role !== 'admin') throw new ForbiddenException('Admin access required');
  }

  private async invalidateGroupCaches(groupId: string) {
    // Invalidate group member caches
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    const keys = members.map((m) => `groups:user:${m.userId}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  private generateInviteCode(): string {
    return randomBytes(8).toString('hex');
  }

  private toResponse(group: {
    id: string;
    createdBy: string;
    name: string;
    description: string | null;
    inviteCode: string;
    createdAt: Date;
    members?: { id: string }[];
  }) {
    return {
      id: group.id,
      createdBy: group.createdBy,
      name: group.name,
      description: group.description,
      inviteCode: group.inviteCode,
      memberCount: group.members?.length ?? 0,
      createdAt: group.createdAt.toISOString(),
    };
  }
}
