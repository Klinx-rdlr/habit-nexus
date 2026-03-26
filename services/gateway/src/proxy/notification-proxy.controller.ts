import {
  Controller,
  Get,
  Patch,
  Post,
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

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationProxyController {
  private readonly notificationUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.notificationUrl = this.config.get<string>(
      'services.notificationUrl',
    )!;
  }

  @Get()
  @ApiOperation({ summary: 'List notifications for the current user' })
  @ApiQuery({ name: 'unread', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of notifications' })
  async findAll(
    @Req() req: Request,
    @Query('unread') unread?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: Record<string, string> = {};
    if (unread) params.unread = unread;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const { data } = await firstValueFrom(
      this.http.get(`${this.notificationUrl}/notifications`, {
        headers: this.forwardHeaders(req),
        params,
      }),
    );
    return data;
  }

  @Get('count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@Req() req: Request) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.notificationUrl}/notifications/count`, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Req() req: Request, @Param('id') id: string) {
    const { data } = await firstValueFrom(
      this.http.patch(
        `${this.notificationUrl}/notifications/${id}/read`,
        {},
        { headers: this.forwardHeaders(req) },
      ),
    );
    return data;
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Req() req: Request) {
    const { data } = await firstValueFrom(
      this.http.post(
        `${this.notificationUrl}/notifications/read-all`,
        {},
        { headers: this.forwardHeaders(req) },
      ),
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
