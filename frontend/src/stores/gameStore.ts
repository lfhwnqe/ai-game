import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Game, GameState, GameAction, PlayerAction, RoundResult, Character } from '../types';
import { gameService } from '../services/gameService';

interface GameStoreState {
  // 当前游戏状态
  currentGame: Game | null;
  gameState: GameState | null;
  availableActions: GameAction[];
  isProcessing: boolean;
  lastRoundResult: RoundResult | null;
  
  // 游戏历史
  gameHistory: Game[];
  actionHistory: Array<{
    roundNumber: number;
    action: PlayerAction;
    timestamp: string;
    result?: any;
  }>;
  
  // UI状态
  isLoading: boolean;
  error: string | null;
  selectedAction: GameAction | null;
  
  // 操作方法
  createGame: (config: {
    difficulty: 'easy' | 'standard' | 'hard';
    winCondition: 'wealth' | 'reputation' | 'influence';
  }) => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
  startGame: (gameId: string) => Promise<void>;
  submitAction: (action: PlayerAction) => Promise<void>;
  pauseGame: () => Promise<void>;
  resumeGame: () => Promise<void>;
  endGame: () => Promise<void>;
  
  // 状态更新
  updateGameState: (gameState: GameState) => void;
  updateRoundResult: (result: RoundResult) => void;
  setAvailableActions: (actions: GameAction[]) => void;
  setSelectedAction: (action: GameAction | null) => void;
  setProcessing: (isProcessing: boolean) => void;
  
  // 工具方法
  clearError: () => void;
  reset: () => void;
  loadGameHistory: () => Promise<void>;
}

export const useGameStore = create<GameStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        currentGame: null,
        gameState: null,
        availableActions: [],
        isProcessing: false,
        lastRoundResult: null,
        gameHistory: [],
        actionHistory: [],
        isLoading: false,
        error: null,
        selectedAction: null,

        // 创建新游戏
        createGame: async (config) => {
          set({ isLoading: true, error: null });
          
          try {
            const game = await gameService.createGame(config);
            
            set({
              currentGame: game,
              gameState: null,
              availableActions: [],
              lastRoundResult: null,
              actionHistory: [],
              isLoading: false,
              error: null,
            });
            
            console.log('游戏创建成功:', game);
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '创建游戏失败',
            });
            
            console.error('创建游戏失败:', error);
            throw error;
          }
        },

        // 加载游戏
        loadGame: async (gameId) => {
          set({ isLoading: true, error: null });
          
          try {
            const [game, gameState] = await Promise.all([
              gameService.getGame(gameId),
              gameService.getGameState(gameId),
            ]);
            
            // 如果游戏正在进行，获取可用行动
            let availableActions: GameAction[] = [];
            if (game.status === 'active') {
              try {
                availableActions = await gameService.getAvailableActions(gameId);
              } catch (error) {
                console.warn('获取可用行动失败:', error);
              }
            }
            
            set({
              currentGame: game,
              gameState,
              availableActions,
              isLoading: false,
              error: null,
            });
            
            console.log('游戏加载成功:', { game, gameState });
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '加载游戏失败',
            });
            
            console.error('加载游戏失败:', error);
            throw error;
          }
        },

        // 开始游戏
        startGame: async (gameId) => {
          set({ isLoading: true, error: null });

          try {
            const updatedGame = await gameService.startGame(gameId);
            const gameState = await gameService.getGameState(gameId);
            const availableActions = await gameService.getAvailableActions(gameId);

            set({
              currentGame: updatedGame,
              gameState,
              availableActions,
              isLoading: false,
              error: null,
            });

            console.log('游戏开始成功:', { game: updatedGame, gameState });
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '开始游戏失败',
            });

            console.error('开始游戏失败:', error);
            throw error;
          }
        },

        // 提交行动
        submitAction: async (action) => {
          const { currentGame } = get();
          if (!currentGame) {
            throw new Error('没有活跃的游戏');
          }
          
          set({ isProcessing: true, error: null });
          
          try {
            const result = await gameService.submitPlayerAction(currentGame.gameId, action);
            
            // 更新游戏状态
            const updatedGameState = await gameService.getGameState(currentGame.gameId);
            const availableActions = await gameService.getAvailableActions(currentGame.gameId);
            
            set({
              gameState: updatedGameState,
              availableActions,
              lastRoundResult: result,
              isProcessing: false,
              selectedAction: null,
              error: null,
            });
            
            // 添加到行动历史
            const actionHistory = get().actionHistory;
            set({
              actionHistory: [
                ...actionHistory,
                {
                  roundNumber: result.roundNumber,
                  action,
                  timestamp: new Date().toISOString(),
                  result,
                },
              ],
            });
            
            console.log('行动提交成功:', result);
          } catch (error: any) {
            set({
              isProcessing: false,
              error: error.message || '提交行动失败',
            });
            
            console.error('提交行动失败:', error);
            throw error;
          }
        },

        // 暂停游戏
        pauseGame: async () => {
          const { currentGame } = get();
          if (!currentGame) return;
          
          set({ isLoading: true, error: null });
          
          try {
            const updatedGame = await gameService.pauseGame(currentGame.gameId);
            
            set({
              currentGame: updatedGame,
              isLoading: false,
              error: null,
            });
            
            console.log('游戏已暂停');
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '暂停游戏失败',
            });
            
            console.error('暂停游戏失败:', error);
            throw error;
          }
        },

        // 恢复游戏
        resumeGame: async () => {
          const { currentGame } = get();
          if (!currentGame) return;
          
          set({ isLoading: true, error: null });
          
          try {
            const updatedGame = await gameService.resumeGame(currentGame.gameId);
            const availableActions = await gameService.getAvailableActions(currentGame.gameId);
            
            set({
              currentGame: updatedGame,
              availableActions,
              isLoading: false,
              error: null,
            });
            
            console.log('游戏已恢复');
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '恢复游戏失败',
            });
            
            console.error('恢复游戏失败:', error);
            throw error;
          }
        },

        // 结束游戏
        endGame: async () => {
          const { currentGame } = get();
          if (!currentGame) return;
          
          set({ isLoading: true, error: null });
          
          try {
            const result = await gameService.endGame(currentGame.gameId);
            
            set({
              currentGame: result.game,
              availableActions: [],
              isLoading: false,
              error: null,
            });
            
            console.log('游戏已结束:', result);
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '结束游戏失败',
            });
            
            console.error('结束游戏失败:', error);
            throw error;
          }
        },

        // 更新游戏状态
        updateGameState: (gameState) => {
          set({ gameState });
        },

        // 更新回合结果
        updateRoundResult: (result) => {
          set({ lastRoundResult: result });
        },

        // 设置可用行动
        setAvailableActions: (actions) => {
          set({ availableActions: actions });
        },

        // 设置选中的行动
        setSelectedAction: (action) => {
          set({ selectedAction: action });
        },

        // 设置处理状态
        setProcessing: (isProcessing) => {
          set({ isProcessing });
        },

        // 清除错误
        clearError: () => {
          set({ error: null });
        },

        // 重置状态
        reset: () => {
          set({
            currentGame: null,
            gameState: null,
            availableActions: [],
            isProcessing: false,
            lastRoundResult: null,
            actionHistory: [],
            isLoading: false,
            error: null,
            selectedAction: null,
          });
        },

        // 加载游戏历史
        loadGameHistory: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const games = await gameService.getUserGames();
            
            set({
              gameHistory: games,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '加载游戏历史失败',
            });
            
            console.error('加载游戏历史失败:', error);
          }
        },
      }),
      {
        name: 'game-storage',
        partialize: (state) => ({
          currentGame: state.currentGame,
          gameState: state.gameState,
          actionHistory: state.actionHistory,
        }),
      }
    ),
    { name: 'game-store' }
  )
);

// 游戏状态选择器
export const gameSelectors = {
  // 获取当前游戏
  getCurrentGame: () => useGameStore.getState().currentGame,
  
  // 获取游戏状态
  getGameState: () => useGameStore.getState().gameState,
  
  // 获取当前回合
  getCurrentRound: () => useGameStore.getState().gameState?.currentRound || 0,
  
  // 获取玩家角色
  getPlayerCharacter: () => useGameStore.getState().gameState?.playerCharacter || null,
  
  // 检查是否可以提交行动
  canSubmitAction: () => {
    const state = useGameStore.getState();
    return !state.isProcessing && 
           state.availableActions.length > 0 && 
           state.currentGame?.status === 'active';
  },
  
  // 获取游戏进度
  getGameProgress: () => {
    const state = useGameStore.getState();
    const currentRound = state.gameState?.currentRound || 0;
    const maxRounds = state.currentGame?.maxRounds || 200;
    return (currentRound / maxRounds) * 100;
  },
};
