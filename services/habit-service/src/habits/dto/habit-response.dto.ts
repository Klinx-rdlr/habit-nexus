import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HabitResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiProperty()
  color!: string;

  @ApiProperty()
  frequencyType!: string;

  @ApiProperty()
  targetCount!: number;

  @ApiProperty()
  currentStreak!: number;

  @ApiProperty()
  longestStreak!: number;

  @ApiPropertyOptional()
  streakStartDate!: string | null;

  @ApiProperty()
  isArchived!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ type: [Number] })
  scheduledDays?: number[];
}

export class TodayHabitResponseDto extends HabitResponseDto {
  @ApiProperty()
  completedToday!: boolean;
}
