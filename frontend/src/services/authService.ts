import { api } from './api';
import { User, AuthResponse } from '../types';

// 认证相关的API接口
export const authService = {
  // 用户注册
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await api.post<{user: User, token: string}>('/auth/register', userData);

      // 注册成功后自动保存token
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_info', JSON.stringify(response.user));
      }

      return { success: true, data: response, message: 'Registration successful' };
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  },

  // 用户登录
  login: async (credentials: {
    username: string;
    password: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await api.post<{user: User, token: string}>('/auth/login', credentials);

      // 登录成功后保存token和用户信息
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_info', JSON.stringify(response.user));
      }

      return { success: true, data: response, message: 'Login successful' };
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 用户登出
  logout: async (): Promise<void> => {
    try {
      // 清除本地存储
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      
      // 可以调用后端登出接口（如果有的话）
      // await api.post('/auth/logout');
      
      console.log('用户已登出');
    } catch (error) {
      console.error('登出失败:', error);
      // 即使后端登出失败，也要清除本地数据
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
    }
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<{ user: User }>('/auth/profile');

      // 更新本地存储的用户信息
      localStorage.setItem('user_info', JSON.stringify(response.user));

      return response.user;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  // 更新用户资料
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<{ user: User }>('/auth/profile', userData);

      // 更新本地存储的用户信息
      localStorage.setItem('user_info', JSON.stringify(response.user));

      return response.user;
    } catch (error) {
      console.error('更新用户资料失败:', error);
      throw error;
    }
  },

  // 检查认证状态
  checkAuthStatus: (): { isAuthenticated: boolean; user: User | null } => {
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');
    
    if (!token) {
      return { isAuthenticated: false, user: null };
    }
    
    try {
      // 检查token是否过期（简单的JWT解析）
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        // Token已过期
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        return { isAuthenticated: false, user: null };
      }
      
      const user = userInfo ? JSON.parse(userInfo) : null;
      return { isAuthenticated: true, user };
    } catch (error) {
      // Token格式错误
      console.error('Token解析失败:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      return { isAuthenticated: false, user: null };
    }
  },

  // 刷新token（如果后端支持）
  refreshToken: async (): Promise<string> => {
    try {
      const response = await api.post<{ token: string }>('/auth/refresh');

      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }

      return response.token;
    } catch (error) {
      console.error('刷新token失败:', error);
      throw error;
    }
  },

  // 验证用户名是否可用
  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    try {
      const response = await api.get<{ available: boolean }>(`/auth/check-username/${username}`);
      return response.available;
    } catch (error) {
      console.error('检查用户名可用性失败:', error);
      return false;
    }
  },

  // 验证邮箱是否可用
  checkEmailAvailability: async (email: string): Promise<boolean> => {
    try {
      const response = await api.get<{ available: boolean }>(`/auth/check-email/${email}`);
      return response.available;
    } catch (error) {
      console.error('检查邮箱可用性失败:', error);
      return false;
    }
  },
};

// 导出认证工具函数
export const authUtils = {
  // 获取存储的token
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  // 获取存储的用户信息
  getStoredUser: (): User | null => {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // 清除认证数据
  clearAuthData: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  },

  // 检查是否已登录
  isLoggedIn: (): boolean => {
    return authService.checkAuthStatus().isAuthenticated;
  },
};
