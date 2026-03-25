import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  isRead!: boolean;

  @ApiProperty({ required: false, type: Object })
  metadata!: Record<string, unknown> | null;

  @ApiProperty()
  createdAt!: string;
}

export class UnreadCountResponseDto {
  @ApiProperty()
  unreadCount!: number;
}
