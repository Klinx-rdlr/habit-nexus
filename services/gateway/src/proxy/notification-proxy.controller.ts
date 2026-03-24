import { Controller, All, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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

  @All()
  async proxyRoot(@Req() req: Request) {
    return this.proxyRequest(req);
  }

  @All('*')
  async proxyChild(@Req() req: Request) {
    return this.proxyRequest(req);
  }

  private async proxyRequest(req: Request) {
    const downstream = req.originalUrl.replace(/^\/api\/v1/, '');
    const { data } = await firstValueFrom(
      this.http.request({
        method: req.method,
        url: `${this.notificationUrl}${downstream}`,
        data: req.body,
        headers: {
          'x-user-id': req.headers['x-user-id'] as string,
          'x-user-timezone': req.headers['x-user-timezone'] as string,
        },
      }),
    );
    return data;
  }
}
