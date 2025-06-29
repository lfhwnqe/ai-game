# 🛠️ 启动脚本总览

## 📋 可用脚本

### 🚀 启动脚本

| 脚本名称 | 功能 | 推荐场景 |
|---------|------|----------|
| `./start-database.sh` | 仅启动数据库服务 | 分步启动，数据库优先 |
| `./start-app.sh` | 启动前后端应用 | 数据库已运行时使用 |
| `./start.sh` | 一键启动所有服务 | 快速完整启动 |
| `./scripts/start-dev.sh` | 详细开发环境启动 | 开发调试使用 |

### 🛑 停止脚本

| 脚本名称 | 功能 | 说明 |
|---------|------|------|
| `./stop.sh` | 智能停止服务 | 提供多种停止选项 |

## 🎯 推荐启动流程

### 方案1：分步启动（推荐）
```bash
# 终端1：启动数据库
./start-database.sh

# 终端2：启动应用
./start-app.sh
```

**优势**：
- ✅ 更好的控制粒度
- ✅ 数据库和应用分离管理
- ✅ 便于调试和日志查看
- ✅ 支持多种应用启动模式

### 方案2：一键启动
```bash
./start.sh
```

**优势**：
- ✅ 操作简单
- ✅ 适合快速体验
- ✅ 自动处理依赖关系

## 🔧 脚本功能详解

### start-database.sh
- 🔍 检查Docker环境
- 📁 创建必要目录
- 🔄 智能处理已运行服务
- 🌐 配置网络代理
- ✅ 验证数据库连接
- 📊 显示访问地址

### start-app.sh
- 🔍 验证数据库状态
- ⚙️ 检查环境变量
- 🔧 检测Node.js环境
- 🎯 提供三种启动模式：
  - 本地模式（推荐）
  - Docker模式
  - 混合模式
- 🔄 自动安装依赖
- 📊 显示进程信息

### stop.sh
- 🔍 检查运行状态
- 🎯 提供停止选项：
  - 停止所有服务
  - 仅停止应用
  - 仅停止数据库
- 🔄 处理本地进程
- 📊 端口占用检查

## 🌐 服务端口

| 服务 | 端口 | 访问地址 |
|------|------|----------|
| 前端 | 3000 | http://localhost:3000 |
| 后端 | 3001 | http://localhost:3001 |
| Neo4j | 7474 | http://localhost:7474 |
| Neo4j Bolt | 7687 | bolt://localhost:7687 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Redis | 6379 | redis://localhost:6379 |

## 🆘 故障排除

### 常见问题

1. **Docker未运行**
   ```bash
   # 启动Docker Desktop
   # 然后重新运行脚本
   ```

2. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i :3000
   
   # 停止占用进程
   ./stop.sh
   ```

3. **权限问题**
   ```bash
   # 添加执行权限
   chmod +x *.sh
   ```

4. **环境变量未配置**
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   
   # 编辑配置
   nano .env
   ```

## 📚 相关文档

- [QUICK_START.md](./QUICK_START.md) - 快速启动指南
- [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) - 详细启动指南
- [README.md](./README.md) - 项目总览
- [backend/API.md](./backend/API.md) - API文档
