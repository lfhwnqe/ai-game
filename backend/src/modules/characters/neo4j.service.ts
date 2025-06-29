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
      // 根据深度构建不同的查询
      let query = '';
      if (depth === 1) {
        query = `
          MATCH (center:Character {id: $characterId})
          OPTIONAL MATCH (center)-[r1:RELATIONSHIP]-(level1:Character)
          WITH center, collect(DISTINCT level1) as level1Nodes
          WITH center, level1Nodes, [center] + level1Nodes as allNodes
          UNWIND allNodes as node
          OPTIONAL MATCH (node)-[r:RELATIONSHIP]-(other:Character)
          WHERE other IN allNodes
          RETURN DISTINCT
            node.id as id,
            node.name as name,
            node.profession as profession,
            node.type as type,
            collect(DISTINCT {
              target: other.id,
              targetName: other.name,
              type: r.type,
              strength: r.strength,
              trust: r.trust,
              respect: r.respect
            }) as relationships
          ORDER BY
            CASE WHEN node.id = $characterId THEN 0 ELSE 1 END,
            node.name
        `;
      } else {
        query = `
          MATCH (center:Character {id: $characterId})
          OPTIONAL MATCH (center)-[r1:RELATIONSHIP]-(level1:Character)
          OPTIONAL MATCH (level1)-[r2:RELATIONSHIP]-(level2:Character)
          WHERE level2.id <> center.id
          WITH center, collect(DISTINCT level1) as level1Nodes, collect(DISTINCT level2) as level2Nodes
          WITH center, level1Nodes, level2Nodes, [center] + level1Nodes + level2Nodes as allNodes
          UNWIND allNodes as node
          OPTIONAL MATCH (node)-[r:RELATIONSHIP]-(other:Character)
          WHERE other IN allNodes
          RETURN DISTINCT
            node.id as id,
            node.name as name,
            node.profession as profession,
            node.type as type,
            collect(DISTINCT {
              target: other.id,
              targetName: other.name,
              type: r.type,
              strength: r.strength,
              trust: r.trust,
              respect: r.respect
            }) as relationships
          ORDER BY
            CASE WHEN node.id = $characterId THEN 0 ELSE 1 END,
            node.name
        `;
      }

      const result = await session.run(query, { characterId });

      const nodes = result.records.map(record => ({
        id: record.get('id'),
        name: record.get('name'),
        profession: record.get('profession'),
        type: record.get('type'),
        relationships: record.get('relationships').filter(rel => rel.target !== null),
      }));

      // 构建网络数据结构
      const edges = [];
      const nodeMap = new Map();

      nodes.forEach(node => {
        nodeMap.set(node.id, node);
      });

      nodes.forEach(node => {
        node.relationships.forEach(rel => {
          if (rel.target && nodeMap.has(rel.target)) {
            // 避免重复边
            const edgeExists = edges.some(edge =>
              (edge.from === node.id && edge.to === rel.target) ||
              (edge.from === rel.target && edge.to === node.id)
            );
            if (!edgeExists) {
              edges.push({
                from: node.id,
                to: rel.target,
                type: rel.type,
                strength: rel.strength,
                trust: rel.trust,
                respect: rel.respect
              });
            }
          }
        });
      });

      return {
        nodes: nodes.map(node => ({
          id: node.id,
          name: node.name,
          profession: node.profession,
          type: node.type,
          level: node.id === characterId ? 0 : 1 // 简化层级计算
        })),
        edges: edges
      };
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
