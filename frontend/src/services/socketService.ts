import { io, Socket } from 'socket.io-client';
import { GameState, RoundResult, SocketEvents } from '../types';
import { authUtils } from './authService';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventListeners: Map<string, Function[]> = new Map();

  // 连接到WebSocket服务器
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // 如果正在连接，等待连接完成
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve();
          } else if (!this.isConnecting) {
            reject(new Error('连接失败'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;

      const token = authUtils.getToken();
      if (!token) {
        this.isConnecting = false;
        reject(new Error('未找到认证token'));
        return;
      }

      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

      this.socket = io(`${socketUrl}/game`, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      });

      // 连接成功
      this.socket.on('connect', () => {
        console.log('✅ WebSocket连接成功');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.setupEventListeners();
        resolve();
      });

      // 连接错误
      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket连接错误:', error);
        this.isConnecting = false;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          
          setTimeout(() => {
            this.connect().catch(() => {
              if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                reject(new Error('WebSocket连接失败，已达到最大重试次数'));
              }
            });
          }, this.reconnectDelay * this.reconnectAttempts);
        } else {
          reject(error);
        }
      });

      // 断开连接
      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket连接断开:', reason);
        this.isConnecting = false;
        
        // 如果是服务器主动断开，尝试重连
        if (reason === 'io server disconnect') {
          this.reconnect();
        }
      });

      // 认证错误
      this.socket.on('unauthorized', (error) => {
        console.error('🚫 WebSocket认证失败:', error);
        this.disconnect();
        // 清除无效token
        authUtils.clearAuthData();
        window.location.href = '/login';
      });
    });
  }

  // 断开连接
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 主动断开WebSocket连接');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.eventListeners.clear();
  }

  // 重连
  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 WebSocket重连中 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('重连失败:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    if (!this.socket) return;

    // 游戏状态更新
    this.socket.on('gameStateUpdate', (gameState: GameState) => {
      console.log('📊 收到游戏状态更新:', gameState);
      this.emit('gameStateUpdate', gameState);
    });

    // 回合结果
    this.socket.on('roundResult', (result: RoundResult) => {
      console.log('🎯 收到回合结果:', result);
      this.emit('roundResult', result);
    });

    // 玩家加入
    this.socket.on('playerJoined', (data: { userId: string; username: string }) => {
      console.log('👋 玩家加入:', data);
      this.emit('playerJoined', data);
    });

    // 玩家离开
    this.socket.on('playerLeft', (data: { userId: string }) => {
      console.log('👋 玩家离开:', data);
      this.emit('playerLeft', data);
    });

    // 错误处理
    this.socket.on('error', (error: { message: string; code?: string }) => {
      console.error('❌ WebSocket错误:', error);
      this.emit('error', error);
    });
  }

  // 加入游戏房间
  joinGame(gameId: string, userId: string): void {
    if (!this.socket?.connected) {
      console.error('WebSocket未连接，无法加入游戏');
      return;
    }

    console.log('🎮 加入游戏房间:', { gameId, userId });
    this.socket.emit('joinGame', { gameId, userId });
  }

  // 离开游戏房间
  leaveGame(gameId: string): void {
    if (!this.socket?.connected) {
      console.error('WebSocket未连接，无法离开游戏');
      return;
    }

    console.log('🚪 离开游戏房间:', gameId);
    this.socket.emit('leaveGame', { gameId });
  }

  // 请求游戏状态
  requestGameState(gameId: string): void {
    if (!this.socket?.connected) {
      console.error('WebSocket未连接，无法请求游戏状态');
      return;
    }

    console.log('📊 请求游戏状态:', gameId);
    this.socket.emit('requestGameState', { gameId });
  }

  // 提交行动
  submitAction(gameId: string, action: any): void {
    if (!this.socket?.connected) {
      console.error('WebSocket未连接，无法提交行动');
      return;
    }

    console.log('🎯 提交行动:', { gameId, action });
    this.socket.emit('submitAction', { gameId, action });
  }

  // 添加事件监听器
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  // 移除事件监听器
  off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  // 触发事件
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`事件监听器错误 (${event}):`, error);
        }
      });
    }
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // 获取连接状态
  getConnectionState(): {
    connected: boolean;
    connecting: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      connected: this.socket?.connected || false,
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }

  // 发送心跳包
  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }
}

// 创建单例实例
export const socketService = new SocketService();

// 导出类型
export type { SocketService };
