import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '../types';
import { authService, authUtils } from '../services/authService';

interface AuthState {
  // 状态
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;

  // 操作
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,

        // 登录
        login: async (credentials) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authService.login(credentials);
            
            set({
              isAuthenticated: true,
              user: response.data.user,
              isLoading: false,
              error: null,
            });
            
            console.log('登录成功:', response.data.user);
          } catch (error: any) {
            set({
              isAuthenticated: false,
              user: null,
              isLoading: false,
              error: error.message || '登录失败',
            });
            
            console.error('登录失败:', error);
            throw error;
          }
        },

        // 注册
        register: async (userData) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authService.register(userData);
            
            set({
              isAuthenticated: true,
              user: response.data.user,
              isLoading: false,
              error: null,
            });
            
            console.log('注册成功:', response.data.user);
          } catch (error: any) {
            set({
              isAuthenticated: false,
              user: null,
              isLoading: false,
              error: error.message || '注册失败',
            });
            
            console.error('注册失败:', error);
            throw error;
          }
        },

        // 登出
        logout: async () => {
          set({ isLoading: true });
          
          try {
            await authService.logout();
            
            set({
              isAuthenticated: false,
              user: null,
              isLoading: false,
              error: null,
            });
            
            console.log('登出成功');
          } catch (error: any) {
            // 即使登出失败，也要清除本地状态
            set({
              isAuthenticated: false,
              user: null,
              isLoading: false,
              error: null,
            });
            
            console.error('登出失败:', error);
          }
        },

        // 获取当前用户信息
        getCurrentUser: async () => {
          if (!get().isAuthenticated) return;
          
          set({ isLoading: true, error: null });
          
          try {
            const user = await authService.getCurrentUser();
            
            set({
              user,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '获取用户信息失败',
            });
            
            // 如果是认证错误，清除登录状态
            if (error.status === 401) {
              set({
                isAuthenticated: false,
                user: null,
              });
            }
            
            console.error('获取用户信息失败:', error);
          }
        },

        // 更新用户资料
        updateProfile: async (userData) => {
          set({ isLoading: true, error: null });
          
          try {
            const updatedUser = await authService.updateProfile(userData);
            
            set({
              user: updatedUser,
              isLoading: false,
              error: null,
            });
            
            console.log('用户资料更新成功:', updatedUser);
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '更新用户资料失败',
            });
            
            console.error('更新用户资料失败:', error);
            throw error;
          }
        },

        // 清除错误
        clearError: () => {
          set({ error: null });
        },

        // 检查认证状态
        checkAuthStatus: () => {
          const { isAuthenticated, user } = authService.checkAuthStatus();
          
          set({
            isAuthenticated,
            user,
            isLoading: false,
          });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
        }),
        onRehydrateStorage: () => (state) => {
          // 重新水化后检查认证状态
          if (state) {
            state.checkAuthStatus();
          }
        },
      }
    ),
    { name: 'auth-store' }
  )
);

// 认证状态选择器
export const authSelectors = {
  // 获取用户信息
  getUser: () => useAuthStore.getState().user,
  
  // 检查是否已登录
  isLoggedIn: () => useAuthStore.getState().isAuthenticated,
  
  // 检查是否正在加载
  isLoading: () => useAuthStore.getState().isLoading,
  
  // 获取错误信息
  getError: () => useAuthStore.getState().error,
  
  // 获取用户ID
  getUserId: () => useAuthStore.getState().user?.userId || null,
  
  // 获取用户名
  getUsername: () => useAuthStore.getState().user?.username || null,
  
  // 检查用户是否有特定权限（如果需要的话）
  hasPermission: (permission: string) => {
    // 这里可以根据实际需求实现权限检查
    return true;
  },
};

// 认证钩子
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    ...store,
    // 便捷方法
    isLoggedIn: store.isAuthenticated,
    username: store.user?.username,
    userId: store.user?.userId,
  };
};
