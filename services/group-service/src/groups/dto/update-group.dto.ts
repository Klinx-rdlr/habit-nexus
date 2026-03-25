import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateGroupDto {
  @ApiPropertyOptional({ example: 'Morning Warriors v2', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description for the group' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
