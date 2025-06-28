import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

// 模拟bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      save: jest.fn(),
      exec: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      // 模拟用户不存在
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // 模拟密码加密
      mockedBcrypt.hash.mockResolvedValue('hashedPassword');

      // 模拟用户保存
      const mockUser = {
        userId: expect.any(String),
        username: registerDto.username,
        email: registerDto.email,
        passwordHash: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          userId: 'test-user-id',
          username: registerDto.username,
          email: registerDto.email,
        }),
      };

      mockUserModel.mockImplementation(() => mockUser);

      // 模拟JWT生成
      mockJwtService.sign.mockReturnValue('test-jwt-token');

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.user.username).toBe(registerDto.username);
      expect(result.user.email).toBe(registerDto.email);
      expect(result.token).toBe('test-jwt-token');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if username already exists', async () => {
      const registerDto = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      // 模拟用户名已存在
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ username: 'existinguser' }),
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if passwords do not match', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword',
      };

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'Password123',
      };

      const mockUser = {
        userId: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        lastLoginAt: null,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          userId: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
        }),
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      mockedBcrypt.compare.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('test-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.user.username).toBe(loginDto.username);
      expect(result.token).toBe('test-jwt-token');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'WrongPassword',
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateUserId', () => {
    it('should generate unique user IDs', () => {
      const userId1 = (service as any).generateUserId();
      const userId2 = (service as any).generateUserId();

      expect(userId1).toMatch(/^user_\d+_[a-z0-9]+$/);
      expect(userId2).toMatch(/^user_\d+_[a-z0-9]+$/);
      expect(userId1).not.toBe(userId2);
    });
  });
});
