import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';

const httpDurationProvider = makeHistogramProvider({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const httpTotalProvider = makeCounterProvider({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const streakCalcDurationProvider = makeHistogramProvider({
  name: 'streak_calculation_duration_seconds',
  help: 'Duration of streak calculations in seconds',
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5],
});

const activeStreaksProvider = makeGaugeProvider({
  name: 'active_streaks_total',
  help: 'Total number of active streaks (streak > 0)',
});

const rabbitmqPublishProvider = makeCounterProvider({
  name: 'rabbitmq_publish_total',
  help: 'Total number of messages published to RabbitMQ',
  labelNames: ['event_type'],
});

@Module({
  imports: [
    PrometheusModule.register({
      defaultLabels: { service: 'habit-service' },
    }),
  ],
  providers: [
    httpDurationProvider,
    httpTotalProvider,
    streakCalcDurationProvider,
    activeStreaksProvider,
    rabbitmqPublishProvider,
  ],
  exports: [
    PrometheusModule,
    httpDurationProvider,
    httpTotalProvider,
    streakCalcDurationProvider,
    activeStreaksProvider,
    rabbitmqPublishProvider,
  ],
})
export class MetricsModule {}
