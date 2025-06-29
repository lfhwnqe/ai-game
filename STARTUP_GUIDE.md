# 🎮 AI游戏启动指南

## 🚀 一键启动

### 方法1：分步启动（推荐）

```bash
# 1. 启动数据库服务
chmod +x start-database.sh
./start-database.sh

# 2. 启动前后端应用（新终端窗口）
chmod +x start-app.sh
./start-app.sh
```

### 方法2：完整一键启动

```bash
# 给脚本执行权限
chmod +x start.sh

# 运行一键启动
./start.sh
```

### 方法3：使用详细启动脚本

```bash
# 给脚本执行权限
chmod +x scripts/start-dev.sh

# 运行详细启动脚本
./scripts/start-dev.sh
```

## 📋 环境要求

### 必需软件
- **Docker Desktop** - 用于运行数据库服务
- **Node.js 22** - 用于运行前后端应用（如果Docker启动失败）
- **npm** - Node.js包管理器

### 检查环境
```bash
# 检查Docker
docker --version

# 检查Node.js（可选）
node --version

# 检查npm（可选）
npm --version
```

## 🗄️ 数据库服务

项目使用以下数据库：
- **MongoDB** - 主数据存储 (端口: 27017)
- **Neo4j** - 图数据库，存储角色关系 (端口: 7474, 7687)
- **Redis** - 缓存和会话存储 (端口: 6379)

### 一键启动数据库
```bash
# 启动数据库服务
./start-database.sh
```

### 数据库管理命令
```bash
# 手动启动数据库
docker-compose up -d mongodb neo4j redis

# 停止数据库
docker-compose down

# 查看数据库日志
docker-compose logs -f mongodb
docker-compose logs -f neo4j
docker-compose logs -f redis

# 重启特定数据库
docker-compose restart mongodb
docker-compose restart neo4j
docker-compose restart redis
```

## 🚀 前后端应用

### 一键启动应用
```bash
# 启动前后端应用（需要先启动数据库）
./start-app.sh
```

应用启动脚本支持三种模式：
1. **本地模式**（推荐）- 使用本地Node.js环境，开发体验更好
2. **Docker模式** - 完全容器化运行
3. **混合模式** - 后端本地运行，前端Docker运行

## 🔧 手动启动（备用方案）

如果一键启动失败，可以手动启动：

### 1. 启动数据库
```bash
# 使用一键脚本
./start-database.sh

# 或手动启动
docker-compose up -d mongodb neo4j redis
```

### 2. 启动后端
```bash
cd backend
# 使用yarn（推荐）
yarn install
yarn start:dev

# 或使用npm
npm install
npm run start:dev
```

### 3. 启动前端（新终端窗口）
```bash
cd frontend
# 使用yarn（推荐）
yarn install
yarn dev

# 或使用npm
npm install
npm run dev
```

## 🌐 访问地址

启动成功后，可以访问：

- **🎮 游戏前端**: http://localhost:3000
- **🔧 后端API**: http://localhost:3001
- **🗄️ Neo4j浏览器**: http://localhost:7474
  - 用户名: `neo4j`
  - 密码: `password`

## 🔍 故障排除

### Docker相关问题

**问题**: Docker未运行
```
❌ 错误: Docker未运行，请先启动Docker
```
**解决**: 启动Docker Desktop应用

**问题**: 端口被占用
```
Error: Port 3000 is already in use
```
**解决**: 
```bash
# 查找占用端口的进程
lsof -i :3000

# 停止占用进程
kill -9 <PID>
```

### 网络问题

**问题**: Docker镜像拉取失败
```
failed to solve: DeadlineExceeded
```
**解决**: 使用手动启动方案，或配置Docker镜像源

### Node.js相关问题

**问题**: Node.js未安装
```bash
bash: npm: command not found
```
**解决**: 
1. 安装Node.js 22: https://nodejs.org/
2. 或使用nvm: `nvm install 22 && nvm use 22`

## 🛠️ 开发工具

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

### 进入容器
```bash
# 进入后端容器
docker-compose exec backend sh

# 进入数据库容器
docker-compose exec mongodb mongosh
docker-compose exec neo4j cypher-shell -u neo4j -p password
```

## 📚 初始化数据

首次启动后，可以初始化游戏数据：

```bash
# 初始化数据库
docker-compose exec backend npm run db:init
```

## 🆘 获取帮助

如果遇到问题：
1. 查看本文档的故障排除部分
2. 检查日志输出: `docker-compose logs -f`
3. 确认所有端口未被占用
4. 重启Docker Desktop
5. 使用手动启动方案
