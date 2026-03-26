import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HabitClientService } from './habit-client.service';

@Module({
  imports: [HttpModule],
  providers: [HabitClientService],
  exports: [HabitClientService],
})
export class HabitClientModule {}
