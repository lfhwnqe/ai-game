import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Game, GameState, GameAction, Character, RoundResult, Notification } from '../types';

// 基础游戏原子
export const currentGameAtom = atomWithStorage<Game | null>('currentGame', null);
export const gameStateAtom = atom<GameState | null>(null);
export const availableActionsAtom = atom<GameAction[]>([]);
export const selectedActionAtom = atom<GameAction | null>(null);
export const isProcessingAtom = atom<boolean>(false);
export const lastRoundResultAtom = atom<RoundResult | null>(null);

// UI状态原子
export const isLoadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);
export const notificationsAtom = atom<Notification[]>([]);
export const activeTabAtom = atomWithStorage<'game' | 'characters' | 'relationships'>('activeTab', 'game');

// 角色相关原子
export const selectedCharacterAtom = atom<string | null>(null);
export const showCharacterDetailsAtom = atom<boolean>(false);
export const showRelationshipNetworkAtom = atom<boolean>(false);

// 派生原子 - 游戏信息
export const currentRoundAtom = atom((get) => {
  const gameState = get(gameStateAtom);
  return gameState?.currentRound || 0;
});

export const maxRoundsAtom = atom((get) => {
  const game = get(currentGameAtom);
  return game?.maxRounds || 200;
});

export const gameProgressAtom = atom((get) => {
  const currentRound = get(currentRoundAtom);
  const maxRounds = get(maxRoundsAtom);
  return maxRounds > 0 ? (currentRound / maxRounds) * 100 : 0;
});

export const gameTimeAtom = atom((get) => {
  const currentRound = get(currentRoundAtom);
  const year = 1980 + Math.floor(currentRound / 12);
  const month = (currentRound % 12) + 1;
  return { year, month, display: `${year}年${month}月` };
});

// 派生原子 - 玩家角色
export const playerCharacterAtom = atom((get) => {
  const gameState = get(gameStateAtom);
  return gameState?.playerCharacter || null;
});

export const playerResourcesAtom = atom((get) => {
  const character = get(playerCharacterAtom);
  return character?.resources || {
    money: 0,
    reputation: 0,
    health: 100,
    connections: 0,
  };
});

export const playerStatsAtom = atom((get) => {
  const resources = get(playerResourcesAtom);
  return {
    money: resources.money,
    reputation: resources.reputation,
    health: resources.health,
    connections: resources.connections,
    // 格式化显示
    moneyDisplay: resources.money >= 100000000 
      ? `${(resources.money / 100000000).toFixed(1)}亿`
      : resources.money >= 10000 
        ? `${(resources.money / 10000).toFixed(1)}万`
        : resources.money.toLocaleString(),
    reputationDisplay: `${resources.reputation}/100`,
    healthDisplay: `${resources.health}%`,
    connectionsDisplay: `${resources.connections}人`,
  };
});

// 派生原子 - 游戏状态
export const canSubmitActionAtom = atom((get) => {
  const isProcessing = get(isProcessingAtom);
  const availableActions = get(availableActionsAtom);
  const game = get(currentGameAtom);
  
  return !isProcessing && 
         availableActions.length > 0 && 
         game?.status === 'active';
});

export const gameStatusAtom = atom((get) => {
  const game = get(currentGameAtom);
  const isProcessing = get(isProcessingAtom);
  
  if (!game) return 'no-game';
  if (isProcessing) return 'processing';
  return game.status;
});

export const marketConditionAtom = atom((get) => {
  const gameState = get(gameStateAtom);
  return gameState?.marketCondition || 'stable';
});

export const recentEventsAtom = atom((get) => {
  const gameState = get(gameStateAtom);
  return gameState?.recentEvents || [];
});

// 派生原子 - 行动相关
export const selectedActionDetailsAtom = atom((get) => {
  const selectedAction = get(selectedActionAtom);
  const playerResources = get(playerResourcesAtom);
  
  if (!selectedAction) return null;
  
  // 检查是否满足行动要求
  const requirements = selectedAction.requirements || {};
  const canAfford = !requirements.minMoney || playerResources.money >= requirements.minMoney;
  const hasReputation = !requirements.minReputation || playerResources.reputation >= requirements.minReputation;
  
  return {
    ...selectedAction,
    canExecute: canAfford && hasReputation,
    missingRequirements: {
      money: requirements.minMoney && playerResources.money < requirements.minMoney 
        ? requirements.minMoney - playerResources.money 
        : 0,
      reputation: requirements.minReputation && playerResources.reputation < requirements.minReputation 
        ? requirements.minReputation - playerResources.reputation 
        : 0,
    },
  };
});

// 派生原子 - 通知系统
export const unreadNotificationsCountAtom = atom((get) => {
  const notifications = get(notificationsAtom);
  return notifications.filter(n => !n.autoClose).length;
});

export const latestNotificationAtom = atom((get) => {
  const notifications = get(notificationsAtom);
  return notifications.length > 0 ? notifications[notifications.length - 1] : null;
});

// 写入原子 - 通知管理
export const addNotificationAtom = atom(
  null,
  (get, set, notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const notifications = get(notificationsAtom);
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    set(notificationsAtom, [...notifications, newNotification]);
    
    // 自动关闭通知
    if (newNotification.autoClose !== false) {
      setTimeout(() => {
        const currentNotifications = get(notificationsAtom);
        set(notificationsAtom, currentNotifications.filter(n => n.id !== newNotification.id));
      }, 5000);
    }
  }
);

export const removeNotificationAtom = atom(
  null,
  (get, set, notificationId: string) => {
    const notifications = get(notificationsAtom);
    set(notificationsAtom, notifications.filter(n => n.id !== notificationId));
  }
);

export const clearAllNotificationsAtom = atom(
  null,
  (get, set) => {
    set(notificationsAtom, []);
  }
);

// 写入原子 - 游戏状态管理
export const updateGameStateAtom = atom(
  null,
  (get, set, gameState: GameState) => {
    set(gameStateAtom, gameState);
    
    // 自动更新可用行动
    if (gameState.availableActions) {
      set(availableActionsAtom, gameState.availableActions);
    }
    
    // 添加回合结果通知
    if (gameState.roundResults) {
      set(addNotificationAtom, {
        type: 'info',
        title: `第${gameState.currentRound}回合结果`,
        message: '回合处理完成，查看详细结果',
      });
    }
  }
);

export const updateRoundResultAtom = atom(
  null,
  (get, set, result: RoundResult) => {
    set(lastRoundResultAtom, result);
    
    // 添加回合完成通知
    set(addNotificationAtom, {
      type: 'success',
      title: '回合完成',
      message: `第${result.roundNumber}回合已处理完成`,
    });
  }
);

// 写入原子 - 错误处理
export const setErrorAtom = atom(
  null,
  (get, set, error: string | null) => {
    set(errorAtom, error);
    
    if (error) {
      set(addNotificationAtom, {
        type: 'error',
        title: '错误',
        message: error,
        autoClose: false,
      });
    }
  }
);

export const clearErrorAtom = atom(
  null,
  (get, set) => {
    set(errorAtom, null);
  }
);

// 组合原子 - 游戏总览
export const gameOverviewAtom = atom((get) => {
  const game = get(currentGameAtom);
  const gameState = get(gameStateAtom);
  const playerStats = get(playerStatsAtom);
  const gameTime = get(gameTimeAtom);
  const gameProgress = get(gameProgressAtom);
  const canSubmitAction = get(canSubmitActionAtom);
  
  return {
    game,
    gameState,
    playerStats,
    gameTime,
    gameProgress,
    canSubmitAction,
    isActive: game?.status === 'active',
    isPaused: game?.status === 'paused',
    isCompleted: game?.status === 'completed',
  };
});
