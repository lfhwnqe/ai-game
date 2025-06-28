# 技术实现指南

## 项目结构

```
ai-game/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/      # UI组件
│   │   ├── pages/          # 页面组件
│   │   ├── stores/         # Zustand状态管理
│   │   ├── atoms/          # Jotai原子状态
│   │   ├── utils/          # 工具函数
│   │   ├── assets/         # 静态资源
│   │   └── styles/         # 样式文件
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── backend/                 # NestJS后端
│   ├── src/
│   │   ├── modules/        # 功能模块
│   │   │   ├── game/       # 游戏模块
│   │   │   ├── characters/ # 角色模块
│   │   │   ├── ai/         # AI模块
│   │   │   └── auth/       # 认证模块
│   │   ├── common/         # 公共模块
│   │   │   ├── decorators/ # 装饰器
│   │   │   ├── filters/    # 异常过滤器
│   │   │   ├── guards/     # 守卫
│   │   │   └── pipes/      # 管道
│   │   ├── config/         # 配置文件
│   │   └── main.ts         # 应用入口
│   ├── test/               # 测试文件
│   ├── Dockerfile
│   └── package.json
├── database/               # 数据库相关
│   ├── neo4j/             # 图数据库脚本
│   ├── mongodb/           # 文档数据库脚本
│   └── migrations/        # 数据迁移脚本
├── ai/                     # AI相关
│   ├── prompts/           # Prompt模板
│   ├── agents/            # AI代理配置
│   └── workflows/         # AI工作流
├── docs/                  # 项目文档
├── docker-compose.yml     # Docker编排
└── .env.example           # 环境变量模板
```

## 技术架构

### 前端技术栈
- **框架**：React + Vite
- **UI库**：自定义像素风格组件
- **状态管理**：Zustand（全局状态）+ Jotai（原子状态）
- **图形渲染**：Canvas API + PixiJS（像素艺术）
- **实时通信**：WebSocket
- **类型检查**：TypeScript

### 后端技术栈
- **运行时**：Node.js
- **框架**：NestJS（TypeScript）
- **数据库**：Neo4j（图数据库）+ MongoDB（游戏数据）
- **AI集成**：Langchain JS / Mastra JS
- **实时通信**：Socket.io
- **容器化**：Docker + Docker Compose

## 环境搭建

### 1. 开发环境要求
- Node.js 22+
- Yarn 包管理器
- Docker & Docker Compose
- Neo4j Desktop
- MongoDB Compass

### 2. 依赖安装

#### 前端依赖
```bash
cd frontend
yarn add react@19.1 react-dom@19.1
yarn add zustand jotai
yarn add @types/react @types/react-dom
yarn add vite @vitejs/plugin-react
yarn add pixi.js @pixi/react
yarn add socket.io-client
yarn add axios
yarn add styled-components
yarn add framer-motion
yarn add typescript
```

#### 后端依赖
```bash
cd backend
yarn add @nestjs/core @nestjs/common @nestjs/platform-express
yarn add @nestjs/websockets @nestjs/platform-socket.io
yarn add @nestjs/mongoose mongoose
yarn add neo4j-driver
yarn add langchain @langchain/openai @langchain/core
# 或者使用 Mastra
# yarn add mastra
yarn add @nestjs/jwt @nestjs/passport passport passport-jwt
yarn add bcryptjs
yarn add @nestjs/config
yarn add class-validator class-transformer
yarn add typescript @types/node
yarn add -D @nestjs/cli
yarn add -D jest @nestjs/testing
```

### 3. 数据库配置

#### Neo4j 图数据库
```cypher
// 创建约束
CREATE CONSTRAINT character_id IF NOT EXISTS FOR (c:Character) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT game_id IF NOT EXISTS FOR (g:Game) REQUIRE g.id IS UNIQUE;

// 创建索引
CREATE INDEX character_name IF NOT EXISTS FOR (c:Character) ON (c.name);
CREATE INDEX character_profession IF NOT EXISTS FOR (c:Character) ON (c.profession);
```

#### MongoDB 文档数据库
```javascript
// 游戏状态集合
db.createCollection("gameStates", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["gameId", "round", "timestamp"],
      properties: {
        gameId: { bsonType: "objectId" },
        round: { bsonType: "int", minimum: 1 },
        timestamp: { bsonType: "date" },
        playerActions: { bsonType: "array" },
        aiActions: { bsonType: "array" },
        events: { bsonType: "array" },
        marketState: { bsonType: "object" }
      }
    }
  }
});

// 用户集合
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "passwordHash"],
      properties: {
        username: { bsonType: "string", minLength: 3, maxLength: 20 },
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        passwordHash: { bsonType: "string" }
      }
    }
  }
});
```

## 核心模块实现

### 1. AI决策引擎（使用Langchain JS）

```typescript
// backend/src/modules/ai/services/decision-engine.service.ts
import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class DecisionEngineService {
  private llm: ChatOpenAI;
  private decisionPrompt: PromptTemplate;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      maxTokens: 500,
    });

    this.decisionPrompt = PromptTemplate.fromTemplate(`
你是{characterName}，一个生活在1980年深圳的{profession}。

角色信息：
- 姓名：{characterName}
- 职业：{profession}
- 性格：{personality}
- 当前资金：{money}
- 当前声望：{reputation}

游戏状态：
- 回合数：{round}
- 市场状况：{marketCondition}
- 最近事件：{recentEvents}

可选行动：
{availableActions}

请选择最符合角色特点的行动，并以JSON格式回复：
{{
  "action_id": "行动ID",
  "reasoning": "决策理由",
  "confidence": "信心度（1-10）"
}}
    `);
  }

  async makeDecision(characterId: string, gameState: any, availableActions: any[]): Promise<any> {
    try {
      const character = await this.getCharacter(characterId);

      const chain = this.decisionPrompt
        .pipe(this.llm)
        .pipe(new StringOutputParser());

      const response = await chain.invoke({
        characterName: character.name,
        profession: character.profession,
        personality: character.personality,
        money: character.money,
        reputation: character.reputation,
        round: gameState.round,
        marketCondition: gameState.marketCondition,
        recentEvents: gameState.recentEvents.join(', '),
        availableActions: availableActions.map(action =>
          `- ${action.id}: ${action.description}`
        ).join('\n')
      });

      return this.parseDecisionResponse(response);
    } catch (error) {
      console.error(`AI决策失败 - 角色${characterId}:`, error);
      return this.getDefaultAction(characterId, availableActions);
    }
  }

  private async getCharacter(characterId: string) {
    // 从数据库获取角色信息
    // 这里应该调用角色服务
    return {};
  }

  private parseDecisionResponse(response: string) {
    try {
      return JSON.parse(response);
    } catch (error) {
      // 如果JSON解析失败，使用正则表达式提取关键信息
      const actionMatch = response.match(/action_id[\"']?\s*:\s*[\"']?([^\"',\s]+)/i);
      const reasoningMatch = response.match(/reasoning[\"']?\s*:\s*[\"']?([^\"']+)/i);

      return {
        action_id: actionMatch ? actionMatch[1] : 'default',
        reasoning: reasoningMatch ? reasoningMatch[1] : '默认决策',
        confidence: 5
      };
    }
  }

  private getDefaultAction(characterId: string, availableActions: any[]) {
    // 返回默认行动
    return availableActions[0] || { action_id: 'wait', reasoning: '等待' };
  }
}
```

### 1.1 AI决策引擎（使用Mastra JS替代方案）

```typescript
// backend/src/modules/ai/services/mastra-decision-engine.service.ts
import { Injectable } from '@nestjs/common';
import { Agent, openai } from 'mastra';

@Injectable()
export class MastraDecisionEngineService {
  private agents: Map<string, Agent> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    // 为每个角色创建专门的AI代理
    const characterTypes = ['government', 'businessman', 'foreigner', 'intellectual', 'social'];

    characterTypes.forEach(type => {
      const agent = new Agent({
        name: `${type}Agent`,
        instructions: this.getInstructionsForType(type),
        model: openai('gpt-4o-mini'),
        memory: true,
      });

      this.agents.set(type, agent);
    });
  }

  async makeDecision(characterId: string, character: any, gameState: any, availableActions: any[]): Promise<any> {
    try {
      const agent = this.agents.get(character.type) || this.agents.get('businessman');

      const context = {
        character,
        gameState,
        availableActions: availableActions.map(action => ({
          id: action.id,
          description: action.description,
          cost: action.cost,
          risk: action.risk
        }))
      };

      const response = await agent.generate(
        `作为${character.name}，根据当前情况选择最佳行动。`,
        { context }
      );

      return this.parseDecisionResponse(response);
    } catch (error) {
      console.error(`Mastra AI决策失败 - 角色${characterId}:`, error);
      return this.getDefaultAction(characterId, availableActions);
    }
  }

  private getInstructionsForType(type: string): string {
    const instructions = {
      government: "你是1980年深圳的政府官员，关注政策执行、经济发展和社会稳定。",
      businessman: "你是1980年深圳的商人，追求利润最大化，善于抓住商机。",
      foreigner: "你是来深圳投资的外商，带来先进技术和管理经验。",
      intellectual: "你是知识分子，关注技术创新和社会进步。",
      social: "你是社会各界人士，关注文化发展和民生改善。"
    };

    return instructions[type] || instructions.businessman;
  }
}
```

### 2. 关系网络管理

```typescript
// backend/src/modules/characters/services/relationship.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as neo4j from 'neo4j-driver';

@Injectable()
export class RelationshipService {
  private driver: neo4j.Driver;

  constructor(private configService: ConfigService) {
    this.driver = neo4j.driver(
      this.configService.get('NEO4J_URI'),
      neo4j.auth.basic(
        this.configService.get('NEO4J_USERNAME'),
        this.configService.get('NEO4J_PASSWORD')
      )
    );
  }

  async updateRelationship(
    fromId: string,
    toId: string,
    relationshipType: string,
    strengthChange: number,
    reason: string
  ): Promise<number> {
    const session = this.driver.session();

    try {
      const result = await session.run(`
        MATCH (a:Character {id: $fromId}), (b:Character {id: $toId})
        MERGE (a)-[r:${relationshipType}]->(b)
        ON CREATE SET r.strength = $strengthChange, r.history = [$reason], r.lastUpdate = datetime()
        ON MATCH SET r.strength = r.strength + $strengthChange,
                     r.history = r.history + [$reason],
                     r.lastUpdate = datetime()
        RETURN r.strength as newStrength
      `, { fromId, toId, strengthChange, reason });

      return result.records[0]?.get('newStrength')?.toNumber() || 0;
    } finally {
      await session.close();
    }
  }

  async getRelationshipNetwork(characterId: string, depth: number = 2): Promise<any> {
    const session = this.driver.session();

    try {
      const result = await session.run(`
        MATCH path = (c:Character {id: $characterId})-[*1..${depth}]-(connected:Character)
        RETURN path
      `, { characterId });

      return this.processNetworkData(result.records);
    } finally {
      await session.close();
    }
  }

  processNetworkData(records) {
    const nodes = new Map();
    const edges = [];

    records.forEach(record => {
      const path = record.get('path');
      const segments = path.segments;

      segments.forEach(segment => {
        const startNode = segment.start;
        const endNode = segment.end;
        const relationship = segment.relationship;

        // 添加节点
        if (!nodes.has(startNode.properties.id)) {
          nodes.set(startNode.properties.id, startNode.properties);
        }
        if (!nodes.has(endNode.properties.id)) {
          nodes.set(endNode.properties.id, endNode.properties);
        }

        // 添加边
        edges.push({
          from: startNode.properties.id,
          to: endNode.properties.id,
          type: relationship.type,
          strength: relationship.properties.strength || 0
        });
      });
    });

    return {
      nodes: Array.from(nodes.values()),
      edges: edges
    };
  }
}
```

### 3. 游戏状态管理

```javascript
// backend/services/GameStateService.js
class GameStateService {
  constructor(mongoClient, neo4jDriver) {
    this.mongo = mongoClient;
    this.neo4j = neo4jDriver;
  }

  async processRound(gameId, playerAction) {
    // 1. 保存玩家行动
    await this.savePlayerAction(gameId, playerAction);

    // 2. 生成AI角色行动
    const aiActions = await this.generateAIActions(gameId);

    // 3. 计算所有行动结果
    const results = await this.calculateActionResults(gameId, [playerAction, ...aiActions]);

    // 4. 更新游戏状态
    const newGameState = await this.updateGameState(gameId, results);

    // 5. 更新关系网络
    await this.updateRelationships(results.relationshipChanges);

    // 6. 生成新事件
    const newEvents = await this.generateEvents(newGameState);

    return {
      gameState: newGameState,
      actionResults: results,
      newEvents: newEvents
    };
  }

  async generateAIActions(gameId) {
    const gameState = await this.getGameState(gameId);
    const characters = await this.getAllCharacters();
    const aiActions = [];

    for (const character of characters) {
      if (character.id !== gameState.playerId) {
        const availableActions = await this.getAvailableActions(character.id, gameState);
        const decision = await this.decisionEngine.makeDecision(
          character.id, 
          gameState, 
          availableActions
        );
        
        aiActions.push({
          characterId: character.id,
          action: decision,
          timestamp: new Date()
        });
      }
    }

    return aiActions;
  }
}
```

### 4. 前端状态管理

#### 4.1 Zustand 全局状态管理

```typescript
// frontend/src/stores/gameStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface GameState {
  gameId: string | null;
  currentRound: number;
  playerCharacter: any | null;
  gameState: any | null;
  availableActions: any[];
  isProcessing: boolean;
  lastResults: any | null;

  // Actions
  setGameId: (gameId: string) => void;
  setGameState: (gameState: any) => void;
  setAvailableActions: (actions: any[]) => void;
  setProcessing: (isProcessing: boolean) => void;
  incrementRound: () => void;
  submitPlayerAction: (action: any) => Promise<any>;
  reset: () => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        gameId: null,
        currentRound: 1,
        playerCharacter: null,
        gameState: null,
        availableActions: [],
        isProcessing: false,
        lastResults: null,

        setGameId: (gameId) => set({ gameId }),
        setGameState: (gameState) => set({ gameState }),
        setAvailableActions: (availableActions) => set({ availableActions }),
        setProcessing: (isProcessing) => set({ isProcessing }),
        incrementRound: () => set((state) => ({ currentRound: state.currentRound + 1 })),

        submitPlayerAction: async (action) => {
          const { gameId } = get();
          set({ isProcessing: true });

          try {
            const response = await fetch(`/api/games/${gameId}/actions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action)
            });

            const result = await response.json();
            set({
              lastResults: result,
              isProcessing: false,
              currentRound: get().currentRound + 1
            });

            return result;
          } catch (error) {
            set({ isProcessing: false });
            throw error;
          }
        },

        reset: () => set({
          gameId: null,
          currentRound: 1,
          playerCharacter: null,
          gameState: null,
          availableActions: [],
          isProcessing: false,
          lastResults: null
        })
      }),
      {
        name: 'game-storage',
        partialize: (state) => ({
          gameId: state.gameId,
          currentRound: state.currentRound,
          playerCharacter: state.playerCharacter
        })
      }
    ),
    { name: 'game-store' }
  )
);
```

#### 4.2 Jotai 原子状态管理

```typescript
// frontend/src/atoms/gameAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 基础原子
export const gameIdAtom = atomWithStorage<string | null>('gameId', null);
export const currentRoundAtom = atomWithStorage<number>('currentRound', 1);
export const playerCharacterAtom = atom<any | null>(null);
export const gameStateAtom = atom<any | null>(null);
export const availableActionsAtom = atom<any[]>([]);
export const isProcessingAtom = atom<boolean>(false);
export const lastResultsAtom = atom<any | null>(null);

// 派生原子
export const canSubmitActionAtom = atom((get) => {
  const isProcessing = get(isProcessingAtom);
  const availableActions = get(availableActionsAtom);
  return !isProcessing && availableActions.length > 0;
});

export const gameProgressAtom = atom((get) => {
  const currentRound = get(currentRoundAtom);
  const maxRounds = 200; // 游戏总回合数
  return (currentRound / maxRounds) * 100;
});

// 角色相关原子
export const characterStatsAtom = atom((get) => {
  const character = get(playerCharacterAtom);
  if (!character) return null;

  return {
    money: character.money || 0,
    reputation: character.reputation || 0,
    health: character.health || 100,
    relationships: character.relationships || []
  };
});

// 市场状态原子
export const marketConditionAtom = atom((get) => {
  const gameState = get(gameStateAtom);
  return gameState?.marketCondition || 'stable';
});

// 事件原子
export const recentEventsAtom = atom((get) => {
  const gameState = get(gameStateAtom);
  return gameState?.recentEvents || [];
});
```

#### 4.3 组件中使用状态

```typescript
// frontend/src/components/GameBoard.tsx
import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { useAtom, useAtomValue } from 'jotai';
import {
  canSubmitActionAtom,
  gameProgressAtom,
  characterStatsAtom
} from '../atoms/gameAtoms';

export const GameBoard: React.FC = () => {
  // Zustand 全局状态
  const {
    currentRound,
    availableActions,
    isProcessing,
    submitPlayerAction
  } = useGameStore();

  // Jotai 原子状态
  const canSubmitAction = useAtomValue(canSubmitActionAtom);
  const gameProgress = useAtomValue(gameProgressAtom);
  const characterStats = useAtomValue(characterStatsAtom);

  const handleActionSubmit = async (actionId: string) => {
    try {
      await submitPlayerAction({ actionId, timestamp: Date.now() });
    } catch (error) {
      console.error('提交行动失败:', error);
    }
  };

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>回合 {currentRound}</h2>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${gameProgress}%` }}
          />
        </div>
      </div>

      {characterStats && (
        <div className="character-stats">
          <div>资金: ¥{characterStats.money.toLocaleString()}</div>
          <div>声望: {characterStats.reputation}</div>
          <div>健康: {characterStats.health}%</div>
        </div>
      )}

      <div className="available-actions">
        {availableActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionSubmit(action.id)}
            disabled={!canSubmitAction}
            className="action-button"
          >
            {action.name}
          </button>
        ))}
      </div>

      {isProcessing && (
        <div className="processing-overlay">
          <div>AI正在模拟其他角色行动...</div>
        </div>
      )}
    </div>
  );
};
```

## 部署配置

### Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:3001
      - VITE_WS_URL=ws://localhost:3001
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/aigame
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USERNAME=neo4j
      - NEO4J_PASSWORD=password
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
      - neo4j
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run start:dev

  mongodb:
    image: mongo:6
    container_name: aigame-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=aigame

  neo4j:
    image: neo4j:5
    container_name: aigame-neo4j
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/password
      - NEO4J_PLUGINS=["apoc"]
      - NEO4J_dbms_security_procedures_unrestricted=apoc.*
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs

  redis:
    image: redis:7-alpine
    container_name: aigame-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  neo4j_data:
  neo4j_logs:
  redis_data:
```

### 前端 Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# 安装 yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 开发环境
EXPOSE 3000
CMD ["yarn", "dev", "--host", "0.0.0.0"]
```

### 后端 Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# 安装 yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 开发环境
EXPOSE 3001
CMD ["yarn", "start:dev"]
```

### 生产环境配置

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/aigame
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USERNAME=neo4j
      - NEO4J_PASSWORD=${NEO4J_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
      - neo4j
      - redis

  mongodb:
    image: mongo:6
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=aigame

  neo4j:
    image: neo4j:5
    environment:
      - NEO4J_AUTH=neo4j/${NEO4J_PASSWORD}
      - NEO4J_PLUGINS=["apoc"]
    volumes:
      - neo4j_data:/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  neo4j_data:
  redis_data:
```

## 性能优化建议

### 后端优化
1. **AI决策缓存**：使用Redis缓存相似情况下的AI决策结果
2. **关系网络索引**：为Neo4j常用查询创建合适的索引
3. **数据库连接池**：优化MongoDB和Neo4j连接池配置
4. **异步处理**：使用NestJS的异步处理能力
5. **API限流**：实现请求限流和防抖

### 前端优化
1. **状态管理优化**：合理使用Zustand和Jotai，避免不必要的重渲染
2. **虚拟化列表**：对大量数据使用虚拟滚动
3. **代码分割**：使用React.lazy进行路由级别的代码分割
4. **图片优化**：像素艺术资源压缩和懒加载
5. **WebSocket优化**：只推送必要的状态变更

### AI优化
1. **Prompt缓存**：缓存常用的Prompt模板
2. **批量处理**：批量处理AI决策请求
3. **模型选择**：根据复杂度选择合适的AI模型
4. **超时处理**：设置合理的AI请求超时时间

### Docker优化
1. **多阶段构建**：使用多阶段Docker构建减少镜像大小
2. **健康检查**：为所有服务添加健康检查
3. **资源限制**：设置合理的CPU和内存限制
4. **日志管理**：配置日志轮转和集中收集

## 开发工具配置

### NestJS CLI 配置

```json
// nest-cli.json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "watchAssets": true,
    "assets": ["**/*.json", "**/*.md"]
  }
}
```

### TypeScript 配置

```json
// backend/tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2020",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

### 启动脚本

```bash
#!/bin/bash
# scripts/start-dev.sh

echo "启动AI游戏开发环境..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker未运行，请先启动Docker"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "错误: .env文件不存在，请复制.env.example并配置"
    exit 1
fi

# 启动数据库服务
echo "启动数据库服务..."
docker-compose up -d mongodb neo4j redis

# 等待数据库启动
echo "等待数据库启动..."
sleep 10

# 初始化数据库
echo "初始化数据库..."
cd backend && npm run db:init && cd ..

# 启动应用服务
echo "启动应用服务..."
docker-compose up frontend backend

echo "开发环境启动完成!"
echo "前端: http://localhost:3000"
echo "后端: http://localhost:3001"
echo "Neo4j: http://localhost:7474"
```
