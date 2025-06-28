import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求时间戳
    config.metadata = { startTime: new Date() };
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理响应和错误
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const duration = new Date().getTime() - response.config.metadata?.startTime?.getTime();
    
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      duration: `${duration}ms`,
      data: response.data,
    });
    
    // 检查业务逻辑错误
    if (response.data && !response.data.success) {
      const error = new Error(response.data.message || 'API请求失败');
      error.name = 'BusinessError';
      (error as any).response = response;
      throw error;
    }
    
    return response;
  },
  (error) => {
    const duration = error.config?.metadata?.startTime 
      ? new Date().getTime() - error.config.metadata.startTime.getTime()
      : 0;
    
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      duration: `${duration}ms`,
      message: error.message,
      data: error.response?.data,
    });
    
    // 处理不同类型的错误
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未认证 - 清除token并跳转到登录页
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          break;
        case 403:
          // 权限不足
          console.error('权限不足:', data?.message);
          break;
        case 404:
          // 资源不存在
          console.error('资源不存在:', data?.message);
          break;
        case 500:
          // 服务器错误
          console.error('服务器内部错误:', data?.message);
          break;
        default:
          console.error('API错误:', data?.message || error.message);
      }
      
      // 返回格式化的错误信息
      const apiError = new Error(data?.message || `HTTP ${status} Error`);
      (apiError as any).status = status;
      (apiError as any).data = data;
      return Promise.reject(apiError);
    } else if (error.request) {
      // 网络错误
      const networkError = new Error('网络连接失败，请检查网络设置');
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    } else {
      // 其他错误
      return Promise.reject(error);
    }
  }
);

// API请求方法封装
export const api = {
  // GET请求
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },
  
  // POST请求
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },
  
  // PUT请求
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },
  
  // DELETE请求
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  },
  
  // PATCH请求
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },
};

// 导出axios实例供特殊用途使用
export { apiClient };

// 类型声明扩展
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}
