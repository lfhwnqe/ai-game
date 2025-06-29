import { api } from './api';
import { Character, Relationship } from '../types';

// 角色相关的API接口
export const characterService = {
  // 获取所有角色
  getAllCharacters: async (type?: string): Promise<Character[]> => {
    try {
      const params = type ? { type } : {};
      const response = await api.get<Character[]>('/characters', { params });
      return response;
    } catch (error) {
      console.error('获取角色列表失败:', error);
      throw error;
    }
  },

  // 获取单个角色详情
  getCharacter: async (characterId: string): Promise<Character> => {
    try {
      const response = await api.get<Character>(`/characters/${characterId}`);
      return response;
    } catch (error) {
      console.error('获取角色详情失败:', error);
      throw error;
    }
  },

  // 获取角色关系
  getCharacterRelationships: async (characterId: string): Promise<Relationship[]> => {
    try {
      const response = await api.get<Relationship[]>(`/characters/${characterId}/relationships`);
      return response;
    } catch (error) {
      console.error('获取角色关系失败:', error);
      throw error;
    }
  },

  // 获取角色社交网络
  getCharacterNetwork: async (characterId: string, depth: number = 2): Promise<{
    nodes: Array<{
      id: string;
      name: string;
      profession: string;
      level: number;
    }>;
    edges: Array<{
      from: string;
      to: string;
      type: string;
      strength: number;
    }>;
  }> => {
    try {
      const response = await api.get(`/characters/${characterId}/network`, {
        params: { depth }
      });
      return response;
    } catch (error) {
      console.error('获取角色社交网络失败:', error);
      throw error;
    }
  },

  // 查找两个角色之间的连接路径
  findConnectionPath: async (fromId: string, toId: string): Promise<{
    path: Array<{
      characterId: string;
      name: string;
      relationship: string;
    }>;
    totalStrength: number;
    pathLength: number;
  }> => {
    try {
      const response = await api.get(`/characters/${fromId}/path/${toId}`);
      return response;
    } catch (error) {
      console.error('查找连接路径失败:', error);
      throw error;
    }
  },

  // 获取最有影响力的角色
  getInfluentialCharacters: async (limit: number = 10): Promise<Array<{
    character: Character;
    influenceScore: number;
    connectionCount: number;
    rank: number;
  }>> => {
    try {
      const response = await api.get('/characters/stats/influential', {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('获取影响力排行失败:', error);
      throw error;
    }
  },

  // 搜索角色
  searchCharacters: async (query: string, filters?: {
    profession?: string;
    ageRange?: [number, number];
    minReputation?: number;
  }): Promise<Character[]> => {
    try {
      const params = {
        q: query,
        ...filters
      };
      const response = await api.get<Character[]>('/characters/search', { params });
      return response;
    } catch (error) {
      console.error('搜索角色失败:', error);
      throw error;
    }
  },

  // 获取角色统计信息
  getCharacterStats: async (): Promise<{
    totalCharacters: number;
    professionDistribution: Record<string, number>;
    averageAge: number;
    relationshipTypes: Record<string, number>;
    topProfessions: Array<{
      profession: string;
      count: number;
      percentage: number;
    }>;
  }> => {
    try {
      const response = await api.get('/characters/stats');
      return response;
    } catch (error) {
      console.error('获取角色统计失败:', error);
      throw error;
    }
  },

  // 获取角色关系统计
  getRelationshipStats: async (characterId: string): Promise<{
    totalRelationships: number;
    relationshipTypes: Record<string, number>;
    averageStrength: number;
    strongestRelationships: Array<{
      character: Character;
      relationship: Relationship;
    }>;
    weakestRelationships: Array<{
      character: Character;
      relationship: Relationship;
    }>;
  }> => {
    try {
      const response = await api.get(`/characters/${characterId}/stats`);
      return response;
    } catch (error) {
      console.error('获取关系统计失败:', error);
      throw error;
    }
  },
};

// 角色工具函数
export const characterUtils = {
  // 格式化角色年龄
  formatAge: (age: number): string => {
    return `${age}岁`;
  },

  // 获取职业显示名称
  getProfessionName: (profession: string): string => {
    const professionNames: Record<string, string> = {
      entrepreneur: '企业家',
      trader: '商人',
      official: '官员',
      banker: '银行家',
      manufacturer: '制造商',
      investor: '投资者',
      developer: '开发商',
      merchant: '贸易商',
      consultant: '顾问',
      manager: '经理'
    };
    return professionNames[profession] || profession;
  },

  // 获取关系类型显示名称
  getRelationshipTypeName: (type: string): string => {
    const typeNames: Record<string, string> = {
      family: '家庭',
      friend: '朋友',
      business: '商业',
      romantic: '恋爱',
      rival: '竞争'
    };
    return typeNames[type] || type;
  },

  // 计算关系强度等级
  getRelationshipStrengthLevel: (strength: number): {
    level: string;
    color: string;
    description: string;
  } => {
    if (strength >= 80) {
      return { level: '非常亲密', color: '#00ff88', description: '关系非常牢固' };
    } else if (strength >= 60) {
      return { level: '亲密', color: '#ffaa00', description: '关系良好' };
    } else if (strength >= 40) {
      return { level: '一般', color: '#4488ff', description: '普通关系' };
    } else if (strength >= 20) {
      return { level: '疏远', color: '#ff0088', description: '关系较弱' };
    } else {
      return { level: '陌生', color: '#888888', description: '几乎没有关系' };
    }
  },

  // 计算角色影响力分数
  calculateInfluenceScore: (character: Character): number => {
    const { resources, relationships = [] } = character;
    
    // 基础分数来自资源
    let score = 0;
    score += (resources.money / 1000000) * 10; // 每百万资金10分
    score += resources.reputation * 0.5; // 声望分数
    score += resources.connections * 2; // 人脉分数
    
    // 关系网络加分
    const relationshipBonus = relationships.reduce((total, rel) => {
      return total + (rel.strength / 100) * 5; // 每个强关系最多5分
    }, 0);
    
    score += relationshipBonus;
    
    return Math.round(score);
  },

  // 获取性格特征描述
  getPersonalityDescription: (personality: Character['personality']): string => {
    const traits = [];
    
    if (personality.openness > 70) traits.push('开放');
    if (personality.conscientiousness > 70) traits.push('严谨');
    if (personality.extraversion > 70) traits.push('外向');
    if (personality.agreeableness > 70) traits.push('友善');
    if (personality.neuroticism < 30) traits.push('稳定');
    
    return traits.length > 0 ? traits.join('、') : '平衡';
  },

  // 格式化资源显示
  formatResources: (resources: Character['resources']): {
    money: string;
    reputation: string;
    health: string;
    connections: string;
  } => {
    return {
      money: characterUtils.formatMoney(resources.money),
      reputation: `${resources.reputation}/100`,
      health: `${resources.health}%`,
      connections: `${resources.connections}人`
    };
  },

  // 格式化金额
  formatMoney: (amount: number): string => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}亿`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    } else {
      return `¥${amount.toLocaleString()}`;
    }
  },

  // 获取角色头像URL（如果有的话）
  getAvatarUrl: (characterId: string): string => {
    // 这里可以根据实际情况返回头像URL
    // 目前返回一个占位符
    return `/avatars/${characterId}.png`;
  },

  // 检查两个角色是否有直接关系
  hasDirectRelationship: (character1: Character, character2: Character): boolean => {
    if (!character1.relationships) return false;
    
    return character1.relationships.some(rel => 
      rel.toCharacterId === character2.characterId
    );
  },

  // 获取两个角色之间的关系强度
  getRelationshipStrength: (character1: Character, character2: Character): number => {
    if (!character1.relationships) return 0;
    
    const relationship = character1.relationships.find(rel => 
      rel.toCharacterId === character2.characterId
    );
    
    return relationship ? relationship.strength : 0;
  },
};
