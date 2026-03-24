import { Controller, All, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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

  @All('*path')
  async proxy(@Req() req: Request) {
    const downstream = req.originalUrl.replace(/^\/api\/v1/, '');
    const { data } = await firstValueFrom(
      this.http.request({
        method: req.method,
        url: `${this.habitUrl}${downstream}`,
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
