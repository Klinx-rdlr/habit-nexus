import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StreaksService } from '../streaks/streaks.service';
import { RedisService } from '../redis/redis.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streaks: StreaksService,
    private readonly redis: RedisService,
  ) {}

  async create(userId: string, dto: CreateHabitDto) {
    if (dto.frequencyType === 'custom' && (!dto.scheduledDays || dto.scheduledDays.length === 0)) {
      throw new BadRequestException('scheduledDays is required for custom frequency');
    }

    const habit = await this.prisma.habit.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        color: dto.color,
        frequencyType: dto.frequencyType,
        targetCount: dto.targetCount,
        schedule:
          dto.frequencyType === 'custom' && dto.scheduledDays
            ? { create: dto.scheduledDays.map((day) => ({ dayOfWeek: day })) }
            : undefined,
      },
      include: { schedule: true },
    });

    return this.toResponse(habit);
  }

  async findAll(userId: string, archived = false) {
    const habits = await this.prisma.habit.findMany({
      where: { userId, isArchived: archived },
      include: { schedule: true },
      orderBy: { createdAt: 'desc' },
    });

    return habits.map((h) => this.toResponse(h));
  }

  async findToday(userId: string, timezone: string) {
    const cacheKey = `habits:today:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const today = this.streaks.getTodayInTimezone(timezone);
    const todayDate = this.streaks.parseDate(today);
    const jsDay = todayDate.getDay();
    const mappedDay = jsDay === 0 ? 6 : jsDay - 1;

    const habits = await this.prisma.habit.findMany({
      where: {
        userId,
        isArchived: false,
        OR: [
          { frequencyType: 'daily' },
          {
            frequencyType: 'custom',
            schedule: { some: { dayOfWeek: mappedDay } },
          },
        ],
      },
      include: {
        schedule: true,
        completions: {
          where: { completedDate: new Date(today) },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = habits.map((h) => ({
      ...this.toResponse(h),
      completedToday: h.completions.length > 0,
    }));

    await this.redis.set(cacheKey, result, 300); // 5 minutes TTL
    return result;
  }

  async findOne(userId: string, id: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id },
      include: { schedule: true },
    });

    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();

    return this.toResponse(habit);
  }

  async update(userId: string, id: string, dto: UpdateHabitDto) {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();

    if (dto.frequencyType === 'custom' && (!dto.scheduledDays || dto.scheduledDays.length === 0)) {
      throw new BadRequestException('scheduledDays is required for custom frequency');
    }

    const updated = await this.prisma.habit.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        frequencyType: dto.frequencyType,
        targetCount: dto.targetCount,
        ...(dto.scheduledDays !== undefined && {
          schedule: {
            deleteMany: {},
            create: dto.scheduledDays.map((day) => ({ dayOfWeek: day })),
          },
        }),
      },
      include: { schedule: true },
    });

    return this.toResponse(updated);
  }

  async archive(userId: string, id: string) {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();

    await this.prisma.habit.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async findByUserId(userId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId, isArchived: false },
      include: { schedule: true },
    });
    return habits.map((h) => this.toResponse(h));
  }

  private toResponse(habit: {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    color: string;
    frequencyType: string;
    targetCount: number;
    currentStreak: number;
    longestStreak: number;
    streakStartDate: Date | null;
    isArchived: boolean;
    createdAt: Date;
    schedule?: { dayOfWeek: number }[];
  }) {
    return {
      id: habit.id,
      userId: habit.userId,
      name: habit.name,
      description: habit.description,
      color: habit.color,
      frequencyType: habit.frequencyType,
      targetCount: habit.targetCount,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      streakStartDate: habit.streakStartDate
        ? habit.streakStartDate.toISOString().split('T')[0]
        : null,
      isArchived: habit.isArchived,
      createdAt: habit.createdAt.toISOString(),
      scheduledDays: habit.schedule?.map((s) => s.dayOfWeek),
    };
  }
}
