import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConsumersModule } from './consumers/consumers.module';
import { WorkersModule } from './workers/workers.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    NotificationsModule,
    ConsumersModule,
    WorkersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
