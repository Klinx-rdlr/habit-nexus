import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface UserInfo {
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
    this.authUrl =
      this.config.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001';
    this.internalKey = this.config.get<string>('INTERNAL_KEY') || '';
  }

  async getUserById(userId: string): Promise<UserInfo | null> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<UserInfo>(`${this.authUrl}/users/${userId}`, {
          headers: { 'x-internal-key': this.internalKey },
        }),
      );
      return data;
    } catch (error) {
      this.logger.warn(`Failed to fetch user ${userId}: ${error}`);
      return null;
    }
  }

  async getUsersByTimezone(
    timezone: string,
  ): Promise<{ id: string; username: string }[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<{ users: { id: string; username: string }[] }>(
          `${this.authUrl}/users/by-timezone`,
          {
            params: { timezone },
            headers: { 'x-internal-key': this.internalKey },
          },
        ),
      );
      return data.users;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch users for timezone ${timezone}: ${error}`,
      );
      return [];
    }
  }
}
