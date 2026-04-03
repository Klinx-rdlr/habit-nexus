import { Module } from '@nestjs/common';
import { StreaksService } from './streaks.service';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [MetricsModule],
  providers: [StreaksService],
  exports: [StreaksService],
})
export class StreaksModule {}
