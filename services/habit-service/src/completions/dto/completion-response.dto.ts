import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompletionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  habitId!: string;

  @ApiProperty({ example: '2026-03-25' })
  completedDate!: string;

  @ApiPropertyOptional()
  note!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class HabitStatsResponseDto {
  @ApiProperty()
  currentStreak!: number;

  @ApiProperty()
  longestStreak!: number;

  @ApiProperty({ description: 'Completion rate over the last 30 days' })
  completionRate!: number;

  @ApiProperty({
    description: 'Map of date strings to completion status for last 6 months',
    example: { '2026-03-25': true, '2026-03-24': true },
  })
  heatmap!: Record<string, boolean>;
}
