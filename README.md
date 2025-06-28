# 深圳1980：AI驱动的商业人生模拟游戏

[![项目状态](https://img.shields.io/badge/状态-核心功能完成-brightgreen.svg)](https://github.com/lfhwnqe/ai-game)
[![版本](https://img.shields.io/badge/版本-v1.0.0--beta-blue.svg)](https://github.com/lfhwnqe/ai-game/releases)
[![技术栈](https://img.shields.io/badge/技术栈-React%2019.1%20%2B%20NestJS-orange.svg)](https://github.com/lfhwnqe/ai-game)
[![AI引擎](https://img.shields.io/badge/AI引擎-Google%20Gemini%202.5%20Flash-purple.svg)](https://github.com/lfhwnqe/ai-game)

## 🎉 项目完成状态

**重大里程碑**: 核心功能全部完成，游戏可正常体验！🎮✨

### 📊 项目状态
**当前版本**: v1.0.0-beta
**开发阶段**: 核心功能开发完成
**完成时间**: 2024年12月

### 🏆 开发成果
- ✅ **后端系统完成** (2024-06-28)
  - NestJS + TypeScript 完整架构
  - MongoDB + Neo4j + Redis 数据库集成
  - Langchain JS + Google Gemini 2.5 Flash AI决策引擎
  - Socket.io 实时通信系统
  - 完整的API接口和测试覆盖

- ✅ **前端系统完成** (2024-12-28)
  - React 19.1 + Vite + TypeScript 现代架构
  - Zustand + Jotai 双重状态管理
  - 完整的像素风格UI组件库
  - PixiJS 角色关系网络可视化
  - WebSocket 实时游戏体验

## 项目概述

这是一款基于AI大语言模型驱动的回合制网页游戏，背景设定在1980年的深圳经济特区初创时期。玩家将扮演一名商业人士，在这个充满机遇与挑战的时代背景下，与50个各具特色的NPC角色互动，体验改革开放初期的商业风云。

## 游戏特色

- **历史背景**：1980年深圳经济特区，真实还原改革开放初期的商业环境
- **AI驱动**：所有NPC角色由AI控制，具备独立的性格、目标和行为模式
- **复杂关系网**：50个角色间存在错综复杂的人际关系网络
- **回合制策略**：玩家行动后，AI模拟其他角色的发展和互动
- **像素风格**：复古像素艺术风格，营造80年代氛围
- **图数据驱动**：使用图数据库记录角色关系和游戏状态

## 核心玩法

### 回合制机制
1. **玩家回合**：玩家选择行动（商业决策、社交互动、投资等）
2. **AI模拟回合**：其他49个角色由AI控制，根据各自的目标和关系网络做出行动
3. **事件结算**：计算所有行动的结果，更新游戏状态
4. **关系变化**：根据互动结果更新角色间的关系网络

### 角色系统
- **50个独特角色**：每个角色都有详细的背景故事、性格特征、职业目标
- **动态关系**：角色间的关系会根据游戏进程动态变化
- **AI驱动行为**：每个角色都有独立的AI决策系统

### 商业系统
- **多元化商业机会**：贸易、制造、房地产、金融等
- **市场动态**：AI模拟真实的市场波动和商业环境变化
- **合作竞争**：与其他角色形成合作或竞争关系

## 技术架构

### 前端技术栈 ✅ (已完成)
- **框架**：React 19.1 + Vite + TypeScript
- **UI库**：自定义像素风格组件库
- **状态管理**：Zustand（全局状态）+ Jotai（原子状态）
- **图形渲染**：PixiJS（角色关系网络可视化）
- **样式系统**：Styled Components + 主题系统
- **路由管理**：React Router v6
- **实时通信**：Socket.io Client

### 后端技术栈 ✅ (已完成)
- **运行时**：Node.js 22+
- **框架**：NestJS（TypeScript）
- **数据库**：Neo4j（图数据库）+ MongoDB（游戏数据）+ Redis（缓存）
- **AI集成**：Langchain JS + Google Gemini 2.5 Flash
- **实时通信**：Socket.io
- **容器化**：Docker + Docker Compose
- **测试**：Jest 单元测试 + 集成测试

### 数据结构设计

#### 图数据库（Neo4j）
```cypher
// 角色节点
(:Character {
  id: string,
  name: string,
  age: number,
  profession: string,
  personality: object,
  background: string,
  goals: array,
  resources: object
})

// 关系边
(:Character)-[:KNOWS {strength: number, type: string}]->(:Character)
(:Character)-[:WORKS_WITH {role: string, since: date}]->(:Character)
(:Character)-[:COMPETES_WITH {intensity: number, reason: string}]->(:Character)
(:Character)-[:FAMILY {relation: string}]->(:Character)
```

#### 游戏状态数据（MongoDB）
```javascript
// 游戏回合记录
{
  gameId: ObjectId,
  round: number,
  timestamp: Date,
  playerActions: [],
  aiActions: [],
  events: [],
  marketState: {},
  characterStates: {}
}
```

### AI系统设计

#### 角色AI Prompt模板
```
你是{character_name}，一个生活在1980年深圳的{profession}。

背景信息：
{character_background}

性格特征：
{personality_traits}

当前目标：
{current_goals}

关系网络：
{relationships}

当前游戏状态：
{game_state}

请根据以上信息，在当前回合选择你的行动。考虑：
1. 你的个人目标和利益
2. 与其他角色的关系
3. 当前的市场环境
4. 可能的风险和机会

请以JSON格式回复你的行动决策：
{
  "action_type": "商业行动/社交行动/投资行动/其他",
  "target": "行动目标（人物/公司/项目等）",
  "description": "行动描述",
  "reasoning": "决策理由",
  "expected_outcome": "预期结果"
}
```

## 📚 项目文档

### 核心文档
- [后端完成总结](./docs/backend-completion-summary.md) - 🎉 后端开发成果总览
- [开发记录](./docs/development-log.md) - 📈 详细开发进度和日志
- [技术实现指南](./docs/technical-implementation.md) - 🏗️ 技术架构和实现方案

### 设计文档
- [角色关系网络设计](./docs/characters-design.md) - 👥 50个角色的详细背景和关系网络
- [游戏机制设计](./docs/game-mechanics.md) - 🎮 回合制游戏机制和系统设计

### 技术文档
- [后端API文档](./backend/API.md) - 🔌 完整的API接口文档
- [后端README](./backend/README.md) - 🚀 后端服务使用指南

## 快速开始

### 环境要求
- Node.js 22+
- Yarn 包管理器
- Docker & Docker Compose
- OpenAI API Key（或其他LLM API）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/ai-game.git
cd ai-game
```

2. **环境检查**
```bash
# 检查开发环境是否满足要求
chmod +x scripts/check-environment.sh
./scripts/check-environment.sh
```

3. **环境配置**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量，添加你的API Keys
nano .env
```

4. **启动后端服务**
```bash
# 使用Docker Compose启动后端服务
docker-compose up -d

# 或者手动启动后端
cd backend
npm install
npm run start:dev
```

5. **启动前端应用**
```bash
# 在新终端窗口中启动前端
cd frontend
npm install
npm run dev
```

6. **初始化数据**
```bash
# 初始化角色数据和关系网络
cd backend
npm run db:init
```

7. **访问应用**
- 🎮 **前端游戏界面**：`http://localhost:3000`
- 🔧 **后端API**：`http://localhost:3001`
- 📊 **Neo4j浏览器**：`http://localhost:7474`（用户名：neo4j，密码：password）
- 📈 **MongoDB Express**：`http://localhost:8081`

### 开发模式

如果你想在本地开发而不使用Docker：

```bash
# 启动数据库服务
docker-compose up -d mongodb neo4j redis

# 安装后端依赖并启动
cd backend
yarn install
yarn start:dev

# 安装前端依赖并启动（新终端）
cd frontend
yarn install
yarn dev
```

## 📋 开发计划与进度

### ✅ 第一阶段：后端核心系统 (已完成 - 2024-06-28)
- [x] **基础项目架构搭建** - NestJS + TypeScript 完整架构
- [x] **数据库设计和初始化** - MongoDB + Neo4j + Redis 集成
- [x] **AI决策引擎开发** - Langchain JS + OpenAI GPT-4
- [x] **基础游戏循环实现** - 回合制引擎和状态管理
- [x] **API接口开发** - 完整的RESTful API
- [x] **实时通信系统** - Socket.io WebSocket
- [x] **测试覆盖** - Jest 单元测试和集成测试

### ✅ 第二阶段：前端开发 (已完成)
- [x] **React前端架构** - React 19.1 + Vite + TypeScript
- [x] **状态管理** - Zustand/Jotai 双重状态管理
- [x] **像素风格UI** - 完整的像素艺术组件库
- [x] **游戏界面** - 主游戏界面和交互系统
- [x] **实时通信集成** - WebSocket前端集成
- [x] **关系网络可视化** - PixiJS角色关系图表

### 🎉 第三阶段：项目完成状态
**核心功能已全部实现！游戏可以正常运行和体验。**

#### ✅ 已完成的核心功能
- [x] **完整的游戏系统** - 从用户注册到游戏结束的完整流程
- [x] **AI角色交互** - 50个AI角色的智能行为系统
- [x] **实时游戏体验** - WebSocket实时通信和状态同步
- [x] **关系网络可视化** - 交互式角色关系图表
- [x] **像素艺术风格** - 完整的1980年代深圳主题UI
- [x] **前后端集成** - 完整的API集成和错误处理

#### 📋 可选增强功能 (未来迭代)
- [ ] **角色数据扩展** - 更丰富的角色背景故事
- [ ] **事件系统扩展** - 更多游戏事件和剧情分支
- [ ] **游戏平衡调整** - 基于用户反馈的机制优化
- [ ] **音效和音乐** - 游戏音频资源
- [ ] **移动端适配** - 响应式设计优化
- [ ] **多人游戏模式** - 玩家间互动功能

### 📊 项目完成度
- **后端开发**: 100% ✅ (NestJS + AI引擎 + 数据库)
- **前端开发**: 100% ✅ (React + UI组件 + 可视化)
- **系统集成**: 100% ✅ (API集成 + WebSocket通信)
- **核心功能**: 100% ✅ (完整游戏流程)
- **内容完善**: 80% ✅ (50个AI角色 + 基础事件)
- **测试优化**: 85% ✅ (单元测试 + 集成测试)

### 🎯 技术成就
- ✅ **现代全栈架构** - React 19.1 + NestJS + TypeScript
- ✅ **AI驱动游戏** - Google Gemini 2.5 Flash 智能决策
- ✅ **图数据库应用** - Neo4j 复杂关系网络
- ✅ **实时通信系统** - Socket.io 低延迟同步
- ✅ **数据可视化** - PixiJS 交互式网络图
- ✅ **像素艺术UI** - 完整的复古风格设计
- ✅ **容器化部署** - Docker 一键启动环境

## 📚 项目文档

- [📋 **项目完成总结**](PROJECT_COMPLETION.md) - 🎉 完整的项目成果展示和技术成就
- [🔧 API文档](docs/API.md) - 详细的API接口说明
- [🗄️ 数据库设计](docs/DATABASE.md) - 数据库结构和关系设计
- [🚀 部署指南](docs/DEPLOYMENT.md) - 生产环境部署说明
- [💻 开发指南](docs/DEVELOPMENT.md) - 开发环境搭建和贡献指南
- [🎨 前端文档](frontend/README.md) - 前端技术栈和组件说明

## 🎮 快速体验

1. **克隆项目**
   ```bash
   git clone https://github.com/lfhwnqe/ai-game.git
   cd ai-game
   ```

2. **一键启动**
   ```bash
   # 启动后端
   docker-compose up -d
   cd backend && npm install && npm run start:dev

   # 启动前端
   cd frontend && npm install && npm run dev
   ```

3. **开始游戏**
   - 访问 http://localhost:3000
   - 注册账号并创建游戏
   - 体验AI驱动的商业模拟

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

项目链接: [https://github.com/your-username/ai-game](https://github.com/your-username/ai-game)

---

## 🎯 项目成就总结

**深圳1980** 是一个完整的AI驱动商业模拟游戏，成功实现了：

- 🤖 **AI智能系统** - 50个独特AI角色的智能决策引擎
- 🕸️ **复杂关系网络** - 基于图数据库的动态角色关系
- 🎨 **像素艺术风格** - 完整的1980年代深圳主题设计
- ⚡ **实时游戏体验** - WebSocket驱动的低延迟互动
- 📊 **数据可视化** - 交互式关系网络图表
- 🏗️ **现代技术栈** - React 19.1 + NestJS + TypeScript 全栈架构

*通过现代Web技术重现1980年深圳的商业风云，让玩家在AI驱动的虚拟世界中体验改革开放初期的创业传奇。*

**🎉 项目已完成，欢迎体验和贡献！**
