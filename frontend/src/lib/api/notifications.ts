import { api } from './client';

export interface NotificationResponse {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface PaginatedNotifications {
  data: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getNotifications(params?: {
  unread?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedNotifications> {
  const { data } = await api.get<PaginatedNotifications>('/notifications', {
    params,
  });
  return data;
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const { data } = await api.get<UnreadCountResponse>('/notifications/count');
  return data;
}

export async function markAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.post('/notifications/read-all');
}
