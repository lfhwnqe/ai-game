import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { Game, GameDocument } from './schemas/game.schema';
import { GameState, GameStateDocument } from './schemas/game-state.schema';
import { PlayerAction, PlayerActionDocument } from './schemas/player-action.schema';

import { CharactersService } from '../characters/characters.service';
import { AiService } from '../ai/ai.service';
import { GameGateway } from './game.gateway';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(GameState.name) private gameStateModel: Model<GameStateDocument>,
    @InjectModel(PlayerAction.name) private playerActionModel: Model<PlayerActionDocument>,
    private charactersService: CharactersService,
    private aiService: AiService,
    private configService: ConfigService,
  ) {}

  /**
   * 创建新游戏
   */
  async createGame(
    playerId: string,
    difficulty: string = 'standard',
    winCondition: string = 'wealth'
  ): Promise<Game> {
    const gameId = this.generateGameId();

    const initialPlayerStats = {
      money: this.configService.get<number>('game.balance.initialMoney'),
      reputation: this.configService.get<number>('game.balance.initialReputation'),
      influence: 0,
      relationships: {},
      achievements: [],
    };

    const game = new this.gameModel({
      gameId,
      playerId,
      status: 'waiting',
      currentRound: 1,
      difficulty,
      winCondition,
      playerStats: initialPlayerStats,
      gameStartTime: new Date(),
    });

    await game.save();

    // 初始化游戏状态
    await this.initializeGameState(gameId, playerId);

    return game;
  }

  /**
   * 获取游戏信息
   */
  async getGame(gameId: string): Promise<Game> {
    const game = await this.gameModel.findOne({ gameId }).exec();
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }
    return game;
  }

  /**
   * 获取用户的游戏列表
   */
  async getUserGames(playerId: string, status?: string): Promise<Game[]> {
    const query: any = { playerId };

    if (status) {
      query.status = status;
    }

    const games = await this.gameModel
      .find(query)
      .sort({ gameStartTime: -1 })
      .exec();

    return games;
  }

  /**
   * 获取当前游戏状态
   */
  async getCurrentGameState(gameId: string): Promise<any> {
    const game = await this.getGame(gameId);
    const gameState = await this.gameStateModel
      .findOne({ gameId, round: game.currentRound })
      .exec();

    if (!gameState) {
      // 如果找不到游戏状态，创建一个默认的
      console.log(`Game state not found for game ${gameId}, round ${game.currentRound}. Creating default state.`);
      await this.initializeGameState(gameId, game.playerId);

      // 重新查询
      const newGameState = await this.gameStateModel
        .findOne({ gameId, round: game.currentRound })
        .exec();

      if (!newGameState) {
        throw new NotFoundException(`Failed to create game state for round ${game.currentRound}`);
      }

      return this.formatGameStateForFrontend(newGameState);
    }

    return this.formatGameStateForFrontend(gameState);
  }

  /**
   * 将后端游戏状态格式化为前端期望的格式
   */
  private formatGameStateForFrontend(gameState: any): any {
    return {
      gameId: gameState.gameId,
      currentRound: gameState.round,
      playerCharacter: {
        characterId: 'player',
        name: '玩家',
        type: 'player',
        resources: {
          money: gameState.playerState.money,
          reputation: gameState.playerState.reputation,
          health: 100, // 默认值
          connections: Object.keys(gameState.playerState.relationships || {}).length,
        },
        relationships: gameState.playerState.relationships || {},
        status: 'active',
        location: '深圳',
        description: '1980年代的创业者',
        history: [],
      },
      marketCondition: this.getMarketCondition(gameState.marketState),
      recentEvents: (gameState.activeEvents || []).map(event => ({
        eventId: event.eventId,
        eventType: event.type as any,
        title: event.title,
        description: event.description,
        impact: event.effects,
        timestamp: new Date().toISOString(),
      })),
      availableActions: gameState.availableActions || [],
    };
  }

  /**
   * 根据市场状态确定市场条件
   */
  private getMarketCondition(marketState: any): 'boom' | 'stable' | 'recession' {
    // 简单的市场条件判断逻辑
    const inflationRate = marketState.inflationRate || 0.03;
    const interestRates = marketState.interestRates || 0.05;

    if (inflationRate < 0.02 && interestRates < 0.04) {
      return 'boom';
    } else if (inflationRate > 0.05 || interestRates > 0.08) {
      return 'recession';
    } else {
      return 'stable';
    }
  }

  /**
   * 获取可用行动列表
   */
  async getAvailableActions(gameId: string): Promise<any[]> {
    try {
      const gameState = await this.getCurrentGameState(gameId);
      return gameState.availableActions || [];
    } catch (error) {
      // 如果游戏状态不存在，返回默认行动
      const game = await this.getGame(gameId);
      return await this.generateAvailableActions(gameId, game.currentRound);
    }
  }

  /**
   * 开始游戏
   */
  async startGame(gameId: string): Promise<Game> {
    const game = await this.getGame(gameId);

    if (game.status !== 'waiting') {
      throw new BadRequestException('Game is not in waiting status');
    }

    const updatedGame = await this.gameModel.findOneAndUpdate(
      { gameId },
      {
        status: 'active',
        gameStartTime: new Date()
      },
      { new: true }
    ).exec();

    return updatedGame;
  }

  /**
   * 提交玩家行动
   */
  async submitPlayerAction(
    gameId: string, 
    playerId: string, 
    actionData: any
  ): Promise<PlayerAction> {
    const game = await this.getGame(gameId);
    
    if (game.status !== 'active') {
      throw new BadRequestException('Game is not active');
    }

    if (game.playerId !== playerId) {
      throw new BadRequestException('Invalid player for this game');
    }

    const playerAction = new this.playerActionModel({
      gameId,
      playerId,
      round: game.currentRound,
      actionId: actionData.actionId,
      actionType: actionData.actionType,
      actionName: actionData.actionName,
      actionData: actionData,
      submittedAt: new Date(),
    });

    await playerAction.save();

    // 异步处理回合
    this.processRound(gameId, playerAction).catch(error => {
      console.error(`Error processing round for game ${gameId}:`, error);
    });

    return playerAction;
  }

  /**
   * 处理游戏回合
   */
  private async processRound(gameId: string, playerAction: PlayerAction): Promise<void> {
    try {
      // 1. 标记行动为处理中
      await this.playerActionModel.findOneAndUpdate(
        { gameId, playerId: playerAction.playerId, round: playerAction.round },
        { status: 'processing' }
      ).exec();

      // 2. 获取当前游戏状态
      const currentState = await this.getCurrentGameState(gameId);

      // 3. 生成AI角色行动
      const aiActions = await this.aiService.generateAIActions(gameId, currentState);

      // 4. 计算所有行动结果
      const actionResults = await this.calculateActionResults(
        gameId, 
        playerAction, 
        aiActions, 
        currentState
      );

      // 5. 更新游戏状态
      await this.updateGameState(gameId, actionResults);

      // 6. 标记行动完成
      await this.playerActionModel.findOneAndUpdate(
        { gameId, playerId: playerAction.playerId, round: playerAction.round },
        {
          status: 'completed',
          results: actionResults.playerActionResult,
          processedAt: new Date()
        }
      ).exec();

      // 7. 检查游戏结束条件
      await this.checkGameEndConditions(gameId);

    } catch (error) {
      console.error(`Error in processRound for game ${gameId}:`, error);
      await this.playerActionModel.findOneAndUpdate(
        { gameId, playerId: playerAction.playerId, round: playerAction.round },
        {
          status: 'failed',
          errorMessage: error.message
        }
      ).exec();
    }
  }

  /**
   * 初始化游戏状态
   */
  private async initializeGameState(gameId: string, playerId: string): Promise<void> {
    const initialState = new this.gameStateModel({
      gameId,
      round: 1,
      playerState: {
        money: this.configService.get<number>('game.balance.initialMoney'),
        reputation: this.configService.get<number>('game.balance.initialReputation'),
        influence: 0,
        actionPoints: this.configService.get<number>('game.balance.maxActionPoints'),
        resources: {},
        properties: [],
        businesses: [],
        relationships: {},
      },
      marketState: {
        stockPrices: {},
        commodityPrices: {},
        realEstatePrices: {},
        interestRates: 0.05,
        inflationRate: 0.03,
        economicIndicators: {},
      },
      activeEvents: [],
      availableActions: await this.generateAvailableActions(gameId, 1),
      recentNews: [],
      aiCharacterStates: await this.initializeAICharacterStates(),
    });

    await initialState.save();
  }

  /**
   * 生成游戏ID
   */
  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 生成可用行动
   */
  private async generateAvailableActions(gameId: string, round: number): Promise<any[]> {
    // 根据游戏状态生成可用行动
    return [
      {
        actionId: 'business_invest_small',
        actionType: 'business',
        actionName: '小额投资',
        description: '投资一个小型商业项目，风险较低但收益有限',
        requirements: {
          minMoney: 5000,
          minReputation: 0,
        },
        effects: {
          moneyChange: -5000,
          reputationChange: 5,
        },
      },
      {
        actionId: 'social_networking',
        actionType: 'social',
        actionName: '社交活动',
        description: '参加商业聚会，扩展人脉关系',
        requirements: {
          minMoney: 1000,
          minReputation: 10,
        },
        effects: {
          moneyChange: -1000,
          reputationChange: 10,
        },
      },
      {
        actionId: 'personal_study',
        actionType: 'personal',
        actionName: '学习提升',
        description: '学习商业知识，提升个人能力',
        requirements: {
          minMoney: 500,
        },
        effects: {
          moneyChange: -500,
          reputationChange: 3,
        },
      },
      {
        actionId: 'investment_stocks',
        actionType: 'investment',
        actionName: '股票投资',
        description: '投资股票市场，高风险高收益',
        requirements: {
          minMoney: 10000,
          minReputation: 20,
        },
        effects: {
          moneyChange: -10000,
          reputationChange: 2,
        },
      },
    ];
  }

  /**
   * 初始化AI角色状态
   */
  private async initializeAICharacterStates(): Promise<any> {
    // TODO: 从角色服务获取所有角色并初始化状态
    return {};
  }

  /**
   * 计算行动结果
   */
  private async calculateActionResults(
    gameId: string,
    playerAction: PlayerAction,
    aiActions: any[],
    currentState: GameState
  ): Promise<any> {
    const results = {
      playerActionResult: await this.calculatePlayerActionResult(playerAction, currentState),
      aiActionResults: await this.calculateAIActionResults(aiActions, currentState),
      stateChanges: {},
      marketChanges: {},
      eventChanges: [],
    };

    // 计算行动间的相互影响
    results.stateChanges = this.calculateInteractionEffects(
      results.playerActionResult,
      results.aiActionResults,
      currentState
    );

    // 计算市场变化
    results.marketChanges = this.calculateMarketChanges(currentState, [playerAction, ...aiActions]);

    // 生成新事件
    results.eventChanges = await this.generateNewEvents(gameId, currentState, results);

    return results;
  }

  /**
   * 计算玩家行动结果
   */
  private async calculatePlayerActionResult(action: PlayerAction, gameState: GameState): Promise<any> {
    const result = {
      success: true,
      effects: {},
      relationshipChanges: {},
      resourceChanges: {},
      newOpportunities: [],
      consequences: [],
    };

    // 根据行动类型计算结果
    switch (action.actionType) {
      case 'business':
        return this.calculateBusinessActionResult(action, gameState);
      case 'social':
        return this.calculateSocialActionResult(action, gameState);
      case 'political':
        return this.calculatePoliticalActionResult(action, gameState);
      case 'personal':
        return this.calculatePersonalActionResult(action, gameState);
      default:
        return result;
    }
  }

  /**
   * 计算商业行动结果
   */
  private calculateBusinessActionResult(action: PlayerAction, gameState: GameState): any {
    const result = {
      success: Math.random() > 0.3, // 70%成功率
      effects: {},
      relationshipChanges: {},
      resourceChanges: {},
      newOpportunities: [],
      consequences: [],
    };

    if (action.actionId === 'business_invest') {
      const investAmount = action.actionData.parameters.amount || 10000;

      if (result.success) {
        // 投资成功
        result.resourceChanges = {
          money: -investAmount,
          reputation: 5,
          influence: 3,
        };
        result.effects = {
          businessGrowth: 0.1,
          marketShare: 0.05,
        };
        result.newOpportunities = ['expansion_opportunity', 'partnership_offer'];
      } else {
        // 投资失败
        result.resourceChanges = {
          money: -investAmount * 0.5, // 损失一半
          reputation: -2,
        };
        result.consequences = ['market_reputation_loss', 'investor_doubt'];
      }
    }

    return result;
  }

  /**
   * 计算社交行动结果
   */
  private calculateSocialActionResult(action: PlayerAction, gameState: GameState): any {
    const result = {
      success: Math.random() > 0.2, // 80%成功率
      effects: {},
      relationshipChanges: {},
      resourceChanges: {},
      newOpportunities: [],
      consequences: [],
    };

    if (action.actionId === 'social_networking') {
      if (result.success) {
        result.resourceChanges = {
          money: -1000,
          reputation: 2,
          influence: 5,
        };
        result.relationshipChanges = {
          // 随机改善与某些角色的关系
          'char_001': 5,
          'char_002': 3,
        };
        result.newOpportunities = ['new_contact', 'business_introduction'];
      }
    }

    return result;
  }

  /**
   * 计算政治行动结果
   */
  private calculatePoliticalActionResult(action: PlayerAction, gameState: GameState): any {
    return {
      success: Math.random() > 0.4, // 60%成功率
      effects: {},
      relationshipChanges: {},
      resourceChanges: { reputation: 1 },
      newOpportunities: [],
      consequences: [],
    };
  }

  /**
   * 计算个人行动结果
   */
  private calculatePersonalActionResult(action: PlayerAction, gameState: GameState): any {
    return {
      success: true, // 个人行动通常都成功
      effects: {},
      relationshipChanges: {},
      resourceChanges: {},
      newOpportunities: [],
      consequences: [],
    };
  }

  /**
   * 计算AI行动结果
   */
  private async calculateAIActionResults(aiActions: any[], gameState: GameState): Promise<any[]> {
    const results = [];

    for (const action of aiActions) {
      const result = {
        characterId: action.characterId,
        actionId: action.actionId,
        success: Math.random() > 0.25, // 75%成功率
        effects: {},
        resourceChanges: {},
        relationshipChanges: {},
      };

      // 根据行动类型计算结果
      if (action.actionType === 'business') {
        result.resourceChanges = { money: 5000, reputation: 2 };
      } else if (action.actionType === 'social') {
        result.relationshipChanges = { [action.characterId]: 3 };
      }

      results.push(result);
    }

    return results;
  }

  /**
   * 计算行动间的相互影响
   */
  private calculateInteractionEffects(
    playerResult: any,
    aiResults: any[],
    gameState: GameState
  ): any {
    const stateChanges: any = {
      playerStateChanges: playerResult.resourceChanges || {},
      aiStateChanges: {},
      globalEffects: {},
    };

    // 计算AI角色状态变化
    for (const aiResult of aiResults) {
      stateChanges.aiStateChanges[aiResult.characterId] = aiResult.resourceChanges || {};
    }

    // 计算全局影响
    const totalBusinessActions = aiResults.filter(r => r.actionId.includes('business')).length;
    if (totalBusinessActions > 3) {
      stateChanges.globalEffects.marketVolatility = 0.1;
    }

    return stateChanges;
  }

  /**
   * 计算市场变化
   */
  private calculateMarketChanges(gameState: GameState, allActions: any[]): any {
    const marketChanges = {
      stockPrices: {},
      commodityPrices: {},
      interestRates: gameState.marketState.interestRates,
      inflationRate: gameState.marketState.inflationRate,
    };

    // 根据行动数量影响市场
    const businessActionCount = allActions.filter(a => a.actionType === 'business').length;

    if (businessActionCount > 2) {
      marketChanges.interestRates += 0.001; // 轻微上升
    }

    // 随机市场波动
    marketChanges.inflationRate += (Math.random() - 0.5) * 0.002;

    return marketChanges;
  }

  /**
   * 生成新事件
   */
  private async generateNewEvents(gameId: string, gameState: GameState, results: any): Promise<any[]> {
    const newEvents = [];

    // 基于行动结果生成事件
    if (results.playerActionResult.success && results.playerActionResult.effects.businessGrowth) {
      newEvents.push({
        eventId: `event_${Date.now()}`,
        type: 'market',
        title: '商业成功引起关注',
        description: '您的商业投资成功引起了市场关注',
        effects: { reputation: 5 },
        duration: 3,
        remainingRounds: 3,
      });
    }

    // 随机事件
    if (Math.random() < 0.1) { // 10%概率
      newEvents.push({
        eventId: `random_event_${Date.now()}`,
        type: 'policy',
        title: '政策调整',
        description: '政府发布新的经济政策',
        effects: { marketVolatility: 0.05 },
        duration: 5,
        remainingRounds: 5,
      });
    }

    return newEvents;
  }

  /**
   * 生成新闻
   */
  private async generateNews(actionResults: any): Promise<any[]> {
    const news = [];

    if (actionResults.playerActionResult.success) {
      news.push({
        newsId: `news_${Date.now()}`,
        headline: '本地企业家投资成功',
        content: '一位本地企业家的投资项目获得成功，为当地经济发展注入新活力。',
        impact: 'positive',
        relevantCharacters: [],
        timestamp: new Date(),
      });
    }

    return news;
  }

  /**
   * 更新游戏状态
   */
  private async updateGameState(gameId: string, actionResults: any): Promise<void> {
    const game = await this.getGame(gameId);
    const currentState = await this.getCurrentGameState(gameId);

    // 更新玩家状态
    const newPlayerState = { ...currentState.playerState };
    Object.assign(newPlayerState, actionResults.stateChanges.playerStateChanges);

    // 更新AI角色状态
    const newAIStates = { ...currentState.aiCharacterStates };
    Object.assign(newAIStates, actionResults.stateChanges.aiStateChanges);

    // 更新市场状态
    const newMarketState = { ...currentState.marketState };
    Object.assign(newMarketState, actionResults.marketChanges);

    // 创建新的游戏状态
    const newGameState = new this.gameStateModel({
      gameId,
      round: game.currentRound + 1,
      playerState: newPlayerState,
      marketState: newMarketState,
      activeEvents: [...currentState.activeEvents, ...actionResults.eventChanges],
      availableActions: await this.generateAvailableActions(gameId, game.currentRound + 1),
      recentNews: await this.generateNews(actionResults),
      aiCharacterStates: newAIStates,
    });

    await newGameState.save();

    // 更新游戏基本信息
    await this.gameModel.findOneAndUpdate(
      { gameId },
      {
        currentRound: game.currentRound + 1,
        lastActionTime: new Date()
      }
    ).exec();
  }

  /**
   * 检查游戏结束条件
   */
  private async checkGameEndConditions(gameId: string): Promise<void> {
    const game = await this.getGame(gameId);
    
    // 检查回合数限制
    if (game.currentRound >= game.maxRounds) {
      await this.gameModel.findOneAndUpdate(
        { gameId },
        {
          status: 'completed',
          gameEndTime: new Date(),
          isCompleted: true,
        }
      ).exec();
    }

    // TODO: 检查其他胜利条件
  }
}
