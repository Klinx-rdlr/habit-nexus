import {
  Controller,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { DailyCheckerWorker } from './daily-checker.worker';
import { InternalKeyGuard } from '../common/guards/internal-key.guard';

@ApiTags('workers')
@Controller('workers')
export class WorkersController {
  constructor(private readonly dailyChecker: DailyCheckerWorker) {}

  @Post('check-streaks')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InternalKeyGuard)
  @ApiOperation({ summary: 'Manually trigger the daily streak checker (internal)' })
  @ApiHeader({ name: 'x-internal-key', required: true })
  @ApiQuery({ name: 'timezone', required: false, description: 'Force check a specific timezone instead of auto-detecting midnight timezones' })
  @ApiResponse({ status: 200, description: 'Streak check completed' })
  @ApiResponse({ status: 403, description: 'Invalid internal key' })
  async triggerCheckStreaks(@Query('timezone') timezone?: string) {
    await this.dailyChecker.checkStreaks(timezone);
    return { message: 'Streak check completed' };
  }
}
