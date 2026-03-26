import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthClientService } from '../clients/auth-client.service';
import { HabitClientService, UserHabit } from '../clients/habit-client.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GroupClientService } from '../clients/group-client.service';

@Injectable()
export class DailyCheckerWorker {
  private readonly logger = new Logger(DailyCheckerWorker.name);

  constructor(
    private readonly authClient: AuthClientService,
    private readonly habitClient: HabitClientService,
    private readonly notifications: NotificationsService,
    private readonly groupClient: GroupClientService,
  ) {}

  @Cron('0 * * * *')
  async checkStreaks(forceTimezone?: string) {
    this.logger.log('Running daily streak check...');

    let timezones: string[];
    if (forceTimezone) {
      timezones = [forceTimezone];
      this.logger.log(`Forced timezone: ${forceTimezone}`);
    } else {
      timezones = this.getTimezonesMidnightNow();
      this.logger.log(
        `Timezones at midnight: ${timezones.join(', ') || 'none'}`,
      );
    }

    for (const timezone of timezones) {
      await this.processTimezone(timezone);
    }

    this.logger.log('Daily streak check complete.');
  }

  async processTimezone(timezone: string) {
    const users = await this.authClient.getUsersByTimezone(timezone);
    this.logger.log(
      `Processing ${users.length} users in timezone ${timezone}`,
    );

    for (const user of users) {
      try {
        await this.processUser(user.id, user.username, timezone);
      } catch (error) {
        this.logger.error(
          `Error processing user ${user.id}: ${error}`,
        );
      }
    }
  }

  private async processUser(
    userId: string,
    username: string,
    timezone: string,
  ) {
    const habits = await this.habitClient.getHabitsByUserId(userId);
    if (!habits) return;

    const yesterday = this.getYesterdayInTimezone(timezone);
    const yesterdayDate = this.parseDate(yesterday);

    for (const habit of habits) {
      if (!this.isScheduledDay(habit.frequencyType, habit.scheduledDays || [], yesterdayDate)) {
        continue;
      }

      const recentCompletions: string[] =
        (habit as UserHabit & { recentCompletions?: string[] }).recentCompletions || [];

      const wasCompleted = recentCompletions.includes(yesterday);

      // Detect a broken streak: yesterday was not completed, but there were
      // completions before yesterday (indicating an active streak that just broke).
      // We count consecutive scheduled days before yesterday that have completions.
      let previousStreak = 0;
      if (!wasCompleted) {
        let checkDate = new Date(yesterdayDate);
        for (let i = 0; i < 365; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const dateStr = this.formatDate(checkDate);
          if (this.isScheduledDay(habit.frequencyType, habit.scheduledDays || [], checkDate)) {
            if (recentCompletions.includes(dateStr)) {
              previousStreak++;
            } else {
              break;
            }
          }
        }
      }

      if (!wasCompleted && previousStreak > 0) {
        const streakCount = previousStreak;
        this.logger.log(
          `Streak broken: user ${userId}, habit ${habit.name}, previous streak ${streakCount}`,
        );

        await this.notifications.create(
          userId,
          'streak.broken',
          `Your ${streakCount}-day streak on ${habit.name} was broken!`,
          {
            habitId: habit.id,
            habitName: habit.name,
            previousStreak: streakCount,
          },
        );

        await this.notifyGroupMembers(
          userId,
          username,
          { ...habit, currentStreak: streakCount },
        );
      }
    }
  }

  private async notifyGroupMembers(
    userId: string,
    username: string,
    habit: UserHabit,
  ) {
    const groups = await this.groupClient.getGroupsByUserId(userId);

    for (const group of groups) {
      for (const member of group.members) {
        if (member.userId === userId) continue;

        await this.notifications.create(
          member.userId,
          'streak.broken',
          `${username}'s ${habit.currentStreak}-day streak on ${habit.name} was broken!`,
          {
            habitId: habit.id,
            habitName: habit.name,
            previousStreak: habit.currentStreak,
            groupId: group.id,
            groupName: group.name,
            userId,
          },
        );
      }
    }
  }

  getTimezonesMidnightNow(): string[] {
    const now = new Date();
    const allTimezones = (Intl as unknown as { supportedValuesOf(key: string): string[] }).supportedValuesOf('timeZone');
    const midnightZones: string[] = [];

    for (const tz of allTimezones) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: 'numeric',
          hour12: false,
        });
        const hour = parseInt(formatter.format(now), 10);
        if (hour === 0) {
          midnightZones.push(tz);
        }
      } catch {
        // Skip invalid timezones
      }
    }

    return midnightZones;
  }

  private getYesterdayInTimezone(timezone: string): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const now = new Date();
    const todayStr = formatter.format(now);
    const todayDate = this.parseDate(todayStr);
    todayDate.setDate(todayDate.getDate() - 1);
    return this.formatDate(todayDate);
  }

  private isScheduledDay(
    frequencyType: string,
    scheduledDays: number[],
    date: Date,
  ): boolean {
    if (frequencyType === 'daily') return true;
    if (frequencyType === 'custom') {
      const jsDay = date.getDay();
      const mappedDay = jsDay === 0 ? 6 : jsDay - 1;
      return scheduledDays.includes(mappedDay);
    }
    return false;
  }

  private parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
