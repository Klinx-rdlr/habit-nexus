import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthClientService } from '../clients/auth-client.service';
import { GroupClientService } from '../clients/group-client.service';
import {
  HabitCompletedEvent,
  StreakMilestoneEvent,
  MemberJoinedEvent,
} from './event.types';

@Controller()
export class EventConsumer {
  private readonly logger = new Logger(EventConsumer.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly authClient: AuthClientService,
    private readonly groupClient: GroupClientService,
  ) {}

  @EventPattern('habit.completed')
  async handleHabitCompleted(
    @Payload() event: HabitCompletedEvent,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(
      `Received habit.completed: ${event.habitId} by user ${event.userId}`,
    );
    // No notification needed — this is for future analytics
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }

  @EventPattern('streak.milestone')
  async handleStreakMilestone(
    @Payload() event: StreakMilestoneEvent,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(
      `Received streak.milestone: ${event.milestone} days for habit ${event.habitId}`,
    );

    try {
      // Notify the user themselves
      await this.notifications.create(
        event.userId,
        'streak.milestone',
        `You hit a ${event.milestone}-day streak on ${event.habitName}!`,
        {
          habitId: event.habitId,
          habitName: event.habitName,
          milestone: event.milestone,
        },
      );

      // Notify group members
      const user = await this.authClient.getUserById(event.userId);
      const username = user?.username || 'Someone';

      const groups = await this.groupClient.getGroupsByUserId(event.userId);

      for (const group of groups) {
        for (const member of group.members) {
          if (member.userId === event.userId) continue;

          await this.notifications.create(
            member.userId,
            'streak.milestone',
            `${username} hit a ${event.milestone}-day streak on ${event.habitName}!`,
            {
              habitId: event.habitId,
              habitName: event.habitName,
              milestone: event.milestone,
              groupId: group.id,
              groupName: group.name,
              userId: event.userId,
            },
          );
        }
      }
    } finally {
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    }
  }

  @EventPattern('member.joined')
  async handleMemberJoined(
    @Payload() event: MemberJoinedEvent,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(
      `Received member.joined: ${event.userId} joined group ${event.groupId}`,
    );

    try {
      // Get all members of the group to notify them
      const groups = await this.groupClient.getGroupsByUserId(event.userId);
      const group = groups.find((g) => g.id === event.groupId);

      if (!group) {
        this.logger.warn(`Group ${event.groupId} not found for member.joined`);
        return;
      }

      for (const member of group.members) {
        if (member.userId === event.userId) continue;

        await this.notifications.create(
          member.userId,
          'member.joined',
          `${event.username} joined ${event.groupName}!`,
          {
            groupId: event.groupId,
            groupName: event.groupName,
            newMemberUserId: event.userId,
            newMemberUsername: event.username,
          },
        );
      }
    } finally {
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    }
  }
}
