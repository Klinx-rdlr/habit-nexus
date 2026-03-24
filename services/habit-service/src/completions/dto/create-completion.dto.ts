import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateCompletionDto {
  @ApiPropertyOptional({
    example: '2026-03-25',
    description: 'Date in YYYY-MM-DD format. Defaults to today in user timezone.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date?: string;

  @ApiPropertyOptional({ example: 'Felt great today!' })
  @IsOptional()
  @IsString()
  note?: string;
}
