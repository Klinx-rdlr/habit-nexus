import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import servicesConfig from './config/services.config';
import { AuthProxyController } from './proxy/auth-proxy.controller';
import { HabitProxyController } from './proxy/habit-proxy.controller';
import { GroupProxyController } from './proxy/group-proxy.controller';
import { NotificationProxyController } from './proxy/notification-proxy.controller';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [servicesConfig],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    HttpModule,
  ],
  controllers: [
    HealthController,
    AuthProxyController,
    HabitProxyController,
    GroupProxyController,
    NotificationProxyController,
  ],
  providers: [
    JwtAuthGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
