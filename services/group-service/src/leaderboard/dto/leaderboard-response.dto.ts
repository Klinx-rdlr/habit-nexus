import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeaderboardHabitDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  color!: string;

  @ApiProperty()
  currentStreak!: number;

  @ApiProperty()
  longestStreak!: number;
}

export class LeaderboardEntryDto {
  @ApiProperty()
  rank!: number;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  username!: string;

  @ApiPropertyOptional()
  totalStreakDays?: number;

  @ApiPropertyOptional()
  completionRate?: number;

  @ApiProperty({ type: [LeaderboardHabitDto] })
  habits!: LeaderboardHabitDto[];

  @ApiProperty()
  habitCount!: number;

  @ApiProperty({ description: 'false if habit-service was unavailable' })
  dataAvailable!: boolean;
}

export class LeaderboardResponseDto {
  @ApiProperty()
  groupId!: string;

  @ApiProperty()
  groupName!: string;

  @ApiProperty({ enum: ['streaks', 'completion'] })
  rankBy!: string;

  @ApiProperty({ type: [LeaderboardEntryDto] })
  entries!: LeaderboardEntryDto[];

  @ApiProperty()
  cachedAt!: string;
}
