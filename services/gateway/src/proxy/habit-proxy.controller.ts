import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('habits')
@Controller('habits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HabitProxyController {
  private readonly habitUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.habitUrl = this.config.get<string>('services.habitUrl')!;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new habit' })
  @ApiResponse({ status: 201, description: 'Habit created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Req() req: Request, @Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.post(`${this.habitUrl}/habits`, body, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Get()
  @ApiOperation({ summary: 'List my habits' })
  @ApiQuery({ name: 'archived', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of habits' })
  async findAll(@Req() req: Request, @Query('archived') archived?: string) {
    const params = archived !== undefined ? { archived } : {};
    const { data } = await firstValueFrom(
      this.http.get(`${this.habitUrl}/habits`, {
        headers: this.forwardHeaders(req),
        params,
      }),
    );
    return data;
  }

  @Get('today')
  @ApiOperation({ summary: "Today's habits with completion status" })
  @ApiResponse({ status: 200, description: "Today's scheduled habits" })
  async findToday(@Req() req: Request) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.habitUrl}/habits/today`, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get habit detail with streak info' })
  @ApiResponse({ status: 200, description: 'Habit detail' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.habitUrl}/habits/${id}`, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a habit' })
  @ApiResponse({ status: 200, description: 'Habit updated' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  async update(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.patch(`${this.habitUrl}/habits/${id}`, body, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive a habit (soft delete)' })
  @ApiResponse({ status: 204, description: 'Habit archived' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  async archive(@Req() req: Request, @Param('id') id: string) {
    await firstValueFrom(
      this.http.delete(`${this.habitUrl}/habits/${id}`, {
        headers: this.forwardHeaders(req),
      }),
    );
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Check off a habit for a date' })
  @ApiResponse({ status: 201, description: 'Habit completed' })
  @ApiResponse({ status: 409, description: 'Already completed for this date' })
  async complete(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.post(`${this.habitUrl}/habits/${id}/complete`, body, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Delete(':id/complete/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Undo a completion' })
  @ApiResponse({ status: 204, description: 'Completion undone' })
  @ApiResponse({ status: 404, description: 'Completion not found' })
  async undoCompletion(@Req() req: Request, @Param('id') id: string, @Param('date') date: string) {
    await firstValueFrom(
      this.http.delete(`${this.habitUrl}/habits/${id}/complete/${date}`, {
        headers: this.forwardHeaders(req),
      }),
    );
  }

  @Get(':id/completions')
  @ApiOperation({ summary: 'Get completion history' })
  @ApiQuery({ name: 'from', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-03-25' })
  @ApiResponse({ status: 200, description: 'Completion history' })
  async findCompletions(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const { data } = await firstValueFrom(
      this.http.get(`${this.habitUrl}/habits/${id}/completions`, {
        headers: this.forwardHeaders(req),
        params,
      }),
    );
    return data;
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get habit stats (streaks, completion rate, heatmap)' })
  @ApiResponse({ status: 200, description: 'Habit statistics' })
  async getStats(@Req() req: Request, @Param('id') id: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.habitUrl}/habits/${id}/stats`, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  private forwardHeaders(req: Request): Record<string, string> {
    return {
      'x-user-id': req.headers['x-user-id'] as string,
      'x-user-timezone': req.headers['x-user-timezone'] as string,
    };
  }
}
