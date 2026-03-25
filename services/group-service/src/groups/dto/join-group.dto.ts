import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class JoinGroupDto {
  @ApiProperty({ example: 'abc123def456' })
  @IsString()
  @MinLength(1)
  code!: string;
}
