import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;
  let config: any;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashed-password',
    timezone: 'Asia/Manila',
    createdAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    config = {
      get: jest.fn().mockReturnValue('7d'),
    };

    service = new AuthService(prisma, jwt, config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    };

    it('should throw ConflictException when email already in use', async () => {
      prisma.user.findFirst.mockResolvedValue({ ...mockUser, email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('Email already in use');
    });

    it('should throw ConflictException when username already taken', async () => {
      prisma.user.findFirst.mockResolvedValue({ ...mockUser, email: 'other@example.com', username: registerDto.username });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('Username already taken');
    });

    it('should create user and return tokens on success', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password');
      prisma.user.create.mockResolvedValue({
        id: 'new-uuid',
        email: registerDto.email,
        username: registerDto.username,
        passwordHash: 'hashed-new-password',
        timezone: 'Asia/Manila',
        createdAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          passwordHash: 'hashed-new-password',
        },
      });
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'mock-token',
        refreshToken: 'mock-token',
        user: {
          id: 'new-uuid',
          email: registerDto.email,
          username: registerDto.username,
          timezone: 'Asia/Manila',
        },
      });
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should throw UnauthorizedException when email does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should return tokens on successful login', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'mock-token',
        refreshToken: 'mock-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          timezone: mockUser.timezone,
        },
      });
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh('non-existent-id')).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh('non-existent-id')).rejects.toThrow('User not found');
    });

    it('should return new tokens for existing user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refresh(mockUser.id);

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'mock-token',
        refreshToken: 'mock-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          timezone: mockUser.timezone,
        },
      });
    });
  });
});
