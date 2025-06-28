# AI Game Backend API 文档

## 基础信息

- **Base URL**: `http://localhost:3001/api`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint",
  "method": "POST",
  "message": "错误信息",
  "error": {}
}
```

## 认证接口

### 用户注册
- **POST** `/auth/register`
- **描述**: 注册新用户
- **请求体**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "user_xxx",
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

### 用户登录
- **POST** `/auth/login`
- **描述**: 用户登录
- **请求体**:
```json
{
  "username": "testuser",
  "password": "Password123"
}
```

### 获取用户信息
- **GET** `/auth/profile`
- **描述**: 获取当前用户信息
- **认证**: 需要JWT Token

### 更新用户资料
- **PUT** `/auth/profile`
- **描述**: 更新用户资料
- **认证**: 需要JWT Token

## 游戏接口

### 创建游戏
- **POST** `/games`
- **描述**: 创建新游戏
- **认证**: 需要JWT Token
- **请求体**:
```json
{
  "difficulty": "standard",
  "winCondition": "wealth"
}
```

### 获取游戏信息
- **GET** `/games/{gameId}`
- **描述**: 获取游戏基本信息
- **认证**: 需要JWT Token

### 获取游戏状态
- **GET** `/games/{gameId}/state`
- **描述**: 获取当前游戏状态
- **认证**: 需要JWT Token

### 开始游戏
- **POST** `/games/{gameId}/start`
- **描述**: 开始游戏
- **认证**: 需要JWT Token

### 提交玩家行动
- **POST** `/games/{gameId}/actions`
- **描述**: 提交玩家行动
- **认证**: 需要JWT Token
- **请求体**:
```json
{
  "actionId": "business_invest",
  "actionType": "business",
  "actionName": "商业投资",
  "actionData": {
    "parameters": {
      "amount": 10000
    },
    "reasoning": "投资理由"
  }
}
```

### 获取行动历史
- **GET** `/games/{gameId}/actions`
- **描述**: 获取玩家行动历史
- **认证**: 需要JWT Token

## 角色接口

### 获取所有角色
- **GET** `/characters`
- **描述**: 获取所有角色列表
- **认证**: 需要JWT Token
- **查询参数**:
  - `type`: 角色类型过滤

### 获取角色详情
- **GET** `/characters/{characterId}`
- **描述**: 获取单个角色详细信息
- **认证**: 需要JWT Token

### 获取角色关系
- **GET** `/characters/{characterId}/relationships`
- **描述**: 获取角色的所有关系
- **认证**: 需要JWT Token

### 获取角色社交网络
- **GET** `/characters/{characterId}/network`
- **描述**: 获取角色的社交网络
- **认证**: 需要JWT Token
- **查询参数**:
  - `depth`: 网络深度 (默认: 2)

### 查找连接路径
- **GET** `/characters/{fromId}/path/{toId}`
- **描述**: 查找两个角色之间的连接路径
- **认证**: 需要JWT Token

### 获取影响力排行
- **GET** `/characters/stats/influential`
- **描述**: 获取最有影响力的角色
- **认证**: 需要JWT Token
- **查询参数**:
  - `limit`: 返回数量 (默认: 10)

## AI接口

### 获取AI统计
- **GET** `/ai/stats`
- **描述**: 获取AI系统统计信息
- **认证**: 需要JWT Token

### 评估角色关系
- **POST** `/ai/relationships/evaluate`
- **描述**: 使用AI评估角色关系
- **认证**: 需要JWT Token

### 生成事件响应
- **POST** `/ai/events/respond`
- **描述**: 生成AI角色对事件的响应
- **认证**: 需要JWT Token

## 系统接口

### 健康检查
- **GET** `/health`
- **描述**: 系统健康检查
- **认证**: 无需认证

### 版本信息
- **GET** `/health/version`
- **描述**: 获取系统版本信息
- **认证**: 无需认证

## WebSocket 事件

### 连接
- **命名空间**: `/game`
- **URL**: `ws://localhost:3001/game`

### 客户端事件

#### 加入游戏
```javascript
socket.emit('joinGame', {
  gameId: 'game_xxx',
  userId: 'user_xxx'
});
```

#### 离开游戏
```javascript
socket.emit('leaveGame', {
  gameId: 'game_xxx'
});
```

#### 请求游戏状态
```javascript
socket.emit('requestGameState', {
  gameId: 'game_xxx'
});
```

### 服务器事件

#### 游戏状态更新
```javascript
socket.on('gameStateUpdate', (data) => {
  console.log('游戏状态更新:', data.gameState);
});
```

#### 回合结果
```javascript
socket.on('roundResult', (data) => {
  console.log('回合结果:', data.result);
});
```

#### 游戏事件
```javascript
socket.on('gameEvent', (data) => {
  console.log('游戏事件:', data.event);
});
```

#### 通知
```javascript
socket.on('notification', (data) => {
  console.log('通知:', data.notification);
});
```

## 错误代码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

## 使用示例

### JavaScript/TypeScript
```javascript
// 登录
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'testuser',
    password: 'Password123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// 创建游戏
const gameResponse = await fetch('/api/games', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    difficulty: 'standard'
  })
});

const game = await gameResponse.json();
```

### cURL
```bash
# 登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Password123"}'

# 创建游戏
curl -X POST http://localhost:3001/api/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"difficulty":"standard"}'
```

## 开发工具

### Postman Collection
可以导入以下环境变量到Postman：
- `baseUrl`: `http://localhost:3001/api`
- `token`: `{{jwt_token}}`

### 测试数据
系统提供了测试用的角色和关系数据，可以通过运行 `yarn db:init` 来初始化。
