import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { HabitCompletedEvent, StreakMilestoneEvent } from './event.types';

const MILESTONES = [7, 30, 60, 100];

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async publishHabitCompleted(payload: Omit<HabitCompletedEvent, 'type'>) {
    const event: HabitCompletedEvent = { type: 'habit.completed', ...payload };
    this.client.emit('habit.completed', event);
    this.logger.log(
      `Published habit.completed for habit ${payload.habitId} (streak: ${payload.currentStreak})`,
    );
  }

  async publishStreakMilestone(payload: Omit<StreakMilestoneEvent, 'type'>) {
    const event: StreakMilestoneEvent = {
      type: 'streak.milestone',
      ...payload,
    };
    this.client.emit('streak.milestone', event);
    this.logger.log(
      `Published streak.milestone for habit ${payload.habitId} (milestone: ${payload.milestone})`,
    );
  }

  checkAndPublishMilestone(
    userId: string,
    habitId: string,
    habitName: string,
    previousStreak: number,
    currentStreak: number,
  ) {
    for (const milestone of MILESTONES) {
      if (currentStreak >= milestone && previousStreak < milestone) {
        this.publishStreakMilestone({
          userId,
          habitId,
          habitName,
          milestone,
          occurredAt: new Date().toISOString(),
        });
      }
    }
  }
}
