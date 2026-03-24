import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { HabitsModule } from './habits/habits.module';
import { CompletionsModule } from './completions/completions.module';
import { StreaksModule } from './streaks/streaks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HabitsModule,
    CompletionsModule,
    StreaksModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
