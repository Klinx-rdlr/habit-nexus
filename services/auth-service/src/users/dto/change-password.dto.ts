import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword1' })
  @IsString()
  oldPassword!: string;

  @ApiProperty({ example: 'newpassword1' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
