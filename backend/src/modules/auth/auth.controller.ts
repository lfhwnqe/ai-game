import { 
  Controller, 
  Post, 
  Get,
  Put,
  Body, 
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    
    return {
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
      message: 'User registered successfully',
    };
  }

  /**
   * 用户登录
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    
    return {
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
      message: 'Login successful',
    };
  }

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.authService.getUserProfile(req.user.userId);
    
    return {
      success: true,
      data: user,
    };
  }

  /**
   * 更新用户资料
   */
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateData: any) {
    const user = await this.authService.updateProfile(req.user.userId, updateData);
    
    return {
      success: true,
      data: user,
      message: 'Profile updated successfully',
    };
  }

  /**
   * 修改密码
   */
  @Put('password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req,
    @Body() passwordData: { oldPassword: string; newPassword: string },
  ) {
    await this.authService.changePassword(
      req.user.userId,
      passwordData.oldPassword,
      passwordData.newPassword,
    );
    
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  /**
   * 验证令牌
   */
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Request() req) {
    return {
      success: true,
      data: {
        userId: req.user.userId,
        username: req.user.username,
        email: req.user.email,
      },
      message: 'Token is valid',
    };
  }
}
