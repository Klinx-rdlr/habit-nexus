import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MemberJoinedEvent } from './event.types';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async publishMemberJoined(payload: Omit<MemberJoinedEvent, 'type'>) {
    const event: MemberJoinedEvent = { type: 'member.joined', ...payload };
    this.client.emit('member.joined', event);
    this.logger.log(
      `Published member.joined for user ${payload.userId} in group ${payload.groupId}`,
    );
  }
}
