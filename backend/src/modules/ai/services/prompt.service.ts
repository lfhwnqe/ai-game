import { Injectable } from '@nestjs/common';
import { PromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class PromptService {
  private decisionPromptTemplate: PromptTemplate;
  private relationshipPromptTemplate: PromptTemplate;
  private eventResponsePromptTemplate: PromptTemplate;

  constructor() {
    this.initializePrompts();
  }

  private initializePrompts() {
    // 决策提示模板
    this.decisionPromptTemplate = PromptTemplate.fromTemplate(`
你是{characterName}，一个生活在1980年深圳的{profession}。

你的性格特征：{personality}
你的当前目标：{currentGoals}
你的资源状况：{resources}

当前游戏状况：
{gameState}

你与其他角色的关系：
{relationships}

现在你可以选择以下行动之一：
{availableActions}

请根据你的性格、目标和当前情况，选择最合适的行动。

请按以下格式回复：
行动选择: [选择的行动编号]
理由: [详细说明你选择这个行动的原因，体现你的性格和目标]

注意：
1. 你的选择应该符合你的性格特征和职业背景
2. 考虑当前的资源状况和风险承受能力
3. 考虑与其他角色的关系对你决策的影响
4. 优先考虑能够实现你目标的行动
5. 在1980年深圳的历史背景下思考
    `);

    // 关系评估提示模板
    this.relationshipPromptTemplate = PromptTemplate.fromTemplate(`
你是{characterName}，现在需要评估与{targetCharacter}的关系。

你的背景：{characterBackground}
对方的背景：{targetBackground}

最近的互动：{recentInteractions}
共同利益：{sharedInterests}
潜在冲突：{conflicts}

请评估这段关系的：
1. 信任度 (0-100)
2. 尊重度 (0-100)
3. 合作潜力 (0-100)
4. 风险评估 (0-100)

请按以下格式回复：
信任度: [数值]
尊重度: [数值]
合作潜力: [数值]
风险评估: [数值]
关系总结: [简要描述这段关系的特点和发展趋势]
    `);

    // 事件响应提示模板
    this.eventResponsePromptTemplate = PromptTemplate.fromTemplate(`
你是{characterName}，一个{profession}。

刚刚发生了以下事件：
事件类型：{eventType}
事件描述：{eventDescription}
事件影响：{eventEffects}

你的当前状况：
资源：{resources}
目标：{goals}
关系网：{relationships}

这个事件对你可能的影响：
{potentialImpacts}

请分析这个事件并决定你的应对策略：

请按以下格式回复：
事件评估: [这个事件对你是机遇还是威胁，影响程度如何]
应对策略: [你计划如何应对这个事件]
预期结果: [你期望通过这种应对获得什么结果]
风险考虑: [这种应对可能带来的风险]
    `);
  }

  /**
   * 生成决策提示
   */
  async generateDecisionPrompt(
    character: any,
    gameState: any,
    availableActions: any[]
  ): Promise<PromptTemplate> {
    return this.decisionPromptTemplate;
  }

  /**
   * 生成关系评估提示
   */
  async generateRelationshipPrompt(
    character: any,
    targetCharacter: any,
    interactionHistory: any[]
  ): Promise<PromptTemplate> {
    return this.relationshipPromptTemplate;
  }

  /**
   * 生成事件响应提示
   */
  async generateEventResponsePrompt(
    character: any,
    event: any,
    gameState: any
  ): Promise<PromptTemplate> {
    return this.eventResponsePromptTemplate;
  }

  /**
   * 生成角色特定的系统提示
   */
  generateCharacterSystemPrompt(character: any): string {
    const personalityTraits = this.getPersonalityDescription(character.personality);
    const professionalTraits = this.getProfessionalDescription(character.profession);
    
    return `
你是${character.name}，一个生活在1980年深圳经济特区的${character.profession}。

性格特征：${personalityTraits}
职业特点：${professionalTraits}
背景故事：${character.background}

你的核心价值观和行为准则：
1. 始终保持角色的一致性，你的所有决策都应该符合你的性格和背景
2. 在1980年的历史背景下思考，考虑当时的社会环境和商业环境
3. 重视人际关系，但也要保护自己的利益
4. 根据你的风险承受能力做决策
5. 追求你的长期目标，但也要灵活应对变化

记住：你不是一个完美的决策者，你会有情绪波动，会犯错误，会有偏见，这些都是人性的体现。
    `;
  }

  /**
   * 获取性格描述
   */
  private getPersonalityDescription(personality: any): string {
    const traits = [];
    
    if (personality.openness > 0.7) {
      traits.push('思想开放，乐于接受新事物');
    } else if (personality.openness < 0.3) {
      traits.push('保守谨慎，偏好传统方式');
    }

    if (personality.conscientiousness > 0.7) {
      traits.push('做事认真负责，注重细节');
    } else if (personality.conscientiousness < 0.3) {
      traits.push('行事较为随意，不拘小节');
    }

    if (personality.extraversion > 0.7) {
      traits.push('外向活跃，善于社交');
    } else if (personality.extraversion < 0.3) {
      traits.push('内向沉稳，偏好独处');
    }

    if (personality.agreeableness > 0.7) {
      traits.push('友善合作，容易信任他人');
    } else if (personality.agreeableness < 0.3) {
      traits.push('竞争性强，对他人保持警惕');
    }

    if (personality.ambition > 0.7) {
      traits.push('雄心勃勃，追求成功');
    } else if (personality.ambition < 0.3) {
      traits.push('知足常乐，不过分追求');
    }

    if (personality.riskTolerance > 0.7) {
      traits.push('敢于冒险，勇于尝试');
    } else if (personality.riskTolerance < 0.3) {
      traits.push('规避风险，求稳为主');
    }

    return traits.join('；');
  }

  /**
   * 获取职业描述
   */
  private getProfessionalDescription(profession: string): string {
    const descriptions = {
      '政府官员': '具有政策敏感度，重视规则和程序，关注社会稳定和发展',
      '商人': '商业嗅觉敏锐，追求利润最大化，善于发现商机',
      '外商': '具有国际视野，带来先进技术和管理经验，但需要适应本地环境',
      '知识分子': '重视知识和创新，关注社会进步，但可能缺乏商业经验',
      '社会人士': '人脉广泛，信息灵通，善于协调各方关系',
      '工人': '实干精神强，重视实际利益，关注工作稳定性',
      '农民': '勤劳朴实，重视土地和家庭，对新事物较为谨慎',
    };

    return descriptions[profession] || '具有专业技能，在各自领域有一定影响力';
  }

  /**
   * 生成情境化提示
   */
  generateContextualPrompt(context: string, character: any): string {
    const systemPrompt = this.generateCharacterSystemPrompt(character);
    
    return `
${systemPrompt}

当前情境：
${context}

请根据你的性格、背景和当前情境，做出符合角色设定的回应。
    `;
  }
}
