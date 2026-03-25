import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardResponseDto } from './dto/leaderboard-response.dto';

@ApiTags('leaderboard')
@ApiHeader({ name: 'x-user-id', required: true })
@Controller('groups')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Get group leaderboard ranked by streaks or completion' })
  @ApiQuery({
    name: 'rankBy',
    required: false,
    enum: ['streaks', 'completion'],
    description: 'Ranking mode (default: streaks)',
  })
  @ApiResponse({ status: 200, type: LeaderboardResponseDto })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Not a member' })
  getLeaderboard(
    @Headers('x-user-id') userId: string,
    @Param('id') groupId: string,
    @Query('rankBy') rankBy?: string,
  ) {
    const mode = rankBy === 'completion' ? 'completion' : 'streaks';
    return this.leaderboardService.getLeaderboard(userId, groupId, mode);
  }
}
