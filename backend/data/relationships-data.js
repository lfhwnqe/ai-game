// 角色关系数据 - 基于docs/characters-design.md中的关系网络矩阵
// 1980年代深圳经济特区背景下的复杂人际关系网络

const relationshipsData = [
  // ==================== 政治关系 ====================
  
  // 李建国 ↔ 王守正：理念冲突，政治对立
  {
    fromCharacterId: 'gov_001',
    toCharacterId: 'gov_002',
    relationshipType: 'POLITICAL_OPPOSITION',
    strength: 25,
    trust: 15,
    respect: 35,
    attributes: {
      reason: '改革派与保守派理念冲突',
      history: '多次政策分歧',
      publicKnown: true,
      conflictLevel: 'high',
      cooperationPossibility: 'low'
    }
  },
  {
    fromCharacterId: 'gov_002',
    toCharacterId: 'gov_001',
    relationshipType: 'POLITICAL_OPPOSITION',
    strength: 25,
    trust: 15,
    respect: 35,
    attributes: {
      reason: '保守派与改革派理念冲突',
      history: '多次政策分歧',
      publicKnown: true,
      conflictLevel: 'high',
      cooperationPossibility: 'low'
    }
  },

  // 李建国 ↔ 陈明华：合作关系，政策执行
  {
    fromCharacterId: 'gov_001',
    toCharacterId: 'gov_003',
    relationshipType: 'COOPERATION',
    strength: 85,
    trust: 80,
    respect: 90,
    attributes: {
      reason: '政策执行合作伙伴',
      history: '多次成功合作项目',
      publicKnown: true,
      cooperationLevel: 'high',
      mutualBenefit: true
    }
  },
  {
    fromCharacterId: 'gov_003',
    toCharacterId: 'gov_001',
    relationshipType: 'COOPERATION',
    strength: 85,
    trust: 80,
    respect: 90,
    attributes: {
      reason: '政策执行合作伙伴',
      history: '多次成功合作项目',
      publicKnown: true,
      cooperationLevel: 'high',
      mutualBenefit: true
    }
  },

  // 张德胜 ↔ 林大富：利益共同体，土地开发
  {
    fromCharacterId: 'gov_004',
    toCharacterId: 'bus_002',
    relationshipType: 'BUSINESS_PARTNERSHIP',
    strength: 90,
    trust: 70,
    respect: 60,
    attributes: {
      reason: '土地开发利益共同体',
      history: '多个地产项目合作',
      publicKnown: false,
      riskLevel: 'high',
      profitSharing: true
    }
  },
  {
    fromCharacterId: 'bus_002',
    toCharacterId: 'gov_004',
    relationshipType: 'BUSINESS_PARTNERSHIP',
    strength: 90,
    trust: 70,
    respect: 60,
    attributes: {
      reason: '土地开发利益共同体',
      history: '多个地产项目合作',
      publicKnown: false,
      riskLevel: 'high',
      profitSharing: true
    }
  },

  // 刘志强 ↔ 何志伟：监管与被监管，微妙平衡
  {
    fromCharacterId: 'gov_005',
    toCharacterId: 'bus_011',
    relationshipType: 'REGULATORY_OVERSIGHT',
    strength: 45,
    trust: 40,
    respect: 50,
    attributes: {
      reason: '监管与被监管关系',
      history: '多次调查接触',
      publicKnown: true,
      tension: 'moderate',
      professionalDistance: true
    }
  },

  // ==================== 商业关系 ====================
  
  // 黄志华 ↔ 陈启宗：贸易合作伙伴
  {
    fromCharacterId: 'bus_001',
    toCharacterId: 'for_004',
    relationshipType: 'TRADE_PARTNER',
    strength: 95,
    trust: 90,
    respect: 85,
    attributes: {
      reason: '长期贸易合作伙伴',
      history: '多年成功合作',
      publicKnown: true,
      tradeVolume: 'high',
      mutualDependence: true
    }
  },
  {
    fromCharacterId: 'for_004',
    toCharacterId: 'bus_001',
    relationshipType: 'TRADE_PARTNER',
    strength: 95,
    trust: 90,
    respect: 85,
    attributes: {
      reason: '长期贸易合作伙伴',
      history: '多年成功合作',
      publicKnown: true,
      tradeVolume: 'high',
      mutualDependence: true
    }
  },

  // 林大富 ↔ 曾国藩：上下游合作关系
  {
    fromCharacterId: 'bus_002',
    toCharacterId: 'bus_008',
    relationshipType: 'SUPPLY_CHAIN',
    strength: 80,
    trust: 85,
    respect: 75,
    attributes: {
      reason: '建材供应合作关系',
      history: '稳定供应链合作',
      publicKnown: true,
      dependencyLevel: 'high',
      contractBased: true
    }
  },
  {
    fromCharacterId: 'bus_008',
    toCharacterId: 'bus_002',
    relationshipType: 'SUPPLY_CHAIN',
    strength: 80,
    trust: 85,
    respect: 75,
    attributes: {
      reason: '建材供应合作关系',
      history: '稳定供应链合作',
      publicKnown: true,
      dependencyLevel: 'high',
      contractBased: true
    }
  },

  // 吴建民 ↔ 田中一郎：技术引进合作
  {
    fromCharacterId: 'bus_003',
    toCharacterId: 'for_001',
    relationshipType: 'TECHNOLOGY_COOPERATION',
    strength: 85,
    trust: 80,
    respect: 90,
    attributes: {
      reason: '电子技术引进合作',
      history: '技术转让合作',
      publicKnown: true,
      technologyTransfer: true,
      learningRelationship: true
    }
  },
  {
    fromCharacterId: 'for_001',
    toCharacterId: 'bus_003',
    relationshipType: 'TECHNOLOGY_COOPERATION',
    strength: 85,
    trust: 80,
    respect: 90,
    attributes: {
      reason: '电子技术引进合作',
      history: '技术转让合作',
      publicKnown: true,
      technologyTransfer: true,
      learningRelationship: true
    }
  },

  // 潘志强 ↔ 施振荣：技术交流与竞争
  {
    fromCharacterId: 'bus_009',
    toCharacterId: 'for_006',
    relationshipType: 'COMPETITIVE_COOPERATION',
    strength: 70,
    trust: 65,
    respect: 85,
    attributes: {
      reason: '技术交流与市场竞争',
      history: '既合作又竞争',
      publicKnown: true,
      competitionLevel: 'moderate',
      knowledgeSharing: true
    }
  },
  {
    fromCharacterId: 'for_006',
    toCharacterId: 'bus_009',
    relationshipType: 'COMPETITIVE_COOPERATION',
    strength: 70,
    trust: 65,
    respect: 85,
    attributes: {
      reason: '技术交流与市场竞争',
      history: '既合作又竞争',
      publicKnown: true,
      competitionLevel: 'moderate',
      knowledgeSharing: true
    }
  },

  // ==================== 社会关系 ====================
  
  // 罗金山：信息中枢，与多方保持联系
  {
    fromCharacterId: 'bus_006',
    toCharacterId: 'gov_003',
    relationshipType: 'INFORMATION_NETWORK',
    strength: 75,
    trust: 70,
    respect: 65,
    attributes: {
      reason: '信息交换网络节点',
      history: '长期信息交流',
      publicKnown: false,
      informationValue: 'high',
      socialHub: true
    }
  },
  {
    fromCharacterId: 'bus_006',
    toCharacterId: 'bus_001',
    relationshipType: 'INFORMATION_NETWORK',
    strength: 80,
    trust: 75,
    respect: 70,
    attributes: {
      reason: '商业信息交换',
      history: '餐饮业信息来源',
      publicKnown: false,
      informationValue: 'high',
      socialHub: true
    }
  },

  // 苏文华：宣传资源，影响舆论导向
  {
    fromCharacterId: 'bus_012',
    toCharacterId: 'gov_010',
    relationshipType: 'MEDIA_COOPERATION',
    strength: 85,
    trust: 70,
    respect: 75,
    attributes: {
      reason: '宣传合作关系',
      history: '多次宣传项目合作',
      publicKnown: true,
      mediaInfluence: 'high',
      publicOpinion: true
    }
  },

  // 钱学森：智囊角色，为多方提供咨询
  {
    fromCharacterId: 'int_001',
    toCharacterId: 'gov_001',
    relationshipType: 'ADVISORY',
    strength: 90,
    trust: 95,
    respect: 98,
    attributes: {
      reason: '科学决策顾问',
      history: '长期咨询关系',
      publicKnown: true,
      expertiseLevel: 'highest',
      respectLevel: 'highest'
    }
  },
  {
    fromCharacterId: 'int_001',
    toCharacterId: 'for_001',
    relationshipType: 'ADVISORY',
    strength: 75,
    trust: 80,
    respect: 95,
    attributes: {
      reason: '技术发展咨询',
      history: '科技交流',
      publicKnown: true,
      expertiseLevel: 'highest',
      respectLevel: 'highest'
    }
  },

  // 张艺谋：文化符号，代表时代精神
  {
    fromCharacterId: 'soc_001',
    toCharacterId: 'gov_010',
    relationshipType: 'CULTURAL_COOPERATION',
    strength: 70,
    trust: 65,
    respect: 80,
    attributes: {
      reason: '文化宣传合作',
      history: '文艺项目合作',
      publicKnown: true,
      culturalInfluence: 'high',
      artisticValue: true
    }
  },

  // ==================== 更多商业关系 ====================

  // 孙立军（银行行长）与多个商人的金融关系
  {
    fromCharacterId: 'gov_007',
    toCharacterId: 'bus_001',
    relationshipType: 'FINANCIAL_COOPERATION',
    strength: 85,
    trust: 80,
    respect: 75,
    attributes: {
      reason: '贸易融资合作',
      history: '多笔贷款业务',
      publicKnown: true,
      loanAmount: 'high',
      creditRating: 'excellent'
    }
  },
  {
    fromCharacterId: 'gov_007',
    toCharacterId: 'bus_002',
    relationshipType: 'FINANCIAL_COOPERATION',
    strength: 90,
    trust: 75,
    respect: 70,
    attributes: {
      reason: '房地产开发贷款',
      history: '大额融资项目',
      publicKnown: true,
      loanAmount: 'very_high',
      riskLevel: 'moderate'
    }
  },

  // 马建设（建设局局长）与建材供应商的合作
  {
    fromCharacterId: 'gov_008',
    toCharacterId: 'bus_008',
    relationshipType: 'PROCUREMENT_COOPERATION',
    strength: 85,
    trust: 80,
    respect: 85,
    attributes: {
      reason: '基础设施建设合作',
      history: '多个工程项目',
      publicKnown: true,
      contractValue: 'high',
      qualityStandard: 'strict'
    }
  },

  // 胡国强（外事办主任）与外商的关系
  {
    fromCharacterId: 'gov_009',
    toCharacterId: 'for_001',
    relationshipType: 'DIPLOMATIC_COOPERATION',
    strength: 85,
    trust: 80,
    respect: 90,
    attributes: {
      reason: '中日技术交流促进',
      history: '多次外事接待',
      publicKnown: true,
      diplomaticLevel: 'high',
      culturalBridge: true
    }
  },
  {
    fromCharacterId: 'gov_009',
    toCharacterId: 'for_003',
    relationshipType: 'DIPLOMATIC_COOPERATION',
    strength: 90,
    trust: 85,
    respect: 95,
    attributes: {
      reason: '港深合作促进',
      history: '重要投资项目协调',
      publicKnown: true,
      diplomaticLevel: 'highest',
      economicImpact: 'major'
    }
  },

  // ==================== 竞争关系 ====================

  // 同行业竞争关系
  {
    fromCharacterId: 'bus_003',
    toCharacterId: 'bus_009',
    relationshipType: 'BUSINESS_COMPETITION',
    strength: 60,
    trust: 50,
    respect: 70,
    attributes: {
      reason: '电子科技行业竞争',
      history: '市场份额争夺',
      publicKnown: true,
      competitionLevel: 'moderate',
      cooperationPossibility: 'medium'
    }
  },
  {
    fromCharacterId: 'bus_012',
    toCharacterId: 'gov_010',
    relationshipType: 'MEDIA_COOPERATION',
    strength: 80,
    trust: 70,
    respect: 75,
    attributes: {
      reason: '宣传广告合作',
      history: '政府宣传项目',
      publicKnown: true,
      mediaInfluence: 'high',
      publicRelations: true
    }
  },

  // ==================== 师生/指导关系 ====================

  // 知识分子对年轻创业者的指导
  {
    fromCharacterId: 'int_001',
    toCharacterId: 'bus_009',
    relationshipType: 'MENTORSHIP',
    strength: 75,
    trust: 85,
    respect: 95,
    attributes: {
      reason: '科技创新指导',
      history: '技术发展咨询',
      publicKnown: true,
      guidanceLevel: 'high',
      knowledgeTransfer: true
    }
  },
  {
    fromCharacterId: 'int_003',
    toCharacterId: 'gov_001',
    relationshipType: 'ADVISORY',
    strength: 85,
    trust: 90,
    respect: 95,
    attributes: {
      reason: '经济决策数学分析',
      history: '政策制定咨询',
      publicKnown: true,
      expertiseLevel: 'highest',
      decisionSupport: true
    }
  },

  // ==================== 文化交流关系 ====================

  // 文化界人士之间的关系
  {
    fromCharacterId: 'soc_001',
    toCharacterId: 'soc_003',
    relationshipType: 'ARTISTIC_COLLABORATION',
    strength: 75,
    trust: 70,
    respect: 80,
    attributes: {
      reason: '影视艺术合作',
      history: '电影项目合作',
      publicKnown: true,
      artisticSynergy: 'high',
      creativePartnership: true
    }
  },
  {
    fromCharacterId: 'soc_002',
    toCharacterId: 'soc_001',
    relationshipType: 'ARTISTIC_COLLABORATION',
    strength: 65,
    trust: 60,
    respect: 75,
    attributes: {
      reason: '音乐与影像结合',
      history: '跨界艺术尝试',
      publicKnown: true,
      experimentalArt: true,
      culturalImpact: 'medium'
    }
  }
];

module.exports = { relationshipsData };
