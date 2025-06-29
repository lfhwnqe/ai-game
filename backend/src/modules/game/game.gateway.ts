import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend-domain.com'] 
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, { socket: Socket; gameId?: string; userId?: string }>();

  constructor(@Inject(forwardRef(() => GameService)) private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  /**
   * 加入游戏房间
   */
  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; userId: string },
  ) {
    try {
      const { gameId, userId } = data;
      
      // 验证游戏存在
      const game = await this.gameService.getGame(gameId);
      
      // 加入房间
      await client.join(gameId);
      
      // 更新客户端信息
      const clientInfo = this.connectedClients.get(client.id);
      if (clientInfo) {
        clientInfo.gameId = gameId;
        clientInfo.userId = userId;
      }

      // 发送游戏状态
      const gameState = await this.gameService.getCurrentGameState(gameId);
      
      client.emit('gameJoined', {
        success: true,
        game,
        gameState,
      });

      // 通知其他玩家
      client.to(gameId).emit('playerJoined', {
        userId,
        timestamp: new Date(),
      });

    } catch (error) {
      client.emit('error', {
        message: 'Failed to join game',
        error: error.message,
      });
    }
  }

  /**
   * 离开游戏房间
   */
  @SubscribeMessage('leaveGame')
  async handleLeaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const { gameId } = data;
    
    await client.leave(gameId);
    
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      clientInfo.gameId = undefined;
      
      // 通知其他玩家
      client.to(gameId).emit('playerLeft', {
        userId: clientInfo.userId,
        timestamp: new Date(),
      });
    }

    client.emit('gameLeft', { success: true });
  }

  /**
   * 请求游戏状态更新
   */
  @SubscribeMessage('requestGameState')
  async handleRequestGameState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    try {
      const { gameId } = data;
      const gameState = await this.gameService.getCurrentGameState(gameId);
      
      client.emit('gameStateUpdate', {
        gameState,
        timestamp: new Date(),
      });
    } catch (error) {
      client.emit('error', {
        message: 'Failed to get game state',
        error: error.message,
      });
    }
  }

  /**
   * 广播游戏状态更新
   */
  async broadcastGameStateUpdate(gameId: string, gameState: any) {
    this.server.to(gameId).emit('gameStateUpdate', {
      gameState,
      timestamp: new Date(),
    });
  }

  /**
   * 广播回合结果
   */
  async broadcastRoundResult(gameId: string, roundResult: any) {
    this.server.to(gameId).emit('roundResult', {
      result: roundResult,
      timestamp: new Date(),
    });
  }

  /**
   * 广播游戏事件
   */
  async broadcastGameEvent(gameId: string, event: any) {
    this.server.to(gameId).emit('gameEvent', {
      event,
      timestamp: new Date(),
    });
  }

  /**
   * 发送玩家通知
   */
  async sendPlayerNotification(userId: string, notification: any) {
    // 找到用户的连接
    for (const [clientId, clientInfo] of this.connectedClients.entries()) {
      if (clientInfo.userId === userId) {
        clientInfo.socket.emit('notification', {
          notification,
          timestamp: new Date(),
        });
      }
    }
  }
}
