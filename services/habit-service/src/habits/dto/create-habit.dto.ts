import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
  IsIn,
  MaxLength,
  Min,
  Max,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class CreateHabitDto {
  @ApiProperty({ example: 'Morning Run', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'Habit name must not be empty' })
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Run 5km every morning' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#6366f1', default: '#6366f1' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'color must be a valid hex color' })
  color?: string;

  @ApiProperty({ example: 'daily', enum: ['daily', 'custom'] })
  @IsString()
  @IsIn(['daily', 'custom'])
  frequencyType!: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  targetCount?: number;

  @ApiPropertyOptional({
    example: [0, 2, 4],
    description: 'Days of week (0=Mon, 6=Sun). Required when frequencyType is custom.',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  scheduledDays?: number[];
}
