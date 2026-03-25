import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { AuthClientModule } from '../clients/auth-client.module';
import { HabitClientModule } from '../clients/habit-client.module';

@Module({
  imports: [AuthClientModule, HabitClientModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
