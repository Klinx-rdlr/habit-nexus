import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiResponse({ status: 200, type: UserResponseDto })
  getMe(@Headers('x-user-id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiResponse({ status: 200, type: UserResponseDto })
  updateMe(
    @Headers('x-user-id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, dto);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @Headers('x-user-id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(userId, dto);
    return { message: 'Password changed successfully' };
  }

  @Get('batch')
  @ApiOperation({ summary: 'Get multiple users by IDs (internal)' })
  @ApiResponse({ status: 200 })
  getBatch(@Query('ids') ids: string) {
    const idList = ids.split(',').filter(Boolean);
    return this.usersService.findByIds(idList);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (internal)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
