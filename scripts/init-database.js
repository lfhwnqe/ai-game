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

    // 创建示例角色
    const characters = [
      {
        id: 'char_001',
        name: '李建国',
        age: 45,
        profession: '政府官员',
        type: 'government',
        personality: '改革派，支持外商投资',
        background: '深圳市经济发展委员会主任，坚信改革开放政策',
        money: 50000,
        reputation: 80,
        health: 90
      },
      {
        id: 'char_002',
        name: '黄志华',
        age: 42,
        profession: '贸易商',
        type: 'businessman',
        personality: '精明能干，善于抓住商机',
        background: '本地最大贸易商，与香港有密切联系',
        money: 200000,
        reputation: 70,
        health: 85
      },
      {
        id: 'char_003',
        name: '田中一郎',
        age: 45,
        profession: '外商代表',
        type: 'foreigner',
        personality: '技术导向，注重质量',
        background: '日本电子公司代表，带来先进技术',
        money: 500000,
        reputation: 60,
        health: 80
      }
    ];

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
          createdAt: datetime()
        })
      `, char);
    }
    console.log(`✅ 创建${characters.length}个角色`);

    // 创建关系
    const relationships = [
      {
        from: 'char_001',
        to: 'char_002',
        type: 'COOPERATES_WITH',
        strength: 70,
        reason: '政策支持'
      },
      {
        from: 'char_002',
        to: 'char_003',
        type: 'TRADES_WITH',
        strength: 80,
        reason: '商业合作'
      },
      {
        from: 'char_001',
        to: 'char_003',
        type: 'REGULATES',
        strength: 60,
        reason: '政府监管'
      }
    ];

    for (const rel of relationships) {
      await session.run(`
        MATCH (a:Character {id: $from}), (b:Character {id: $to})
        CREATE (a)-[r:${rel.type} {
          strength: $strength,
          reason: $reason,
          createdAt: datetime()
        }]->(b)
      `, rel);
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
    console.log('  - Neo4j: 3个角色节点，3个关系边');
    console.log('  - MongoDB: 4个集合，1个配置文档');
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
