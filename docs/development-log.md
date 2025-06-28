# 深圳1980 开发记录

## 项目进度跟踪

### 第一阶段：项目规划与设计 (预计2周)
- [x] 项目概念设计
- [x] 角色关系网络设计
- [ ] 技术架构详细设计
- [ ] UI/UX设计稿
- [ ] 数据库结构设计
- [ ] API接口设计

### 第二阶段：核心系统开发 (预计4周)
- [ ] 图数据库搭建
- [ ] 角色AI系统开发
- [ ] 回合制游戏引擎
- [ ] 基础前端框架
- [ ] WebSocket实时通信
- [ ] 用户认证系统

### 第三阶段：游戏内容开发 (预计3周)
- [ ] 50个角色数据录入
- [ ] 初始关系网络构建
- [ ] 游戏事件系统
- [ ] 商业系统实现
- [ ] 像素风格UI组件
- [ ] 音效和背景音乐

### 第四阶段：测试与优化 (预计2周)
- [ ] 单元测试
- [ ] 集成测试
- [ ] AI行为调优
- [ ] 性能优化
- [ ] 用户体验测试
- [ ] Bug修复

## AI Prompt 设计库

### 1. 角色行为决策 Prompt

```
# 角色：{character_name}
## 基本信息
- 姓名：{name}
- 年龄：{age}
- 职业：{profession}
- 性格：{personality}

## 背景故事
{background_story}

## 当前状态
- 资金：{money}
- 声望：{reputation}
- 健康：{health}
- 心情：{mood}

## 关系网络
{relationships_summary}

## 当前游戏环境
- 回合数：{round_number}
- 市场状况：{market_condition}
- 政策环境：{policy_environment}
- 重要事件：{recent_events}

## 可选行动
{available_actions}

## 决策要求
请根据你的角色设定、当前状况和目标，选择最符合角色逻辑的行动。

输出格式：
{
  "action_id": "行动ID",
  "reasoning": "决策理由（体现角色性格和动机）",
  "confidence": "信心度（1-10）",
  "risk_assessment": "风险评估",
  "expected_relationships_impact": "对人际关系的预期影响"
}
```

### 2. 事件结果生成 Prompt

```
# 事件结果生成

## 事件描述
{event_description}

## 参与角色
{involved_characters}

## 环境因素
- 时间：1980年深圳
- 政策背景：{policy_context}
- 经济环境：{economic_context}

## 生成要求
请生成一个符合1980年深圳历史背景的事件结果，考虑：
1. 历史真实性
2. 角色性格一致性
3. 合理的因果关系
4. 对后续剧情的影响

输出格式：
{
  "result_description": "事件结果描述",
  "character_impacts": {
    "character_id": {
      "reputation_change": "声望变化",
      "money_change": "资金变化",
      "mood_change": "心情变化",
      "relationship_changes": "关系变化"
    }
  },
  "market_impact": "对市场的影响",
  "follow_up_events": "可能触发的后续事件"
}
```

### 3. 对话生成 Prompt

```
# 角色对话生成

## 对话场景
- 地点：{location}
- 时间：{time}
- 情境：{context}

## 对话角色
### 角色A：{character_a_name}
- 性格：{character_a_personality}
- 当前心情：{character_a_mood}
- 对话目的：{character_a_goal}

### 角色B：{character_b_name}
- 性格：{character_b_personality}
- 当前心情：{character_b_mood}
- 对话目的：{character_b_goal}

## 关系背景
{relationship_history}

## 对话要求
生成符合1980年深圳语言风格的对话，体现：
1. 角色性格差异
2. 时代特色用词
3. 地方方言特色
4. 商业谈判技巧

输出格式：
{
  "dialogue": [
    {"speaker": "角色名", "content": "对话内容", "emotion": "情感状态"},
    ...
  ],
  "outcome": "对话结果",
  "relationship_change": "关系变化"
}
```

### 4. 市场事件生成 Prompt

```
# 市场事件生成

## 当前市场状态
- 经济指标：{economic_indicators}
- 政策环境：{policy_environment}
- 国际形势：{international_situation}

## 历史背景
1980年深圳经济特区刚刚成立，改革开放政策初步实施。

## 事件类型
{event_type}

## 生成要求
创造一个符合历史背景的市场事件，包括：
1. 事件起因
2. 发展过程
3. 对不同行业的影响
4. 对角色的机遇和挑战

输出格式：
{
  "event_title": "事件标题",
  "description": "详细描述",
  "industry_impacts": {
    "行业名": "影响描述"
  },
  "opportunities": ["机遇列表"],
  "risks": ["风险列表"],
  "duration": "事件持续时间"
}
```

## 开发日志

### 2024-01-XX
- 完成项目概念设计
- 设计50个角色的基本信息和关系网络
- 确定技术架构方案

### 待办事项
- [ ] 完善角色背景故事
- [ ] 设计更多AI Prompt模板
- [ ] 创建数据库初始化脚本
- [ ] 开发角色关系可视化工具

## 技术难点记录

### 1. AI决策一致性
**问题**：如何确保AI角色的行为在长期游戏中保持一致性？
**解决方案**：
- 为每个角色建立详细的性格档案
- 使用记忆系统记录角色的历史行为
- 定期校验AI输出与角色设定的一致性

### 2. 关系网络复杂度
**问题**：50个角色的关系网络过于复杂，难以管理
**解决方案**：
- 使用图数据库Neo4j进行关系存储
- 实现关系强度的动态计算
- 开发关系网络可视化工具

### 3. 性能优化
**问题**：AI决策计算量大，可能影响游戏流畅度
**解决方案**：
- 实现异步AI决策处理
- 使用缓存机制减少重复计算
- 考虑使用本地LLM减少API调用延迟

## 测试计划

### 单元测试
- [ ] 角色AI决策逻辑测试
- [ ] 关系网络更新测试
- [ ] 游戏状态管理测试

### 集成测试
- [ ] 前后端数据同步测试
- [ ] WebSocket通信测试
- [ ] 数据库操作测试

### 用户体验测试
- [ ] 游戏流程完整性测试
- [ ] UI交互响应测试
- [ ] AI行为合理性测试
