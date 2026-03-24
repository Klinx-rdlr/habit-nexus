import { registerAs } from '@nestjs/config';

export default registerAs('services', () => ({
  authUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  habitUrl: process.env.HABIT_SERVICE_URL || 'http://localhost:3002',
  groupUrl: process.env.GROUP_SERVICE_URL || 'http://localhost:3003',
  notificationUrl:
    process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
}));
