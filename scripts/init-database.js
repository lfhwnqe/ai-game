#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 用于创建初始的角色数据和关系网络
 *
 * 使用方法:
 * yarn db:init 或 node scripts/init-database.js
 */

const neo4j = require('neo4j-driver');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const path = require('path');

// 导入角色数据
const { charactersData } = require('../backend/data/characters-data');
const { relationshipsData } = require('../backend/data/relationships-data');

// 配置
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aigame';

async function initNeo4j() {
  console.log('🔗 初始化Neo4j图数据库...');
  
  const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
  );

  const session = driver.session();

  try {
    // 清空现有数据
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('✅ 清空现有数据');

    // 创建约束
    await session.run(`
      CREATE CONSTRAINT character_id IF NOT EXISTS 
      FOR (c:Character) REQUIRE c.id IS UNIQUE
    `);
    console.log('✅ 创建角色ID约束');

    // 创建索引
    await session.run(`
      CREATE INDEX character_name IF NOT EXISTS 
      FOR (c:Character) ON (c.name)
    `);
    await session.run(`
      CREATE INDEX character_profession IF NOT EXISTS 
      FOR (c:Character) ON (c.profession)
    `);
    console.log('✅ 创建索引');

    // 使用完整的角色数据
    const characters = charactersData.map(char => ({
      id: char.characterId,
      name: char.name,
      age: char.age,
      profession: char.profession,
      type: char.type,
      personality: typeof char.personality === 'object'
        ? `开放性:${char.personality.openness}, 尽责性:${char.personality.conscientiousness}, 外向性:${char.personality.extraversion}`
        : char.personality,
      background: char.background,
      money: char.resources?.money || 100000,
      reputation: char.resources?.reputation || char.resources?.influence || 50,
      health: 80, // 默认健康值
      goals: char.goals,
      skills: char.skills,
      interests: char.interests,
      dislikes: char.dislikes,
      resources: char.resources,
      gameState: char.gameState,
      aiSettings: char.aiSettings,
      isActive: char.isActive
    }));

    // 插入角色
    for (const char of characters) {
      await session.run(`
        CREATE (c:Character {
          id: $id,
          name: $name,
          age: $age,
          profession: $profession,
          type: $type,
          personality: $personality,
          background: $background,
          money: $money,
          reputation: $reputation,
          health: $health,
          goals: $goals,
          interests: $interests,
          dislikes: $dislikes,
          isActive: $isActive,
          createdAt: datetime()
        })
      `, {
        id: char.id,
        name: char.name,
        age: char.age,
        profession: char.profession,
        type: char.type,
        personality: char.personality,
        background: char.background,
        money: char.money,
        reputation: char.reputation,
        health: char.health,
        goals: JSON.stringify(char.goals || []),
        interests: JSON.stringify(char.interests || []),
        dislikes: JSON.stringify(char.dislikes || []),
        isActive: char.isActive
      });
    }
    console.log(`✅ 创建${characters.length}个角色`);

    // 使用完整的关系数据
    const relationships = relationshipsData || [];

    for (const rel of relationships) {
      await session.run(`
        MATCH (a:Character {id: $from}), (b:Character {id: $to})
        CREATE (a)-[r:${rel.relationshipType || rel.type} {
          strength: $strength,
          reason: $reason,
          description: $description,
          createdAt: datetime()
        }]->(b)
      `, {
        from: rel.from || rel.fromCharacterId,
        to: rel.to || rel.toCharacterId,
        strength: rel.strength || 50,
        reason: rel.reason || rel.description || '默认关系',
        description: rel.description || rel.reason || ''
      });
    }
    console.log(`✅ 创建${relationships.length}个关系`);

  } finally {
    await session.close();
    await driver.close();
  }
}

async function initMongoDB() {
  console.log('🍃 初始化MongoDB文档数据库...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();

    // 清空现有集合
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
    }
    console.log('✅ 清空现有集合');

    // 创建游戏状态集合
    await db.createCollection('gameStates');
    await db.collection('gameStates').createIndex({ gameId: 1, round: 1 });
    console.log('✅ 创建游戏状态集合');

    // 创建用户集合
    await db.createCollection('users');
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ 创建用户集合');

    // 创建事件集合
    await db.createCollection('events');
    await db.collection('events').createIndex({ gameId: 1, round: 1 });
    console.log('✅ 创建事件集合');

    // 插入初始用户
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('admin123', saltRounds);

    await db.collection('users').insertOne({
      userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: 'admin',
      email: 'admin@aigame.com',
      passwordHash: passwordHash,
      profile: {
        displayName: '管理员',
        avatar: null,
        bio: '系统管理员',
        location: null,
        website: null,
        socialLinks: {}
      },
      gameStats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalPlayTime: 0,
        achievements: []
      },
      preferences: {
        theme: 'default',
        language: 'zh-CN',
        notifications: {
          email: true,
          push: true,
          gameUpdates: true,
          marketing: false
        },
        privacy: {
          profileVisibility: 'public',
          showOnlineStatus: true,
          allowFriendRequests: true
        }
      },
      activeGames: [],
      status: 'active',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ 创建初始用户 (用户名: admin, 密码: admin123)');

    // 插入初始游戏配置
    await db.collection('gameConfigs').insertOne({
      version: '1.0.0',
      maxRounds: 200,
      maxPlayers: 1,
      aiCharacterCount: 50,
      marketConditions: ['繁荣', '稳定', '衰退', '复苏'],
      createdAt: new Date()
    });
    console.log('✅ 插入游戏配置');

  } finally {
    await client.close();
  }
}

async function main() {
  console.log('🎮 开始初始化AI游戏数据库...\n');
  
  try {
    await initNeo4j();
    console.log('');
    await initMongoDB();
    console.log('\n🎉 数据库初始化完成!');
    console.log('\n📊 数据统计:');
    console.log(`  - Neo4j: ${charactersData.length}个角色节点，${relationshipsData?.length || 0}个关系边`);
    console.log('  - MongoDB: 4个集合，1个配置文档，1个初始用户');
    console.log('\n👤 初始用户信息:');
    console.log('  - 用户名: admin');
    console.log('  - 密码: admin123');
    console.log('  - 邮箱: admin@aigame.com');
    console.log('\n🔗 访问地址:');
    console.log('  - Neo4j浏览器: http://localhost:7474');
    console.log('  - MongoDB: mongodb://localhost:27017/aigame');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { initNeo4j, initMongoDB };
