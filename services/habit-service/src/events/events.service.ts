import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { HabitCompletedEvent, StreakMilestoneEvent } from './event.types';

const MILESTONES = [7, 30, 60, 100];

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
    @InjectMetric('rabbitmq_publish_total')
    private readonly publishCounter: Counter,
  ) {}

  async publishHabitCompleted(payload: Omit<HabitCompletedEvent, 'type'>) {
    try {
      const event: HabitCompletedEvent = { type: 'habit.completed', ...payload };
      this.client.emit('habit.completed', event);
      this.publishCounter.inc({ event_type: 'habit.completed' });
      this.logger.log(
        `Published habit.completed for habit ${payload.habitId} (streak: ${payload.currentStreak})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish habit.completed for habit ${payload.habitId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async publishStreakMilestone(payload: Omit<StreakMilestoneEvent, 'type'>) {
    try {
      const event: StreakMilestoneEvent = {
        type: 'streak.milestone',
        ...payload,
      };
      this.client.emit('streak.milestone', event);
      this.publishCounter.inc({ event_type: 'streak.milestone' });
      this.logger.log(
        `Published streak.milestone for habit ${payload.habitId} (milestone: ${payload.milestone})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish streak.milestone for habit ${payload.habitId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
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
