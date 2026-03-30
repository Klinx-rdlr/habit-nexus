import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashed-password',
    timezone: 'Asia/Manila',
    createdAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new UsersService(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent-id')).rejects.toThrow('User not found');
    });

    it('should return user without passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        timezone: mockUser.timezone,
        createdAt: mockUser.createdAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      oldPassword: 'current-password',
      newPassword: 'new-password-123',
    };

    it('should throw NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.changePassword('non-existent-id', changePasswordDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when current password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(mockUser.id, changePasswordDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.changePassword(mockUser.id, changePasswordDto)).rejects.toThrow('Current password is incorrect');
    });

    it('should hash and update password on success', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      prisma.user.update.mockResolvedValue({});

      await service.changePassword(mockUser.id, changePasswordDto);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('current-password', 'hashed-password');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('new-password-123', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { passwordHash: 'new-hashed-password' },
      });
    });
  });
});
