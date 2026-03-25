import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { AuthClientModule } from '../clients/auth-client.module';
import { HabitClientModule } from '../clients/habit-client.module';

@Module({
  imports: [AuthClientModule, HabitClientModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
