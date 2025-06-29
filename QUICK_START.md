# 🚀 快速启动指南

## 📋 前置要求
- Docker Desktop（必需）
- Node.js 22（推荐，用于本地开发）

## ⚡ 快速启动

### 方法1：分步启动（推荐）

**第一步：启动数据库**
```bash
./start-database.sh
```

**第二步：启动应用（新终端窗口）**
```bash
./start-app.sh
```

### 方法2：完整一键启动
```bash
./start.sh
```

## 🌐 访问地址

启动成功后访问：
- **🎮 游戏界面**: http://localhost:3000
- **🔧 后端API**: http://localhost:3001  
- **🗄️ Neo4j浏览器**: http://localhost:7474 (neo4j/password)

## 🛑 停止服务

### 一键停止（推荐）
```bash
./stop.sh
```

### 手动停止
```bash
# 停止所有服务
docker-compose down

# 仅停止应用，保留数据库
docker-compose down frontend backend

# 仅停止数据库
docker-compose down mongodb neo4j redis
```

## 🆘 遇到问题？

1. 确保Docker Desktop正在运行
2. 检查端口是否被占用：`lsof -i :3000`
3. 查看详细启动指南：`STARTUP_GUIDE.md`
4. 查看日志：`docker-compose logs -f`

## 📚 更多信息

- 详细启动指南：[STARTUP_GUIDE.md](./STARTUP_GUIDE.md)
- 项目文档：[README.md](./README.md)
- API文档：[backend/API.md](./backend/API.md)
