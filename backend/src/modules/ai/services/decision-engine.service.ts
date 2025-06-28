import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptService } from './prompt.service';
import { CacheService } from './cache.service';

@Injectable()
export class DecisionEngineService {
  private llm: ChatGoogleGenerativeAI;
  private outputParser: StringOutputParser;

  constructor(
    private configService: ConfigService,
    private promptService: PromptService,
    private cacheService: CacheService,
  ) {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get<string>('ai.gemini.apiKey'),
      model: this.configService.get<string>('ai.gemini.model') || 'gemini-2.5-flash',
      temperature: this.configService.get<number>('ai.gemini.temperature') || 0.7,
      maxOutputTokens: this.configService.get<number>('ai.gemini.maxTokens') || 500,
    });

    this.outputParser = new StringOutputParser();
  }

  /**
   * AI角色决策主方法
   */
  async makeDecision(
    characterId: string,
    character: any,
    gameState: any,
    availableActions: any[]
  ): Promise<any> {
    try {
      // 检查缓存
      const cacheKey = this.generateCacheKey(characterId, gameState.round, availableActions);
      const cachedDecision = await this.cacheService.get(cacheKey);
      if (cachedDecision) {
        return cachedDecision;
      }

      // 生成决策提示
      const prompt = await this.promptService.generateDecisionPrompt(
        character,
        gameState,
        availableActions
      );

      // 调用LLM进行决策
      const chain = prompt.pipe(this.llm).pipe(this.outputParser);
      const response = await chain.invoke({
        characterName: character.name,
        profession: character.profession,
        personality: this.formatPersonality(character.personality),
        currentGoals: character.currentStatus.currentGoals.join(', '),
        gameState: this.formatGameState(gameState),
        availableActions: this.formatAvailableActions(availableActions),
        relationships: this.formatRelationships(gameState.playerState.relationships),
        resources: this.formatResources(character.resources),
      });

      // 解析AI响应
      const decision = this.parseDecisionResponse(response);

      // 验证决策有效性
      const validatedDecision = this.validateDecision(decision, availableActions);

      // 缓存决策结果
      await this.cacheService.set(cacheKey, validatedDecision, 300); // 5分钟缓存

      return validatedDecision;

    } catch (error) {
      console.error(`AI决策失败 - 角色${characterId}:`, error);
      return this.getDefaultAction(characterId, availableActions);
    }
  }

  /**
   * 批量生成AI角色决策
   */
  async generateBatchDecisions(
    characters: any[],
    gameState: any,
    availableActionsMap: Map<string, any[]>
  ): Promise<Map<string, any>> {
    const decisions = new Map<string, any>();
    
    // 并行处理多个角色的决策
    const decisionPromises = characters.map(async (character) => {
      const availableActions = availableActionsMap.get(character.characterId) || [];
      const decision = await this.makeDecision(
        character.characterId,
        character,
        gameState,
        availableActions
      );
      return { characterId: character.characterId, decision };
    });

    const results = await Promise.allSettled(decisionPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        decisions.set(result.value.characterId, result.value.decision);
      } else {
        console.error(`角色 ${characters[index].characterId} 决策失败:`, result.reason);
        decisions.set(
          characters[index].characterId,
          this.getDefaultAction(characters[index].characterId, [])
        );
      }
    });

    return decisions;
  }

  /**
   * 格式化性格特征
   */
  private formatPersonality(personality: any): string {
    const traits = [];
    if (personality.openness > 0.7) traits.push('开放创新');
    if (personality.conscientiousness > 0.7) traits.push('认真负责');
    if (personality.extraversion > 0.7) traits.push('外向活跃');
    if (personality.agreeableness > 0.7) traits.push('友善合作');
    if (personality.ambition > 0.7) traits.push('雄心勃勃');
    if (personality.riskTolerance > 0.7) traits.push('敢于冒险');
    
    return traits.join('、') || '性格平和';
  }

  /**
   * 格式化游戏状态
   */
  private formatGameState(gameState: any): string {
    return `
当前回合: ${gameState.round}
市场状况: 利率${(gameState.marketState.interestRates * 100).toFixed(1)}%, 通胀率${(gameState.marketState.inflationRate * 100).toFixed(1)}%
活跃事件: ${gameState.activeEvents.map(e => e.title).join(', ') || '无'}
最新消息: ${gameState.recentNews.slice(0, 3).map(n => n.headline).join('; ') || '无'}
    `.trim();
  }

  /**
   * 格式化可用行动
   */
  private formatAvailableActions(actions: any[]): string {
    return actions.map((action, index) => 
      `${index + 1}. ${action.name}: ${action.description} (成本: ${this.formatCosts(action.costs)})`
    ).join('\n');
  }

  /**
   * 格式化关系
   */
  private formatRelationships(relationships: any): string {
    const relationshipEntries = Object.entries(relationships);
    if (relationshipEntries.length === 0) return '暂无重要关系';
    
    return relationshipEntries
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([charId, strength]) => `${charId}: ${(strength as number) > 0 ? '友好' : '敌对'}(${strength})`)
      .join(', ');
  }

  /**
   * 格式化资源
   */
  private formatResources(resources: any): string {
    return `资金: ${resources.money}, 声望: ${resources.reputation}, 影响力: ${resources.influence}`;
  }

  /**
   * 格式化成本
   */
  private formatCosts(costs: any): string {
    const costItems = [];
    if (costs.money) costItems.push(`${costs.money}元`);
    if (costs.actionPoints) costItems.push(`${costs.actionPoints}行动点`);
    if (costs.reputation) costItems.push(`${costs.reputation}声望`);
    return costItems.join(', ') || '无';
  }

  /**
   * 解析AI决策响应
   */
  private parseDecisionResponse(response: string): any {
    try {
      // 尝试解析JSON格式的响应
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // 如果不是JSON，尝试解析结构化文本
      const lines = response.split('\n').filter(line => line.trim());
      const decision: any = {};

      for (const line of lines) {
        if (line.includes('行动选择:') || line.includes('选择行动:')) {
          const actionMatch = line.match(/(\d+)/);
          if (actionMatch) {
            decision.actionIndex = parseInt(actionMatch[1]) - 1;
          }
        } else if (line.includes('理由:') || line.includes('原因:')) {
          decision.reasoning = line.split(':')[1]?.trim();
        }
      }

      return decision;
    } catch (error) {
      console.error('解析AI响应失败:', error);
      return { actionIndex: 0, reasoning: '默认选择' };
    }
  }

  /**
   * 验证决策有效性
   */
  private validateDecision(decision: any, availableActions: any[]): any {
    if (!decision || typeof decision.actionIndex !== 'number') {
      return { actionIndex: 0, reasoning: '无效决策，使用默认选择' };
    }

    if (decision.actionIndex < 0 || decision.actionIndex >= availableActions.length) {
      return { actionIndex: 0, reasoning: '行动索引超出范围，使用默认选择' };
    }

    return {
      actionIndex: decision.actionIndex,
      actionId: availableActions[decision.actionIndex]?.actionId,
      reasoning: decision.reasoning || '未提供理由',
    };
  }

  /**
   * 获取默认行动
   */
  private getDefaultAction(characterId: string, availableActions: any[]): any {
    return {
      actionIndex: 0,
      actionId: availableActions[0]?.actionId || 'wait',
      reasoning: '系统默认选择',
    };
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(characterId: string, round: number, actions: any[]): string {
    const actionsHash = actions.map(a => a.actionId).join(',');
    return `decision:${characterId}:${round}:${actionsHash}`;
  }
}
