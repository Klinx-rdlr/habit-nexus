import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('groups')
@Controller('groups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupProxyController {
  private readonly groupUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.groupUrl = this.config.get<string>('services.groupUrl')!;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  async create(@Req() req: Request, @Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.post(`${this.groupUrl}/groups`, body, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Get()
  @ApiOperation({ summary: 'List my groups' })
  async findAll(@Req() req: Request) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.groupUrl}/groups`, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a group via invite code' })
  async join(@Req() req: Request, @Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.post(`${this.groupUrl}/groups/join`, body, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Get group leaderboard' })
  async getLeaderboard(@Req() req: Request, @Param('id') id: string) {
    const rankBy = (req.query as Record<string, string>).rankBy || 'streaks';
    const { data } = await firstValueFrom(
      this.http.get(`${this.groupUrl}/groups/${id}/leaderboard`, {
        headers: this.forwardHeaders(req),
        params: { rankBy },
      }),
    );
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group detail with members' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.groupUrl}/groups/${id}`, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group (admin only)' })
  async update(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.patch(`${this.groupUrl}/groups/${id}`, body, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a group (admin only)' })
  async delete(@Req() req: Request, @Param('id') id: string) {
    await firstValueFrom(
      this.http.delete(`${this.groupUrl}/groups/${id}`, {
        headers: this.forwardHeaders(req),
      }),
    );
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member (admin only)' })
  async removeMember(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    await firstValueFrom(
      this.http.delete(`${this.groupUrl}/groups/${id}/members/${userId}`, {
        headers: this.forwardHeaders(req),
      }),
    );
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Generate a new invite code (admin only)' })
  async createInvite(@Req() req: Request, @Param('id') id: string) {
    const { data } = await firstValueFrom(
      this.http.post(`${this.groupUrl}/groups/${id}/invite`, {}, {
        headers: this.forwardHeaders(req),
      }),
    );
    return data;
  }

  @Get(':id/invite')
  @ApiOperation({ summary: 'Get active invite code' })
  async getInvite(@Req() req: Request, @Param('id') id: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.groupUrl}/groups/${id}/invite`, {
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
