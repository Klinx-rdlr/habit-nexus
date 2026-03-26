import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface UserHabit {
  id: string;
  name: string;
  frequencyType: string;
  scheduledDays: number[];
  currentStreak: number;
  longestStreak: number;
  isArchived: boolean;
  completions: { completedDate: string }[];
}

@Injectable()
export class HabitClientService {
  private readonly habitUrl: string;
  private readonly internalKey: string;
  private readonly logger = new Logger(HabitClientService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.habitUrl =
      this.config.get<string>('HABIT_SERVICE_URL') || 'http://localhost:3002';
    this.internalKey = this.config.get<string>('INTERNAL_KEY') || '';
  }

  async getHabitsByUserId(userId: string): Promise<UserHabit[] | null> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<UserHabit[]>(
          `${this.habitUrl}/habits/user/${userId}`,
          {
            headers: { 'x-internal-key': this.internalKey },
            timeout: 5000,
          },
        ),
      );
      return data;
    } catch (error) {
      this.logger.warn(`Failed to fetch habits for user ${userId}: ${error}`);
      return null;
    }
  }
}
