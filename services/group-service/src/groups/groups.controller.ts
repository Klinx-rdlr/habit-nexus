import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import {
  GroupResponseDto,
  GroupDetailResponseDto,
} from './dto/group-response.dto';
import { InternalKeyGuard } from '../common/guards/internal-key.guard';

@ApiTags('groups')
@ApiHeader({ name: 'x-user-id', required: true })
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, type: GroupResponseDto })
  create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateGroupDto,
  ) {
    return this.groupsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List groups the current user is a member of' })
  @ApiResponse({ status: 200, type: [GroupResponseDto] })
  findAll(@Headers('x-user-id') userId: string) {
    return this.groupsService.findAll(userId);
  }

  @Get('user/:userId')
  @UseGuards(InternalKeyGuard)
  @ApiOperation({ summary: 'Internal: get all groups with members for a user' })
  @ApiResponse({ status: 200, description: 'List of groups with member lists' })
  @ApiResponse({ status: 403, description: 'Invalid internal key' })
  findByUser(@Param('userId') userId: string) {
    return this.groupsService.findGroupsWithMembersByUser(userId);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a group via invite code' })
  @ApiResponse({ status: 201, description: 'Joined group successfully' })
  @ApiResponse({ status: 404, description: 'Invalid invite code' })
  @ApiResponse({ status: 409, description: 'Already a member' })
  join(
    @Headers('x-user-id') userId: string,
    @Body() dto: JoinGroupDto,
  ) {
    return this.groupsService.join(userId, dto.code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group detail with members and usernames' })
  @ApiResponse({ status: 200, type: GroupDetailResponseDto })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Not a member' })
  findOne(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.groupsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group name/description (admin only)' })
  @ApiResponse({ status: 200, type: GroupResponseDto })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  update(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupsService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a group (admin only)' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  delete(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.groupsService.delete(userId, id);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from group (admin only)' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 400, description: 'Cannot remove last admin' })
  removeMember(
    @Headers('x-user-id') userId: string,
    @Param('id') groupId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.groupsService.removeMember(userId, groupId, targetUserId);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Generate a new invite code (admin only)' })
  @ApiResponse({ status: 201, description: 'Invite code generated' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  createInvite(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.groupsService.createInvite(userId, id);
  }

  @Get(':id/invite')
  @ApiOperation({ summary: 'Get active invite code for sharing' })
  @ApiResponse({ status: 200, description: 'Active invite code' })
  @ApiResponse({ status: 403, description: 'Not a member' })
  getInvite(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.groupsService.getActiveInvite(userId, id);
  }
}
