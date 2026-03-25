import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MemberResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  joinedAt!: string;

  @ApiPropertyOptional({ description: 'Number of active habits (null if habit-service unavailable)' })
  activeHabitCount!: number | null;

  @ApiPropertyOptional({ description: 'Sum of current streaks (null if habit-service unavailable)' })
  totalStreakDays!: number | null;
}

export class GroupResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiProperty()
  inviteCode!: string;

  @ApiProperty()
  memberCount!: number;

  @ApiProperty()
  createdAt!: string;
}

export class GroupDetailResponseDto extends GroupResponseDto {
  @ApiProperty({ type: [MemberResponseDto] })
  members!: MemberResponseDto[];
}
