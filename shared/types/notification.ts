export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
