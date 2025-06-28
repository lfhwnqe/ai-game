import { registerAs } from '@nestjs/config';

export const gameConfig = registerAs('game', () => ({
  roundTimeout: parseInt(process.env.GAME_ROUND_TIMEOUT) || 120000, // 2分钟
  maxPlayersPerGame: parseInt(process.env.MAX_PLAYERS_PER_GAME) || 1,
  aiDecisionTimeout: parseInt(process.env.AI_DECISION_TIMEOUT) || 30000, // 30秒
  maxRounds: parseInt(process.env.GAME_MAX_ROUNDS) || 200,
  autoSaveInterval: parseInt(process.env.GAME_AUTOSAVE_INTERVAL) || 60000, // 1分钟
  enableDebugMode: process.env.GAME_DEBUG_MODE === 'true',
  
  // 游戏平衡参数
  balance: {
    initialMoney: parseInt(process.env.GAME_INITIAL_MONEY) || 100000,
    initialReputation: parseInt(process.env.GAME_INITIAL_REPUTATION) || 50,
    maxActionPoints: parseInt(process.env.GAME_MAX_ACTION_POINTS) || 3,
  },
  
  // AI行为参数
  ai: {
    aggressiveness: parseFloat(process.env.AI_AGGRESSIVENESS) || 0.5,
    cooperativeness: parseFloat(process.env.AI_COOPERATIVENESS) || 0.6,
    riskTolerance: parseFloat(process.env.AI_RISK_TOLERANCE) || 0.4,
  },
}));
