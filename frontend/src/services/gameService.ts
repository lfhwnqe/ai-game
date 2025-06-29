import { api } from './api';
import { Game, GameState, GameAction, PlayerAction, RoundResult } from '../types';

// 游戏相关的API接口
export const gameService = {
  // 创建新游戏
  createGame: async (gameConfig: {
    difficulty: 'easy' | 'standard' | 'hard';
    winCondition: 'wealth' | 'reputation' | 'influence';
  }): Promise<Game> => {
    try {
      const response = await api.post<Game>('/games', gameConfig);
      console.log('游戏创建成功:', response);
      return response;
    } catch (error) {
      console.error('创建游戏失败:', error);
      throw error;
    }
  },

  // 获取游戏信息
  getGame: async (gameId: string): Promise<Game> => {
    try {
      const response = await api.get<Game>(`/games/${gameId}`);
      return response;
    } catch (error) {
      console.error('获取游戏信息失败:', error);
      throw error;
    }
  },

  // 获取游戏状态
  getGameState: async (gameId: string): Promise<GameState> => {
    try {
      const response = await api.get<GameState>(`/games/${gameId}/state`);
      console.log('游戏状态:', response);
      return response;
    } catch (error) {
      console.error('获取游戏状态失败:', error);
      throw error;
    }
  },

  // 开始游戏
  startGame: async (gameId: string): Promise<Game> => {
    try {
      const response = await api.post<Game>(`/games/${gameId}/start`);
      console.log('游戏已开始:', response);
      return response;
    } catch (error) {
      console.error('开始游戏失败:', error);
      throw error;
    }
  },

  // 提交玩家行动
  submitPlayerAction: async (gameId: string, action: PlayerAction): Promise<PlayerAction> => {
    try {
      const response = await api.post<PlayerAction>(`/games/${gameId}/actions`, action);
      console.log('行动提交成功:', response);
      return response;
    } catch (error) {
      console.error('提交行动失败:', error);
      throw error;
    }
  },

  // 获取可用行动列表
  getAvailableActions: async (gameId: string): Promise<GameAction[]> => {
    try {
      const response = await api.get<GameAction[]>(`/games/${gameId}/actions/available`);
      return response;
    } catch (error) {
      console.error('获取可用行动失败:', error);
      throw error;
    }
  },

  // 获取行动历史
  getActionHistory: async (gameId: string, page: number = 1, limit: number = 20): Promise<{
    actions: Array<{
      roundNumber: number;
      action: PlayerAction;
      timestamp: string;
      result?: any;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const response = await api.get(`/games/${gameId}/actions`, {
        params: { page, limit }
      });
      return response;
    } catch (error) {
      console.error('获取行动历史失败:', error);
      throw error;
    }
  },

  // 获取用户的游戏列表
  getUserGames: async (status?: string): Promise<Game[]> => {
    try {
      const params = status ? { status } : {};
      const response = await api.get<{ games: Game[] }>('/games', { params });
      return response.games;
    } catch (error) {
      console.error('获取游戏列表失败:', error);
      throw error;
    }
  },

  // 暂停游戏
  pauseGame: async (gameId: string): Promise<Game> => {
    try {
      const response = await api.post<{ game: Game }>(`/games/${gameId}/pause`);
      console.log('游戏已暂停:', response.game);
      return response.game;
    } catch (error) {
      console.error('暂停游戏失败:', error);
      throw error;
    }
  },

  // 恢复游戏
  resumeGame: async (gameId: string): Promise<Game> => {
    try {
      const response = await api.post<{ game: Game }>(`/games/${gameId}/resume`);
      console.log('游戏已恢复:', response.game);
      return response.game;
    } catch (error) {
      console.error('恢复游戏失败:', error);
      throw error;
    }
  },

  // 结束游戏
  endGame: async (gameId: string): Promise<{
    game: Game;
    finalStats: {
      finalRound: number;
      playerStats: any;
      achievements: string[];
      ranking: number;
    };
  }> => {
    try {
      const response = await api.post(`/games/${gameId}/end`);
      console.log('游戏已结束:', response);
      return response;
    } catch (error) {
      console.error('结束游戏失败:', error);
      throw error;
    }
  },

  // 获取游戏统计信息
  getGameStats: async (gameId: string): Promise<{
    totalRounds: number;
    actionsCount: number;
    relationshipChanges: number;
    moneyEarned: number;
    reputationGained: number;
    eventsTriggered: number;
  }> => {
    try {
      const response = await api.get(`/games/${gameId}/stats`);
      return response;
    } catch (error) {
      console.error('获取游戏统计失败:', error);
      throw error;
    }
  },

  // 获取排行榜
  getLeaderboard: async (type: 'wealth' | 'reputation' | 'influence' = 'wealth', limit: number = 10): Promise<Array<{
    rank: number;
    username: string;
    score: number;
    gameId: string;
    completedAt: string;
  }>> => {
    try {
      const response = await api.get('/games/leaderboard', {
        params: { type, limit }
      });
      return response;
    } catch (error) {
      console.error('获取排行榜失败:', error);
      throw error;
    }
  },
};

// 游戏工具函数
export const gameUtils = {
  // 格式化游戏时间
  formatGameTime: (round: number, maxRounds: number = 200): string => {
    const year = 1980 + Math.floor(round / 12);
    const month = (round % 12) + 1;
    return `${year}年${month}月`;
  },

  // 计算游戏进度百分比
  calculateProgress: (currentRound: number, maxRounds: number = 200): number => {
    return Math.min((currentRound / maxRounds) * 100, 100);
  },

  // 获取难度显示名称
  getDifficultyName: (difficulty: string): string => {
    const names = {
      easy: '简单',
      standard: '标准',
      hard: '困难'
    };
    return names[difficulty as keyof typeof names] || difficulty;
  },

  // 获取胜利条件显示名称
  getWinConditionName: (condition: string): string => {
    const names = {
      wealth: '财富积累',
      reputation: '声望建立',
      influence: '影响力扩张'
    };
    return names[condition as keyof typeof names] || condition;
  },

  // 获取游戏状态显示名称
  getGameStatusName: (status: string): string => {
    const names = {
      waiting: '等待开始',
      active: '进行中',
      paused: '已暂停',
      completed: '已完成'
    };
    return names[status as keyof typeof names] || status;
  },

  // 验证行动参数
  validateActionData: (action: PlayerAction): boolean => {
    if (!action.actionId || !action.actionType || !action.actionName) {
      return false;
    }
    
    if (!action.actionData || !action.actionData.reasoning) {
      return false;
    }
    
    return true;
  },

  // 格式化金额显示
  formatMoney: (amount: number): string => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}亿`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    } else {
      return amount.toLocaleString();
    }
  },
};
