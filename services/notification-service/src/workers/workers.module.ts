import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DailyCheckerWorker } from './daily-checker.worker';
import { WorkersController } from './workers.controller';
import { AuthClientModule } from '../clients/auth-client.module';
import { HabitClientModule } from '../clients/habit-client.module';
import { GroupClientModule } from '../clients/group-client.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthClientModule,
    HabitClientModule,
    GroupClientModule,
    NotificationsModule,
  ],
  controllers: [WorkersController],
  providers: [DailyCheckerWorker],
})
export class WorkersModule {}
