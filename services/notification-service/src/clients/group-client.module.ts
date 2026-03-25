import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GroupClientService } from './group-client.service';

@Module({
  imports: [HttpModule],
  providers: [GroupClientService],
  exports: [GroupClientService],
})
export class GroupClientModule {}
