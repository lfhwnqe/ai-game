# AI Game Backend

AI驱动的深圳1980商业模拟游戏后端服务

## 技术栈

- **框架**: NestJS + TypeScript
- **数据库**: MongoDB + Neo4j + Redis
- **AI**: Langchain JS + OpenAI
- **实时通信**: Socket.io
- **认证**: JWT + Passport

## 项目结构

```
backend/
├── src/
│   ├── modules/           # 功能模块
│   │   ├── game/         # 游戏模块
│   │   ├── characters/   # 角色模块
│   │   ├── ai/           # AI模块
│   │   └── auth/         # 认证模块
│   ├── common/           # 公共模块
│   ├── config/           # 配置文件
│   └── main.ts           # 应用入口
├── scripts/              # 脚本文件
├── test/                 # 测试文件
└── package.json
```

## 环境要求

- Node.js 22+
- Yarn 4+
- MongoDB 6+
- Neo4j 5+
- Redis 7+

## 快速开始

### 1. 安装依赖

```bash
yarn install
```

### 2. 环境配置

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：

```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/aigame
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password

# AI配置
OPENAI_API_KEY=your_openai_api_key_here

# JWT密钥
JWT_SECRET=your_jwt_secret_here_minimum_32_characters_long
```

### 3. 启动数据库

使用Docker Compose启动数据库服务：

```bash
# 在项目根目录执行
docker-compose up -d mongodb neo4j redis
```

### 4. 初始化数据库

```bash
yarn db:init
```

### 5. 启动开发服务器

```bash
yarn start:dev
```

服务器将在 http://localhost:3001 启动

## 可用脚本

- `yarn build` - 构建生产版本
- `yarn start` - 启动生产服务器
- `yarn start:dev` - 启动开发服务器（热重载）
- `yarn start:debug` - 启动调试模式
- `yarn test` - 运行单元测试
- `yarn test:e2e` - 运行端到端测试
- `yarn test:cov` - 运行测试覆盖率
- `yarn lint` - 代码检查
- `yarn format` - 代码格式化
- `yarn db:init` - 初始化数据库

## API文档

启动服务器后，访问以下端点：

- **健康检查**: `GET /api/health`
- **版本信息**: `GET /api/health/version`
- **用户注册**: `POST /api/auth/register`
- **用户登录**: `POST /api/auth/login`
- **创建游戏**: `POST /api/games`
- **获取角色**: `GET /api/characters`

## WebSocket事件

连接到 `ws://localhost:3001/game` 命名空间：

- `joinGame` - 加入游戏房间
- `leaveGame` - 离开游戏房间
- `requestGameState` - 请求游戏状态
- `gameStateUpdate` - 游戏状态更新（服务器推送）
- `roundResult` - 回合结果（服务器推送）

## 数据库设计

### MongoDB集合

- `games` - 游戏基本信息
- `gamestates` - 游戏状态快照
- `playeractions` - 玩家行动记录
- `characters` - 角色信息
- `relationships` - 角色关系
- `users` - 用户信息

### Neo4j图结构

- `Character` 节点 - 角色信息
- `RELATIONSHIP` 关系 - 角色间关系

## AI决策系统

AI决策引擎使用Langchain JS和OpenAI GPT-4：

1. **角色个性化**: 每个AI角色都有独特的性格和目标
2. **上下文感知**: 基于游戏状态和历史行为做决策
3. **关系网络**: 考虑角色间的关系影响决策
4. **缓存优化**: 缓存相似情况下的决策结果

## 开发指南

### 添加新模块

```bash
yarn nest generate module new-module
yarn nest generate service new-module
yarn nest generate controller new-module
```

### 数据模型

使用Mongoose Schema定义MongoDB模型：

```typescript
@Schema({ timestamps: true })
export class ExampleModel {
  @Prop({ required: true })
  name: string;
}
```

### API控制器

使用NestJS装饰器定义API：

```typescript
@Controller('example')
@UseGuards(JwtAuthGuard)
export class ExampleController {
  @Get()
  async getAll() {
    return { success: true, data: [] };
  }
}
```

## 测试

### 单元测试

```bash
yarn test
```

### 端到端测试

```bash
yarn test:e2e
```

### 测试覆盖率

```bash
yarn test:cov
```

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t ai-game-backend .

# 运行容器
docker run -p 3001:3001 ai-game-backend
```

### 生产环境

1. 设置环境变量
2. 构建应用: `yarn build`
3. 启动服务: `yarn start:prod`

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证连接字符串和凭据

2. **AI决策超时**
   - 检查OpenAI API密钥
   - 调整AI_DECISION_TIMEOUT配置

3. **WebSocket连接问题**
   - 检查CORS配置
   - 验证前端连接URL

### 日志查看

```bash
# 查看应用日志
tail -f logs/app.log

# 查看Docker日志
docker-compose logs -f backend
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License
