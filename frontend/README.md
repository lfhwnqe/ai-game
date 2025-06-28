# 深圳1980 前端应用

AI驱动的商业模拟游戏前端应用，基于React 19.1 + Vite构建。

## 🚀 快速开始

### 环境要求

- Node.js 22+
- npm 10+

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量配置文件：
```bash
cp .env.example .env.local
```

2. 根据需要修改 `.env.local` 中的配置：
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动。

## 🏗️ 项目结构

```
frontend/
├── src/
│   ├── components/          # UI组件
│   │   ├── UI/             # 基础UI组件
│   │   ├── Game/           # 游戏相关组件
│   │   └── Layout/         # 布局组件
│   ├── pages/              # 页面组件
│   ├── stores/             # Zustand状态管理
│   ├── atoms/              # Jotai原子状态
│   ├── services/           # API服务层
│   ├── hooks/              # 自定义钩子
│   ├── types/              # TypeScript类型定义
│   ├── styles/             # 样式文件
│   └── utils/              # 工具函数
├── public/                 # 静态资源
└── index.html              # HTML模板
```

## 🎮 功能特性

### 已实现功能

- ✅ 用户认证系统（登录/注册）
- ✅ 游戏创建和管理
- ✅ 实时WebSocket通信
- ✅ 像素艺术风格UI
- ✅ 响应式设计
- ✅ 状态管理（Zustand + Jotai）
- ✅ 角色信息展示
- ✅ 游戏行动系统
- ✅ 游戏历史记录
- ✅ 通知系统

### 核心组件

#### 认证系统
- `LoginPage` - 用户登录
- `RegisterPage` - 用户注册
- `authStore` - 认证状态管理

#### 游戏系统
- `GamePage` - 游戏主界面
- `GameBoard` - 游戏面板
- `PlayerStats` - 玩家状态
- `ActionPanel` - 行动选择
- `GameHistory` - 游戏历史

#### UI组件库
- `Button` - 像素风格按钮
- `Input` - 输入框组件
- `Card` - 卡片容器
- `LoadingSpinner` - 加载动画
- `NotificationCenter` - 通知中心

## 🔧 开发指南

### 状态管理

项目使用双重状态管理策略：

1. **Zustand** - 全局状态管理
   - 用户认证状态
   - 游戏状态
   - API请求状态

2. **Jotai** - 原子化状态管理
   - UI状态
   - 派生状态
   - 临时状态

### API集成

所有API调用通过 `services/` 目录下的服务层进行：

- `authService` - 认证相关API
- `gameService` - 游戏相关API
- `characterService` - 角色相关API
- `socketService` - WebSocket通信

### WebSocket通信

使用Socket.io进行实时通信：

```typescript
import { useGameSocket } from '../hooks/useSocket';

// 在组件中使用
const { joinGame, submitAction } = useGameSocket(gameId);
```

### 样式系统

使用styled-components和主题系统：

```typescript
import styled from 'styled-components';

const StyledComponent = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fonts.sizes.md};
`;
```

## 🧪 测试

### 运行测试

```bash
npm test
```

### 手动测试流程

1. **认证测试**
   - 访问 http://localhost:3000
   - 测试用户注册功能
   - 测试用户登录功能
   - 验证JWT token管理

2. **游戏功能测试**
   - 创建新游戏
   - 开始游戏
   - 提交行动
   - 查看游戏历史

3. **实时通信测试**
   - 验证WebSocket连接
   - 测试游戏状态同步
   - 测试通知推送

## 📦 构建部署

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 🔍 代码质量

### 代码检查

```bash
npm run lint
```

### 自动修复

```bash
npm run lint:fix
```

## 🐛 故障排除

### 常见问题

1. **API连接失败**
   - 检查后端服务是否启动
   - 验证 `.env.local` 中的API地址
   - 检查CORS配置

2. **WebSocket连接失败**
   - 确认WebSocket服务地址正确
   - 检查防火墙设置
   - 验证认证token

3. **样式问题**
   - 清除浏览器缓存
   - 检查主题配置
   - 验证CSS变量

### 调试模式

启用调试模式查看详细日志：

```env
VITE_DEBUG=true
```

## 📚 技术栈

- **React 19.1** - UI框架
- **Vite** - 构建工具
- **TypeScript** - 类型安全
- **Styled Components** - CSS-in-JS
- **Zustand** - 状态管理
- **Jotai** - 原子状态管理
- **Socket.io** - 实时通信
- **Axios** - HTTP客户端
- **React Router** - 路由管理

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License
