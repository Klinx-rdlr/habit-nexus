import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
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
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitResponseDto, TodayHabitResponseDto } from './dto/habit-response.dto';
import { InternalKeyGuard } from '../common/guards/internal-key.guard';

@ApiTags('habits')
@ApiHeader({ name: 'x-user-id', required: true })
@ApiHeader({ name: 'x-user-timezone', required: false })
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new habit' })
  @ApiResponse({ status: 201, type: HabitResponseDto })
  create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateHabitDto,
  ) {
    return this.habitsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my habits' })
  @ApiQuery({ name: 'archived', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [HabitResponseDto] })
  findAll(
    @Headers('x-user-id') userId: string,
    @Query('archived') archived?: string,
  ) {
    return this.habitsService.findAll(userId, archived === 'true');
  }

  @Get('today')
  @ApiOperation({ summary: "Today's habits with completion status" })
  @ApiResponse({ status: 200, type: [TodayHabitResponseDto] })
  findToday(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-timezone') timezone: string,
  ) {
    return this.habitsService.findToday(userId, timezone || 'Asia/Manila');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get habit detail with streak info' })
  @ApiResponse({ status: 200, type: HabitResponseDto })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  findOne(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.habitsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a habit' })
  @ApiResponse({ status: 200, type: HabitResponseDto })
  update(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ) {
    return this.habitsService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive a habit (soft delete)' })
  @ApiResponse({ status: 204 })
  archive(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.habitsService.archive(userId, id);
  }

  @Get('user/:userId')
  @UseGuards(InternalKeyGuard)
  @ApiOperation({ summary: 'Internal: get habits for a user (for leaderboard)' })
  @ApiHeader({ name: 'x-internal-key', required: true })
  @ApiResponse({ status: 200, type: [HabitResponseDto] })
  @ApiResponse({ status: 403, description: 'Invalid internal key' })
  findByUserId(@Param('userId') userId: string) {
    return this.habitsService.findByUserId(userId);
  }
}
