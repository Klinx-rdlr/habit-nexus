import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface GroupWithMembers {
  id: string;
  name: string;
  members: { userId: string }[];
}

@Injectable()
export class GroupClientService {
  private readonly groupUrl: string;
  private readonly internalKey: string;
  private readonly logger = new Logger(GroupClientService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.groupUrl =
      this.config.get<string>('GROUP_SERVICE_URL') || 'http://localhost:3003';
    this.internalKey = this.config.get<string>('INTERNAL_KEY') || '';
  }

  async getGroupsByUserId(userId: string): Promise<GroupWithMembers[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<GroupWithMembers[]>(
          `${this.groupUrl}/groups/user/${userId}`,
          { headers: { 'x-internal-key': this.internalKey } },
        ),
      );
      return data;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch groups for user ${userId}: ${error}`,
      );
      return [];
    }
  }
}
