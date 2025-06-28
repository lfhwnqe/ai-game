import { Injectable } from '@nestjs/common';
import { DecisionEngineService } from './services/decision-engine.service';

@Injectable()
export class AiService {
  constructor(
    private decisionEngineService: DecisionEngineService,
  ) {}

  /**
   * 生成AI角色行动
   */
  async generateAIActions(gameId: string, gameState: any): Promise<any[]> {
    try {
      // 获取所有AI角色
      const aiCharacters = await this.getAICharacters(gameState);
      
      // 为每个角色生成可用行动
      const availableActionsMap = new Map<string, any[]>();
      for (const character of aiCharacters) {
        const actions = await this.generateAvailableActions(character, gameState);
        availableActionsMap.set(character.characterId, actions);
      }

      // 批量生成决策
      const decisions = await this.decisionEngineService.generateBatchDecisions(
        aiCharacters,
        gameState,
        availableActionsMap
      );

      // 转换为行动格式
      const aiActions = [];
      for (const [characterId, decision] of decisions.entries()) {
        const character = aiCharacters.find(c => c.characterId === characterId);
        const availableActions = availableActionsMap.get(characterId) || [];
        const selectedAction = availableActions[decision.actionIndex];

        if (selectedAction) {
          aiActions.push({
            characterId,
            actionId: selectedAction.actionId,
            actionType: selectedAction.type,
            actionName: selectedAction.name,
            actionData: {
              parameters: selectedAction.parameters || {},
              reasoning: decision.reasoning,
            },
            timestamp: new Date(),
            aiGenerated: true,
          });
        }
      }

      return aiActions;

    } catch (error) {
      console.error('生成AI行动失败:', error);
      return [];
    }
  }

  /**
   * 获取AI角色列表
   */
  private async getAICharacters(gameState: any): Promise<any[]> {
    // TODO: 从角色服务获取所有AI角色
    // 这里返回模拟数据
    return Object.keys(gameState.aiCharacterStates || {}).map(characterId => ({
      characterId,
      name: `角色${characterId}`,
      profession: '商人',
      type: 'businessman',
      personality: {
        openness: 0.5,
        conscientiousness: 0.6,
        extraversion: 0.7,
        agreeableness: 0.5,
        ambition: 0.8,
        riskTolerance: 0.6,
      },
      currentStatus: {
        currentGoals: ['赚钱', '扩大影响力'],
        mood: 'neutral',
      },
      resources: gameState.aiCharacterStates[characterId] || {
        money: 50000,
        reputation: 50,
        influence: 30,
      },
    }));
  }

  /**
   * 为角色生成可用行动
   */
  private async generateAvailableActions(character: any, gameState: any): Promise<any[]> {
    const actions = [];

    // 基础商业行动
    if (character.resources.money >= 10000) {
      actions.push({
        actionId: 'business_invest',
        type: 'business',
        name: '商业投资',
        description: '投资一个商业项目',
        costs: { money: 10000, actionPoints: 1 },
        parameters: { amount: 10000 },
      });
    }

    // 社交行动
    actions.push({
      actionId: 'social_networking',
      type: 'social',
      name: '社交活动',
      description: '参加社交活动扩展人脉',
      costs: { money: 1000, actionPoints: 1 },
      parameters: {},
    });

    // 信息收集
    actions.push({
      actionId: 'gather_info',
      type: 'personal',
      name: '收集信息',
      description: '收集市场和政策信息',
      costs: { money: 500, actionPoints: 1 },
      parameters: {},
    });

    // 等待行动（总是可用）
    actions.push({
      actionId: 'wait',
      type: 'personal',
      name: '观望等待',
      description: '观察形势，等待更好的机会',
      costs: { actionPoints: 1 },
      parameters: {},
    });

    return actions;
  }

  /**
   * 评估AI角色关系
   */
  async evaluateRelationship(
    characterId: string,
    targetCharacterId: string,
    interactionHistory: any[]
  ): Promise<any> {
    // TODO: 使用AI评估角色关系
    return {
      trust: 50,
      respect: 50,
      cooperationPotential: 50,
      riskAssessment: 30,
      summary: '中性关系，有合作潜力',
    };
  }

  /**
   * 生成AI角色对事件的响应
   */
  async generateEventResponse(
    characterId: string,
    event: any,
    gameState: any
  ): Promise<any> {
    // TODO: 使用AI生成事件响应
    return {
      assessment: '这是一个机遇',
      strategy: '积极参与',
      expectedOutcome: '获得更多资源',
      risks: '可能面临竞争',
    };
  }

  /**
   * 更新AI角色状态
   */
  async updateAICharacterState(
    characterId: string,
    stateChanges: any
  ): Promise<void> {
    // TODO: 更新AI角色的状态
    console.log(`更新角色 ${characterId} 状态:`, stateChanges);
  }

  /**
   * 获取AI决策统计
   */
  async getAIStats(): Promise<any> {
    return {
      totalDecisions: 0,
      successRate: 0,
      averageDecisionTime: 0,
      cacheHitRate: 0,
    };
  }
}
