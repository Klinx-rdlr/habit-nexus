import { Module } from '@nestjs/common';
import { EventConsumer } from './event.consumer';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthClientModule } from '../clients/auth-client.module';
import { GroupClientModule } from '../clients/group-client.module';

@Module({
  imports: [NotificationsModule, AuthClientModule, GroupClientModule],
  controllers: [EventConsumer],
})
export class ConsumersModule {}
