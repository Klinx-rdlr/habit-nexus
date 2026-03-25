import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthController } from './health/health.controller';
import { HabitsModule } from './habits/habits.module';
import { CompletionsModule } from './completions/completions.module';
import { StreaksModule } from './streaks/streaks.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    HabitsModule,
    CompletionsModule,
    StreaksModule,
    EventsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
