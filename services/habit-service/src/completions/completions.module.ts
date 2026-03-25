import { Module } from '@nestjs/common';
import { CompletionsController } from './completions.controller';
import { CompletionsService } from './completions.service';
import { StreaksModule } from '../streaks/streaks.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [StreaksModule, EventsModule],
  controllers: [CompletionsController],
  providers: [CompletionsService],
})
export class CompletionsModule {}
