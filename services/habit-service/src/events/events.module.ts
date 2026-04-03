import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsService } from './events.service';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    MetricsModule,
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              config.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672',
            ],
            queue: 'habitmap_events',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
