import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
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

@ApiTags('auth')
@Controller()
export class AuthProxyController {
  private readonly authUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.authUrl = this.config.get<string>('services.authUrl')!;
  }

  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.post(`${this.authUrl}/auth/register`, body),
    );
    return data;
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Login with email and password' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.post(`${this.authUrl}/auth/login`, body),
    );
    return data;
  }

  @Post('auth/refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const { data } = await firstValueFrom(
      this.http.post(`${this.authUrl}/auth/refresh`, null, {
        headers: {
          'x-user-id': req.headers['x-user-id'] as string,
          authorization: req.headers.authorization as string,
        },
      }),
    );
    return data;
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Req() req: Request) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.authUrl}/users/me`, {
        headers: {
          'x-user-id': req.headers['x-user-id'] as string,
          'x-user-timezone': req.headers['x-user-timezone'] as string,
        },
      }),
    );
    return data;
  }

  @Patch('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@Req() req: Request, @Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.patch(`${this.authUrl}/users/me`, body, {
        headers: {
          'x-user-id': req.headers['x-user-id'] as string,
          'x-user-timezone': req.headers['x-user-timezone'] as string,
        },
      }),
    );
    return data;
  }

  @Patch('users/me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(@Req() req: Request, @Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.patch(`${this.authUrl}/users/me/password`, body, {
        headers: {
          'x-user-id': req.headers['x-user-id'] as string,
        },
      }),
    );
    return data;
  }
}
