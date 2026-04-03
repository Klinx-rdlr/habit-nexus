import { Module } from '@nestjs/common';
import { EventConsumer } from './event.consumer';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthClientModule } from '../clients/auth-client.module';
import { GroupClientModule } from '../clients/group-client.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [NotificationsModule, AuthClientModule, GroupClientModule, MetricsModule],
  controllers: [EventConsumer],
})
export class ConsumersModule {}
