import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface BatchUser {
  id: string;
  username: string;
  email: string;
}

@Injectable()
export class AuthClientService {
  private readonly authUrl: string;
  private readonly internalKey: string;
  private readonly logger = new Logger(AuthClientService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.authUrl = this.config.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001';
    this.internalKey = this.config.get<string>('INTERNAL_KEY') || '';
  }

  async getUsersByIds(ids: string[]): Promise<BatchUser[]> {
    if (ids.length === 0) return [];

    try {
      const { data } = await firstValueFrom(
        this.http.get<{ users: BatchUser[] }>(`${this.authUrl}/users/batch`, {
          params: { ids: ids.join(',') },
          headers: { 'x-internal-key': this.internalKey },
        }),
      );
      return data.users;
    } catch (error) {
      this.logger.warn(`Failed to fetch users from auth-service: ${error}`);
      return [];
    }
  }
}
