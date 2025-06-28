const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
require('dotenv').config();

// 示例角色数据
const charactersData = [
  {
    characterId: 'char_001',
    name: '李明华',
    age: 35,
    profession: '政府官员',
    type: 'government',
    personality: {
      openness: 0.6,
      conscientiousness: 0.8,
      extraversion: 0.7,
      agreeableness: 0.6,
      neuroticism: 0.3,
      ambition: 0.7,
      riskTolerance: 0.4,
      cooperativeness: 0.8,
    },
    background: '深圳市政府经济发展部门官员，负责招商引资工作，对政策敏感，重视规则程序。',
    goals: ['推动经济发展', '维护政府形象', '建立良好的政商关系'],
    resources: {
      money: 50000,
      influence: 80,
      connections: 70,
      knowledge: 75,
      reputation: 85,
    },
    skills: {
      business: 60,
      negotiation: 80,
      leadership: 85,
      technical: 50,
      social: 75,
      political: 90,
    },
    interests: ['政策研究', '经济发展', '城市规划'],
    dislikes: ['腐败', '违法行为', '短视行为'],
    currentStatus: {
      mood: 'neutral',
      energy: 80,
      stress: 40,
      satisfaction: 70,
      currentGoals: ['完成招商任务', '维护部门声誉'],
      recentActions: [],
    },
    aiSettings: {
      aggressiveness: 0.3,
      cooperativeness: 0.8,
      riskTaking: 0.3,
      loyalty: 0.9,
      adaptability: 0.6,
    },
    isActive: true,
  },
  {
    characterId: 'char_002',
    name: '王建国',
    age: 42,
    profession: '商人',
    type: 'businessman',
    personality: {
      openness: 0.8,
      conscientiousness: 0.7,
      extraversion: 0.9,
      agreeableness: 0.5,
      neuroticism: 0.4,
      ambition: 0.9,
      riskTolerance: 0.8,
      cooperativeness: 0.6,
    },
    background: '从事进出口贸易的商人，嗅觉敏锐，善于发现商机，在香港有业务往来。',
    goals: ['扩大贸易规模', '建立商业帝国', '获得更多资源'],
    resources: {
      money: 200000,
      influence: 60,
      connections: 80,
      knowledge: 70,
      reputation: 65,
    },
    skills: {
      business: 90,
      negotiation: 85,
      leadership: 70,
      technical: 40,
      social: 80,
      political: 50,
    },
    interests: ['商业机会', '投资理财', '人脉拓展'],
    dislikes: ['官僚主义', '低效率', '保守思维'],
    currentStatus: {
      mood: 'excited',
      energy: 90,
      stress: 50,
      satisfaction: 80,
      currentGoals: ['寻找新的投资机会', '扩大香港业务'],
      recentActions: [],
    },
    aiSettings: {
      aggressiveness: 0.7,
      cooperativeness: 0.5,
      riskTaking: 0.8,
      loyalty: 0.4,
      adaptability: 0.9,
    },
    isActive: true,
  },
  {
    characterId: 'char_003',
    name: 'John Smith',
    age: 38,
    profession: '外商',
    type: 'foreigner',
    personality: {
      openness: 0.9,
      conscientiousness: 0.8,
      extraversion: 0.6,
      agreeableness: 0.7,
      neuroticism: 0.3,
      ambition: 0.8,
      riskTolerance: 0.7,
      cooperativeness: 0.7,
    },
    background: '美国技术公司代表，带来先进的电子技术和管理经验，希望在中国建立合资企业。',
    goals: ['建立合资企业', '技术转让', '开拓中国市场'],
    resources: {
      money: 500000,
      influence: 40,
      connections: 30,
      knowledge: 90,
      reputation: 70,
    },
    skills: {
      business: 85,
      negotiation: 75,
      leadership: 80,
      technical: 95,
      social: 60,
      political: 30,
    },
    interests: ['技术创新', '国际贸易', '文化交流'],
    dislikes: ['语言障碍', '文化冲突', '官僚程序'],
    currentStatus: {
      mood: 'neutral',
      energy: 75,
      stress: 60,
      satisfaction: 60,
      currentGoals: ['找到合适的合作伙伴', '了解中国市场'],
      recentActions: [],
    },
    aiSettings: {
      aggressiveness: 0.5,
      cooperativeness: 0.7,
      riskTaking: 0.6,
      loyalty: 0.6,
      adaptability: 0.8,
    },
    isActive: true,
  },
];

// 示例关系数据
const relationshipsData = [
  {
    fromCharacterId: 'char_001',
    toCharacterId: 'char_002',
    relationshipType: 'business_partner',
    strength: 60,
    trust: 70,
    respect: 75,
    attributes: {
      intimacy: 40,
      power: 60,
      commitment: 70,
    },
    history: [
      {
        event: '初次会面',
        impact: 20,
        timestamp: new Date('2024-01-01'),
        description: '在招商会议上初次见面',
      },
    ],
    sharedInterests: {
      business: ['经济发展', '投资机会'],
    },
    isActive: true,
  },
  {
    fromCharacterId: 'char_001',
    toCharacterId: 'char_003',
    relationshipType: 'neutral',
    strength: 30,
    trust: 50,
    respect: 60,
    attributes: {
      intimacy: 20,
      power: 40,
      commitment: 30,
    },
    history: [
      {
        event: '政府接待',
        impact: 15,
        timestamp: new Date('2024-01-15'),
        description: '政府接待外商代表团',
      },
    ],
    sharedInterests: {
      business: ['技术合作'],
    },
    isActive: true,
  },
];

async function initMongoDB() {
  try {
    console.log('🔄 连接MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aigame');
    console.log('✅ MongoDB连接成功');

    // 清空现有数据（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 清空现有数据...');
      await mongoose.connection.db.dropDatabase();
      console.log('✅ 数据库已清空');
    }

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
    await driver.verifyConnectivity();
    console.log('✅ Neo4j连接成功');

    // 清空现有数据（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 清空Neo4j数据...');
      await session.run('MATCH (n) DETACH DELETE n');
      console.log('✅ Neo4j数据已清空');
    }

    // 创建约束和索引
    console.log('🔄 创建约束和索引...');
    await session.run('CREATE CONSTRAINT character_id IF NOT EXISTS FOR (c:Character) REQUIRE c.id IS UNIQUE');
    await session.run('CREATE INDEX character_name IF NOT EXISTS FOR (c:Character) ON (c.name)');
    await session.run('CREATE INDEX character_profession IF NOT EXISTS FOR (c:Character) ON (c.profession)');
    console.log('✅ 约束和索引创建完成');

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
          personality: character.personality,
          resources: character.resources,
          skills: character.skills,
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
          attributes: relationship.attributes,
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
    console.log('🚀 开始初始化数据库...');
    
    await initMongoDB();
    await initNeo4j();
    
    console.log('🎉 数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('💥 数据库初始化失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { initMongoDB, initNeo4j };
