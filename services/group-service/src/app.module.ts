import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { GroupsModule } from './groups/groups.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    GroupsModule,
    LeaderboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
