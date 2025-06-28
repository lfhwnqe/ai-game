import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    const { username, email, password, confirmPassword } = registerDto;

    // 验证密码确认
    if (password !== confirmPassword) {
      throw new ConflictException('Passwords do not match');
    }

    // 检查用户名是否已存在
    const existingUsername = await this.userModel.findOne({ username }).exec();
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.userModel.findOne({ email }).exec();
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // 加密密码
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const userId = this.generateUserId();
    const user = new this.userModel({
      userId,
      username,
      email,
      passwordHash,
      gameStats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalPlayTime: 0,
        achievements: [],
      },
    });

    await user.save();

    // 生成JWT令牌
    const token = this.generateToken(user);

    // 返回用户信息（不包含密码）
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    return { user: userResponse, token };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { username, password } = loginDto;

    // 查找用户
    const user = await this.userModel.findOne({ 
      $or: [{ username }, { email: username }],
      status: 'active'
    }).exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成JWT令牌
    const token = this.generateToken(user);

    // 返回用户信息（不包含密码）
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    return { user: userResponse, token };
  }

  /**
   * 根据ID验证用户
   */
  async validateUserById(userId: string): Promise<User | null> {
    const user = await this.userModel.findOne({ 
      userId, 
      status: 'active' 
    }).exec();
    
    if (!user) {
      return null;
    }

    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    return userResponse;
  }

  /**
   * 获取用户信息
   */
  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userModel.findOne({ userId }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    return userResponse;
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId: string, updateData: Partial<User['profile']>): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      { userId },
      { $set: { profile: updateData } },
      { new: true }
    ).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    return userResponse;
  }

  /**
   * 更新游戏统计
   */
  async updateGameStats(userId: string, statsUpdate: Partial<User['gameStats']>): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { userId },
      { $set: { gameStats: statsUpdate } }
    ).exec();
  }

  /**
   * 添加活跃游戏
   */
  async addActiveGame(userId: string, gameId: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { userId },
      { $addToSet: { activeGames: gameId } }
    ).exec();
  }

  /**
   * 移除活跃游戏
   */
  async removeActiveGame(userId: string, gameId: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { userId },
      { $pull: { activeGames: gameId } }
    ).exec();
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({ userId }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    // 加密新密码
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    user.passwordHash = newPasswordHash;
    await user.save();
  }

  /**
   * 生成用户ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成JWT令牌
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.userId,
      username: user.username,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }
}
