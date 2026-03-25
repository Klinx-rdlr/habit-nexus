import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { CompletionsService } from './completions.service';
import { CreateCompletionDto } from './dto/create-completion.dto';
import { CompletionResponseDto, HabitStatsResponseDto } from './dto/completion-response.dto';

@ApiTags('completions')
@ApiHeader({ name: 'x-user-id', required: true })
@ApiHeader({ name: 'x-user-timezone', required: false })
@Controller('habits/:habitId')
export class CompletionsController {
  constructor(private readonly completionsService: CompletionsService) {}

  @Post('complete')
  @ApiOperation({ summary: 'Check off a habit for a date' })
  @ApiResponse({ status: 201, type: CompletionResponseDto })
  @ApiResponse({ status: 409, description: 'Already completed for this date' })
  complete(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-timezone') timezone: string,
    @Param('habitId') habitId: string,
    @Body() dto: CreateCompletionDto,
  ) {
    return this.completionsService.complete(userId, habitId, dto, timezone || 'Asia/Manila');
  }

  @Delete('complete/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Undo a completion' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'Completion not found' })
  undo(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-timezone') timezone: string,
    @Param('habitId') habitId: string,
    @Param('date') date: string,
  ) {
    return this.completionsService.undo(userId, habitId, date, timezone || 'Asia/Manila');
  }

  @Get('completions')
  @ApiOperation({ summary: 'Get completion history' })
  @ApiQuery({ name: 'from', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-03-25' })
  @ApiResponse({ status: 200, type: [CompletionResponseDto] })
  findHistory(
    @Headers('x-user-id') userId: string,
    @Param('habitId') habitId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.completionsService.findHistory(userId, habitId, from, to);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get habit stats (streaks, completion rate, heatmap)' })
  @ApiResponse({ status: 200, type: HabitStatsResponseDto })
  getStats(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-timezone') timezone: string,
    @Param('habitId') habitId: string,
  ) {
    return this.completionsService.getStats(userId, habitId, timezone || 'Asia/Manila');
  }
}
