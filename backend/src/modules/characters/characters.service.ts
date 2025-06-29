import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Character, CharacterDocument } from './schemas/character.schema';
import { Relationship, RelationshipDocument } from './schemas/relationship.schema';
import { Neo4jService } from './neo4j.service';

@Injectable()
export class CharactersService {
  constructor(
    @InjectModel(Character.name) private characterModel: Model<CharacterDocument>,
    @InjectModel(Relationship.name) private relationshipModel: Model<RelationshipDocument>,
    private neo4jService: Neo4jService,
  ) {}

  /**
   * 获取所有角色
   */
  async getAllCharacters(): Promise<CharacterDocument[]> {
    return this.characterModel.find({ isActive: true }).exec();
  }

  /**
   * 根据ID获取角色
   */
  async getCharacterById(characterId: string): Promise<CharacterDocument> {
    const character = await this.characterModel.findOne({ characterId, isActive: true }).exec();
    if (!character) {
      throw new NotFoundException(`Character with ID ${characterId} not found`);
    }
    return character;
  }

  /**
   * 根据类型获取角色
   */
  async getCharactersByType(type: string): Promise<CharacterDocument[]> {
    return this.characterModel.find({ type, isActive: true }).exec();
  }

  /**
   * 创建角色
   */
  async createCharacter(characterData: Partial<Character>): Promise<CharacterDocument> {
    const character = new this.characterModel(characterData);
    await character.save();

    // 同步到Neo4j
    await this.neo4jService.createCharacterNode(character);

    return character;
  }

  /**
   * 更新角色
   */
  async updateCharacter(characterId: string, updateData: Partial<Character>): Promise<CharacterDocument> {
    const character = await this.characterModel
      .findOneAndUpdate(
        { characterId },
        { ...updateData, 'metadata.lastUpdated': new Date() },
        { new: true }
      )
      .exec();

    if (!character) {
      throw new NotFoundException(`Character with ID ${characterId} not found`);
    }

    // 同步到Neo4j
    await this.neo4jService.createCharacterNode(character);

    return character;
  }

  /**
   * 获取角色关系
   */
  async getCharacterRelationships(characterId: string): Promise<RelationshipDocument[]> {
    return this.relationshipModel
      .find({
        $or: [{ fromCharacterId: characterId }, { toCharacterId: characterId }],
        isActive: true,
      })
      .exec();
  }

  /**
   * 创建或更新关系
   */
  async createOrUpdateRelationship(
    fromCharacterId: string,
    toCharacterId: string,
    relationshipData: Partial<Relationship>
  ): Promise<RelationshipDocument> {
    // 检查角色是否存在
    await this.getCharacterById(fromCharacterId);
    await this.getCharacterById(toCharacterId);

    const relationship = await this.relationshipModel
      .findOneAndUpdate(
        { fromCharacterId, toCharacterId },
        relationshipData,
        { new: true, upsert: true }
      )
      .exec();

    // 同步到Neo4j
    await this.neo4jService.createOrUpdateRelationship(
      fromCharacterId,
      toCharacterId,
      relationship.relationshipType,
      relationship.strength,
      relationship.trust,
      relationship.respect,
      relationship.attributes
    );

    return relationship;
  }

  /**
   * 更新关系强度
   */
  async updateRelationshipStrength(
    fromCharacterId: string,
    toCharacterId: string,
    strengthChange: number,
    reason?: string
  ): Promise<void> {
    const relationship = await this.relationshipModel
      .findOne({ fromCharacterId, toCharacterId })
      .exec();

    if (relationship) {
      const newStrength = Math.max(-100, Math.min(100, relationship.strength + strengthChange));
      
      relationship.strength = newStrength;
      relationship.history.push({
        event: reason || 'Relationship strength updated',
        impact: strengthChange,
        timestamp: new Date(),
      });
      relationship.lastInteraction = new Date();
      relationship.lastInteractionType = strengthChange > 0 ? 'positive' : strengthChange < 0 ? 'negative' : 'neutral';

      await relationship.save();

      // 同步到Neo4j
      await this.neo4jService.updateRelationshipStrength(
        fromCharacterId,
        toCharacterId,
        strengthChange
      );
    }
  }

  /**
   * 获取角色的社交网络
   */
  async getCharacterNetwork(characterId: string, depth: number = 2): Promise<any> {
    return this.neo4jService.getCharacterNetwork(characterId, depth);
  }

  /**
   * 查找两个角色之间的最短路径
   */
  async findConnectionPath(fromCharacterId: string, toCharacterId: string): Promise<any> {
    return this.neo4jService.findShortestPath(fromCharacterId, toCharacterId);
  }

  /**
   * 获取角色统计信息
   */
  async getCharacterStats(): Promise<any> {
    const totalCharacters = await this.characterModel.countDocuments({ isActive: true });
    const totalRelationships = await this.relationshipModel.countDocuments({ isActive: true });

    // 按类型统计角色数量
    const charactersByType = await this.characterModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 按关系类型统计关系数量
    const relationshipsByType = await this.relationshipModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$relationshipType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 获取平均关系强度
    const avgStrengthResult = await this.relationshipModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgStrength: { $avg: '$strength' } } }
    ]);
    const avgStrength = avgStrengthResult[0]?.avgStrength || 0;

    return {
      totalCharacters,
      totalRelationships,
      charactersByType: charactersByType.map(item => ({
        type: item._id,
        count: item.count
      })),
      relationshipsByType: relationshipsByType.map(item => ({
        type: item._id,
        count: item.count
      })),
      averageRelationshipStrength: Math.round(avgStrength * 100) / 100
    };
  }

  /**
   * 获取最有影响力的角色
   */
  async getMostInfluentialCharacters(limit: number = 10): Promise<any[]> {
    return this.neo4jService.getMostInfluentialCharacters(limit);
  }

  /**
   * 更新角色状态
   */
  async updateCharacterStatus(
    characterId: string,
    statusUpdate: Partial<Character['currentStatus']>
  ): Promise<CharacterDocument> {
    const character = await this.getCharacterById(characterId);
    
    character.currentStatus = {
      ...character.currentStatus,
      ...statusUpdate,
    };

    await character.save();
    return character;
  }

  /**
   * 获取角色的潜在合作伙伴
   */
  async getPotentialPartners(characterId: string): Promise<CharacterDocument[]> {
    const character = await this.getCharacterById(characterId);
    const relationships = await this.getCharacterRelationships(characterId);
    
    // 获取已有关系的角色ID
    const connectedCharacterIds = relationships.map(rel => 
      rel.fromCharacterId === characterId ? rel.toCharacterId : rel.fromCharacterId
    );

    // 查找相似类型或互补技能的角色
    const potentialPartners = await this.characterModel
      .find({
        characterId: { $ne: characterId, $nin: connectedCharacterIds },
        isActive: true,
        $or: [
          { type: character.type }, // 同类型
          { 'skills.business': { $gte: character.skills.business - 20 } }, // 相似商业技能
          { interests: { $in: character.interests } }, // 共同兴趣
        ],
      })
      .limit(10)
      .exec();

    return potentialPartners;
  }

  /**
   * 批量初始化角色数据
   */
  async initializeCharacters(charactersData: Partial<Character>[]): Promise<CharacterDocument[]> {
    const characters = await this.characterModel.insertMany(charactersData);
    
    // 同步到Neo4j
    for (const character of characters) {
      await this.neo4jService.createCharacterNode(character);
    }

    return characters as CharacterDocument[];
  }

  /**
   * 批量初始化关系数据
   */
  async initializeRelationships(relationshipsData: Partial<Relationship>[]): Promise<RelationshipDocument[]> {
    const relationships = await this.relationshipModel.insertMany(relationshipsData);
    
    // 同步到Neo4j
    for (const relationship of relationships) {
      await this.neo4jService.createOrUpdateRelationship(
        relationship.fromCharacterId,
        relationship.toCharacterId,
        relationship.relationshipType,
        relationship.strength,
        relationship.trust,
        relationship.respect,
        relationship.attributes
      );
    }

    return relationships as RelationshipDocument[];
  }
}
