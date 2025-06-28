// 用户相关类型
export interface User {
  userId: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

// 游戏相关类型
export interface Game {
  gameId: string;
  playerId: string;
  difficulty: 'easy' | 'standard' | 'hard';
  winCondition: 'wealth' | 'reputation' | 'influence';
  status: 'waiting' | 'active' | 'paused' | 'completed';
  currentRound: number;
  maxRounds: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameState {
  gameId: string;
  currentRound: number;
  playerCharacter: Character;
  marketCondition: 'boom' | 'stable' | 'recession';
  recentEvents: GameEvent[];
  availableActions: GameAction[];
  roundResults?: RoundResult;
}

// 角色相关类型
export interface Character {
  characterId: string;
  name: string;
  age: number;
  profession: string;
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  background: string;
  goals: string[];
  resources: {
    money: number;
    reputation: number;
    health: number;
    connections: number;
  };
  relationships?: Relationship[];
}

export interface Relationship {
  fromCharacterId: string;
  toCharacterId: string;
  relationshipType: 'family' | 'friend' | 'business' | 'romantic' | 'rival';
  strength: number;
  description: string;
  history: string[];
}

// 游戏行动类型
export interface GameAction {
  actionId: string;
  actionType: 'business' | 'social' | 'personal' | 'investment';
  actionName: string;
  description: string;
  requirements?: {
    minMoney?: number;
    minReputation?: number;
    requiredConnections?: string[];
  };
  effects?: {
    moneyChange?: number;
    reputationChange?: number;
    healthChange?: number;
  };
}

export interface PlayerAction {
  actionId: string;
  actionType: string;
  actionName: string;
  actionData: {
    parameters: Record<string, any>;
    reasoning: string;
  };
}

// 游戏事件类型
export interface GameEvent {
  eventId: string;
  eventType: 'market' | 'social' | 'personal' | 'random';
  title: string;
  description: string;
  impact: {
    affectedCharacters: string[];
    marketEffect?: number;
    globalEffect?: Record<string, number>;
  };
  timestamp: string;
}

// 回合结果类型
export interface RoundResult {
  roundNumber: number;
  playerAction: PlayerAction;
  aiActions: Array<{
    characterId: string;
    action: PlayerAction;
    reasoning: string;
  }>;
  events: GameEvent[];
  marketChanges: {
    condition: string;
    factors: string[];
  };
  characterUpdates: Array<{
    characterId: string;
    changes: Partial<Character>;
  }>;
  relationshipChanges: Array<{
    fromCharacterId: string;
    toCharacterId: string;
    strengthChange: number;
    reason: string;
  }>;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  statusCode?: number;
  timestamp?: string;
  path?: string;
  method?: string;
  error?: any;
}

// WebSocket事件类型
export interface SocketEvents {
  // 客户端发送的事件
  joinGame: { gameId: string; userId: string };
  leaveGame: { gameId: string };
  requestGameState: { gameId: string };
  submitAction: { gameId: string; action: PlayerAction };

  // 服务器发送的事件
  gameStateUpdate: GameState;
  roundResult: RoundResult;
  playerJoined: { userId: string; username: string };
  playerLeft: { userId: string };
  error: { message: string; code?: string };
}

// UI状态类型
export interface UIState {
  isLoading: boolean;
  selectedCharacter: string | null;
  showCharacterDetails: boolean;
  showRelationshipNetwork: boolean;
  activeTab: 'game' | 'characters' | 'relationships';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  autoClose?: boolean;
}
