const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
const bcrypt = require('bcryptjs');
const { charactersData } = require('../data/characters-data');
const { relationshipsData } = require('../data/relationships-data');
require('dotenv').config();

console.log('🚀 开始初始化数据库...');

// 关系数据现在从外部文件导入

async function initMongoDB() {
  try {
    console.log('🔄 连接MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aigame');
    console.log('✅ MongoDB连接成功');

    const db = mongoose.connection.db;

    // 删除现有集合
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
    }
    console.log('✅ 删除现有集合');

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

    // 创建初始用户
    console.log('🔄 创建初始用户...');
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
        bio: '系统管理员'
      },
      gameStats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalPlayTime: 0,
        achievements: []
      },
      activeGames: [],
      status: 'active',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ 创建初始用户 (用户名: admin, 密码: admin123)');

    // 创建角色数据
    console.log('🔄 创建角色数据...');
    const Character = mongoose.model('Character', new mongoose.Schema({}, { strict: false }));
    await Character.insertMany(charactersData);
    console.log(`✅ 创建了 ${charactersData.length} 个角色`);

    // 创建关系数据
    console.log('🔄 创建关系数据...');
    const Relationship = mongoose.model('Relationship', new mongoose.Schema({}, { strict: false }));
    await Relationship.insertMany(relationshipsData);
    console.log(`✅ 创建了 ${relationshipsData.length} 个关系`);

  } catch (error) {
    console.error('❌ MongoDB初始化失败:', error);
    throw error;
  }
}

async function initNeo4j() {
  const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
      process.env.NEO4J_USERNAME || 'neo4j',
      process.env.NEO4J_PASSWORD || 'password'
    )
  );

  const session = driver.session();

  try {
    console.log('🔄 连接Neo4j...');
    await session.run('RETURN 1');
    console.log('✅ Neo4j连接成功');

    // 清空现有数据
    console.log('🔄 清空Neo4j数据...');
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('✅ 清空Neo4j数据');

    // 创建角色节点
    console.log('🔄 创建角色节点...');
    for (const character of charactersData) {
      await session.run(
        `
        CREATE (c:Character {
          id: $id,
          name: $name,
          profession: $profession,
          type: $type,
          age: $age,
          personality: $personality,
          resources: $resources,
          skills: $skills,
          createdAt: datetime()
        })
        `,
        {
          id: character.characterId,
          name: character.name,
          profession: character.profession,
          type: character.type,
          age: character.age,
          // 将复杂对象转换为JSON字符串
          personality: JSON.stringify(character.personality),
          resources: JSON.stringify(character.resources),
          skills: JSON.stringify(character.skills),
        }
      );
    }
    console.log(`✅ 创建了 ${charactersData.length} 个角色节点`);

    // 创建关系
    console.log('🔄 创建关系...');
    for (const relationship of relationshipsData) {
      await session.run(
        `
        MATCH (from:Character {id: $fromId})
        MATCH (to:Character {id: $toId})
        CREATE (from)-[r:RELATIONSHIP {
          type: $type,
          strength: $strength,
          trust: $trust,
          respect: $respect,
          attributes: $attributes,
          createdAt: datetime()
        }]->(to)
        `,
        {
          fromId: relationship.fromCharacterId,
          toId: relationship.toCharacterId,
          type: relationship.relationshipType,
          strength: relationship.strength,
          trust: relationship.trust,
          respect: relationship.respect,
          // 将复杂对象转换为JSON字符串
          attributes: JSON.stringify(relationship.attributes || {}),
        }
      );
    }
    console.log(`✅ 创建了 ${relationshipsData.length} 个关系`);

  } catch (error) {
    console.error('❌ Neo4j初始化失败:', error);
    throw error;
  } finally {
    await session.close();
    await driver.close();
  }
}

async function main() {
  try {
    await initMongoDB();
    await initNeo4j();
    console.log('🎉 数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('💥 初始化失败:', error);
    process.exit(1);
  }
}

main();
