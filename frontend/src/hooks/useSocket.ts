import { useEffect, useRef, useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { socketService } from '../services/socketService';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { 
  updateGameStateAtom, 
  updateRoundResultAtom, 
  addNotificationAtom,
  setErrorAtom 
} from '../atoms/gameAtoms';
import { GameState, RoundResult } from '../types';

// WebSocket连接状态钩子
export const useSocketConnection = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [, addNotification] = useAtom(addNotificationAtom);
  const [, setError] = useAtom(setErrorAtom);
  const connectionRef = useRef<boolean>(false);

  const connect = useCallback(async () => {
    if (!isAuthenticated || connectionRef.current) return;

    try {
      await socketService.connect();
      connectionRef.current = true;
      
      addNotification({
        type: 'success',
        title: '连接成功',
        message: '实时通信已建立',
      });
    } catch (error: any) {
      console.error('WebSocket连接失败:', error);
      setError(error.message || 'WebSocket连接失败');
    }
  }, [isAuthenticated, addNotification, setError]);

  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      socketService.disconnect();
      connectionRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  return {
    isConnected: socketService.isConnected(),
    connect,
    disconnect,
    connectionState: socketService.getConnectionState(),
  };
};

// 游戏WebSocket事件钩子
export const useGameSocket = (gameId?: string) => {
  const { user } = useAuthStore();
  const { updateGameState, updateRoundResult } = useGameStore();
  const [, updateGameStateAtom_] = useAtom(updateGameStateAtom);
  const [, updateRoundResultAtom_] = useAtom(updateRoundResultAtom);
  const [, addNotification] = useAtom(addNotificationAtom);
  const [, setError] = useAtom(setErrorAtom);
  
  const gameIdRef = useRef<string | undefined>(gameId);
  const listenersSetup = useRef<boolean>(false);

  // 设置游戏事件监听器
  const setupGameListeners = useCallback(() => {
    if (listenersSetup.current) return;

    // 游戏状态更新
    socketService.on('gameStateUpdate', (gameState: GameState) => {
      console.log('🎮 游戏状态更新:', gameState);
      updateGameState(gameState);
      updateGameStateAtom_(gameState);
    });

    // 回合结果
    socketService.on('roundResult', (result: RoundResult) => {
      console.log('🎯 回合结果:', result);
      updateRoundResult(result);
      updateRoundResultAtom_(result);
      
      addNotification({
        type: 'info',
        title: `第${result.roundNumber}回合完成`,
        message: '查看回合结果和AI角色行动',
      });
    });

    // 玩家加入
    socketService.on('playerJoined', (data: { userId: string; username: string }) => {
      if (data.userId !== user?.userId) {
        addNotification({
          type: 'info',
          title: '玩家加入',
          message: `${data.username} 加入了游戏`,
        });
      }
    });

    // 玩家离开
    socketService.on('playerLeft', (data: { userId: string }) => {
      if (data.userId !== user?.userId) {
        addNotification({
          type: 'info',
          title: '玩家离开',
          message: '有玩家离开了游戏',
        });
      }
    });

    // 错误处理
    socketService.on('error', (error: { message: string; code?: string }) => {
      console.error('🚫 游戏WebSocket错误:', error);
      setError(error.message);
    });

    listenersSetup.current = true;
  }, [updateGameState, updateRoundResult, updateGameStateAtom_, updateRoundResultAtom_, addNotification, setError, user?.userId]);

  // 清理事件监听器
  const cleanupListeners = useCallback(() => {
    if (!listenersSetup.current) return;

    socketService.off('gameStateUpdate');
    socketService.off('roundResult');
    socketService.off('playerJoined');
    socketService.off('playerLeft');
    socketService.off('error');

    listenersSetup.current = false;
  }, []);

  // 加入游戏
  const joinGame = useCallback((targetGameId?: string) => {
    const gameToJoin = targetGameId || gameIdRef.current;
    if (!gameToJoin || !user?.userId) return;

    console.log('🎮 加入游戏:', gameToJoin);
    socketService.joinGame(gameToJoin, user.userId);
  }, [user?.userId]);

  // 离开游戏
  const leaveGame = useCallback((targetGameId?: string) => {
    const gameToLeave = targetGameId || gameIdRef.current;
    if (!gameToLeave) return;

    console.log('🚪 离开游戏:', gameToLeave);
    socketService.leaveGame(gameToLeave);
  }, []);

  // 请求游戏状态
  const requestGameState = useCallback((targetGameId?: string) => {
    const targetGame = targetGameId || gameIdRef.current;
    if (!targetGame) return;

    console.log('📊 请求游戏状态:', targetGame);
    socketService.requestGameState(targetGame);
  }, []);

  // 提交行动
  const submitAction = useCallback((action: any, targetGameId?: string) => {
    const targetGame = targetGameId || gameIdRef.current;
    if (!targetGame) return;

    console.log('🎯 提交行动:', { gameId: targetGame, action });
    socketService.submitAction(targetGame, action);
  }, []);

  // 更新gameId
  useEffect(() => {
    gameIdRef.current = gameId;
  }, [gameId]);

  // 设置和清理监听器
  useEffect(() => {
    if (socketService.isConnected()) {
      setupGameListeners();
    }

    return () => {
      cleanupListeners();
    };
  }, [setupGameListeners, cleanupListeners]);

  // 自动加入游戏
  useEffect(() => {
    if (gameId && socketService.isConnected() && user?.userId) {
      joinGame(gameId);
    }

    return () => {
      if (gameId) {
        leaveGame(gameId);
      }
    };
  }, [gameId, joinGame, leaveGame, user?.userId]);

  return {
    joinGame,
    leaveGame,
    requestGameState,
    submitAction,
    isConnected: socketService.isConnected(),
  };
};

// 通用WebSocket钩子
export const useSocket = () => {
  const connectionHook = useSocketConnection();
  
  return {
    ...connectionHook,
    service: socketService,
  };
};

// WebSocket状态监控钩子
export const useSocketStatus = () => {
  const [connectionState, setConnectionState] = useState(
    socketService.getConnectionState()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(socketService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return connectionState;
};
