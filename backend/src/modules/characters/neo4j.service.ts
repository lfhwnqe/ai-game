import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver: Driver;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get<string>('database.neo4j.uri');
    const username = this.configService.get<string>('database.neo4j.username');
    const password = this.configService.get<string>('database.neo4j.password');

    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

    // 测试连接
    try {
      await this.driver.verifyConnectivity();
      console.log('✅ Neo4j connection established');
    } catch (error) {
      console.error('❌ Neo4j connection failed:', error);
    }
  }

  async onModuleDestroy() {
    if (this.driver) {
      await this.driver.close();
    }
  }

  getSession(): Session {
    return this.driver.session();
  }

  /**
   * 创建角色节点
   */
  async createCharacterNode(character: any): Promise<void> {
    const session = this.getSession();
    try {
      await session.run(
        `
        MERGE (c:Character {id: $id})
        SET c.name = $name,
            c.profession = $profession,
            c.type = $type,
            c.age = $age,
            c.personality = $personality,
            c.resources = $resources,
            c.skills = $skills,
            c.updatedAt = datetime()
        `,
        {
          id: character.characterId,
          name: character.name,
          profession: character.profession,
          type: character.type,
          age: character.age,
          personality: character.personality,
          resources: character.resources,
          skills: character.skills,
        }
      );
    } finally {
      await session.close();
    }
  }

  /**
   * 创建或更新关系
   */
  async createOrUpdateRelationship(
    fromCharacterId: string,
    toCharacterId: string,
    relationshipType: string,
    strength: number,
    trust: number,
    respect: number,
    attributes: any = {}
  ): Promise<void> {
    const session = this.getSession();
    try {
      await session.run(
        `
        MATCH (from:Character {id: $fromId})
        MATCH (to:Character {id: $toId})
        MERGE (from)-[r:RELATIONSHIP]->(to)
        SET r.type = $type,
            r.strength = $strength,
            r.trust = $trust,
            r.respect = $respect,
            r.attributes = $attributes,
            r.updatedAt = datetime()
        `,
        {
          fromId: fromCharacterId,
          toId: toCharacterId,
          type: relationshipType,
          strength,
          trust,
          respect,
          attributes,
        }
      );
    } finally {
      await session.close();
    }
  }

  /**
   * 获取角色的所有关系
   */
  async getCharacterRelationships(characterId: string): Promise<any[]> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `
        MATCH (c:Character {id: $characterId})-[r:RELATIONSHIP]-(other:Character)
        RETURN other.id as characterId, 
               other.name as name,
               r.type as relationshipType,
               r.strength as strength,
               r.trust as trust,
               r.respect as respect,
               r.attributes as attributes
        ORDER BY r.strength DESC
        `,
        { characterId }
      );

      return result.records.map(record => ({
        characterId: record.get('characterId'),
        name: record.get('name'),
        relationshipType: record.get('relationshipType'),
        strength: record.get('strength'),
        trust: record.get('trust'),
        respect: record.get('respect'),
        attributes: record.get('attributes'),
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * 查找最短路径
   */
  async findShortestPath(fromCharacterId: string, toCharacterId: string): Promise<any> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `
        MATCH (from:Character {id: $fromId}), (to:Character {id: $toId})
        MATCH path = shortestPath((from)-[*]-(to))
        RETURN path, length(path) as pathLength
        `,
        { fromId: fromCharacterId, toId: toCharacterId }
      );

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      return {
        path: record.get('path'),
        length: record.get('pathLength'),
      };
    } finally {
      await session.close();
    }
  }

  /**
   * 获取影响力最高的角色
   */
  async getMostInfluentialCharacters(limit: number = 10): Promise<any[]> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `
        MATCH (c:Character)-[r:RELATIONSHIP]-()
        WITH c, count(r) as connectionCount, avg(r.strength) as avgStrength
        RETURN c.id as characterId,
               c.name as name,
               c.profession as profession,
               connectionCount,
               avgStrength,
               (connectionCount * avgStrength) as influenceScore
        ORDER BY influenceScore DESC
        LIMIT $limit
        `,
        { limit }
      );

      return result.records.map(record => ({
        characterId: record.get('characterId'),
        name: record.get('name'),
        profession: record.get('profession'),
        connectionCount: record.get('connectionCount').toNumber(),
        avgStrength: record.get('avgStrength'),
        influenceScore: record.get('influenceScore'),
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * 获取角色的朋友圈（二度关系）
   */
  async getCharacterNetwork(characterId: string, depth: number = 2): Promise<any> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `
        MATCH (center:Character {id: $characterId})
        CALL apoc.path.subgraphNodes(center, {
          relationshipFilter: "RELATIONSHIP",
          minLevel: 0,
          maxLevel: $depth
        }) YIELD node
        MATCH (node)-[r:RELATIONSHIP]-(connected)
        WHERE connected IN apoc.path.subgraphNodes(center, {
          relationshipFilter: "RELATIONSHIP",
          minLevel: 0,
          maxLevel: $depth
        })
        RETURN DISTINCT node.id as id, node.name as name, node.profession as profession,
               collect(DISTINCT {
                 target: connected.id,
                 targetName: connected.name,
                 type: r.type,
                 strength: r.strength
               }) as relationships
        `,
        { characterId, depth }
      );

      return result.records.map(record => ({
        id: record.get('id'),
        name: record.get('name'),
        profession: record.get('profession'),
        relationships: record.get('relationships'),
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * 更新关系强度
   */
  async updateRelationshipStrength(
    fromCharacterId: string,
    toCharacterId: string,
    strengthChange: number
  ): Promise<void> {
    const session = this.getSession();
    try {
      await session.run(
        `
        MATCH (from:Character {id: $fromId})-[r:RELATIONSHIP]-(to:Character {id: $toId})
        SET r.strength = CASE 
          WHEN r.strength + $change > 100 THEN 100
          WHEN r.strength + $change < -100 THEN -100
          ELSE r.strength + $change
        END,
        r.updatedAt = datetime()
        `,
        {
          fromId: fromCharacterId,
          toId: toCharacterId,
          change: strengthChange,
        }
      );
    } finally {
      await session.close();
    }
  }
}
