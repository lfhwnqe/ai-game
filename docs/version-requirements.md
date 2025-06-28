# 版本要求说明

## 核心版本要求

### Node.js 22+
- **最低版本**: Node.js 22.0.0
- **推荐版本**: Node.js 22.12.0 (LTS)
- **原因**: 
  - 更好的ES模块支持
  - 改进的性能和内存管理
  - 原生支持最新的JavaScript特性
  - 更好的TypeScript兼容性

### Yarn 4+
- **最低版本**: Yarn 4.0.0
- **推荐版本**: Yarn 4.5.3
- **原因**:
  - 更快的依赖安装速度
  - 更好的工作区支持
  - 改进的缓存机制
  - 零安装特性支持

### React 19.1
- **版本**: React 19.1.0
- **包含**: react, react-dom
- **新特性**:
  - 改进的并发特性
  - 更好的服务端渲染支持
  - 新的编译器优化
  - 改进的开发者体验

## 安装指南

### 1. 安装 Node.js 22

#### 使用 nvm (推荐)
```bash
# 安装 nvm (如果还没有安装)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载终端或运行
source ~/.bashrc

# 安装 Node.js 22
nvm install 22
nvm use 22
nvm alias default 22

# 验证版本
node --version  # 应该显示 v22.x.x
```

#### 使用官方安装包
- 访问 [Node.js官网](https://nodejs.org/)
- 下载 Node.js 22 LTS 版本
- 按照安装向导完成安装

### 2. 启用 Yarn

Node.js 22 内置了 Corepack，可以轻松管理包管理器：

```bash
# 启用 Corepack
corepack enable

# 准备 Yarn
corepack prepare yarn@4.5.3 --activate

# 验证版本
yarn --version  # 应该显示 4.5.3
```

### 3. 项目初始化

```bash
# 克隆项目
git clone <repository-url>
cd ai-game

# 安装前端依赖
cd frontend
yarn install

# 安装后端依赖
cd ../backend
yarn install

# 返回根目录
cd ..
```

## 版本兼容性

### 支持的版本范围

| 组件 | 最低版本 | 推荐版本 | 最高测试版本 |
|------|----------|----------|--------------|
| Node.js | 22.0.0 | 22.12.0 | 22.12.0 |
| Yarn | 4.0.0 | 4.5.3 | 4.5.3 |
| React | 19.1.0 | 19.1.0 | 19.1.0 |
| TypeScript | 5.7.0 | 5.7.2 | 5.7.2 |
| NestJS | 10.4.0 | 10.4.15 | 10.4.15 |

### 不兼容的版本

❌ **不支持的版本**:
- Node.js < 22.0.0
- npm (请使用 Yarn)
- React < 19.0.0
- TypeScript < 5.7.0

## 开发环境验证

创建验证脚本来检查环境：

```bash
# 创建验证脚本
cat > scripts/check-environment.sh << 'EOF'
#!/bin/bash

echo "🔍 检查开发环境..."

# 检查 Node.js 版本
NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR" -ge 22 ]; then
    echo "✅ Node.js: $NODE_VERSION (符合要求 >=22.0.0)"
else
    echo "❌ Node.js: $NODE_VERSION (需要 >=22.0.0)"
    exit 1
fi

# 检查 Yarn 版本
if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    YARN_MAJOR=$(echo $YARN_VERSION | cut -d'.' -f1)
    
    if [ "$YARN_MAJOR" -ge 4 ]; then
        echo "✅ Yarn: $YARN_VERSION (符合要求 >=4.0.0)"
    else
        echo "❌ Yarn: $YARN_VERSION (需要 >=4.0.0)"
        exit 1
    fi
else
    echo "❌ Yarn 未安装"
    echo "请运行: corepack enable && corepack prepare yarn@4.5.3 --activate"
    exit 1
fi

# 检查 Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
else
    echo "❌ Docker 未安装"
    exit 1
fi

# 检查 Docker Compose
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose: $(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1)"
else
    echo "❌ Docker Compose 未安装"
    exit 1
fi

echo "🎉 环境检查通过！"
EOF

chmod +x scripts/check-environment.sh
```

运行环境检查：
```bash
./scripts/check-environment.sh
```

## 故障排除

### 常见问题

#### 1. Node.js 版本过低
```bash
# 错误信息: "engine node: wanted: >=22.0.0"
# 解决方案: 升级 Node.js
nvm install 22
nvm use 22
```

#### 2. Yarn 版本过低
```bash
# 错误信息: "packageManager yarn: wanted: >=4.0.0"
# 解决方案: 升级 Yarn
corepack prepare yarn@4.5.3 --activate
```

#### 3. React 类型错误
```bash
# 错误信息: React 类型不兼容
# 解决方案: 确保使用正确的 React 类型
yarn add -D @types/react@^19.0.2 @types/react-dom@^19.0.2
```

### 清理和重新安装

如果遇到依赖问题，可以清理并重新安装：

```bash
# 清理 Yarn 缓存
yarn cache clean

# 删除 node_modules 和锁文件
rm -rf node_modules yarn.lock

# 重新安装
yarn install
```

## 性能优化

### Yarn 配置优化

在项目根目录创建 `.yarnrc.yml`:

```yaml
# .yarnrc.yml
nodeLinker: node-modules
enableGlobalCache: true
compressionLevel: mixed
enableTelemetry: false

# 网络配置
httpTimeout: 60000
networkTimeout: 60000

# 缓存配置
enableMirror: false
```

### Node.js 性能配置

设置 Node.js 环境变量：

```bash
# 在 .env 文件中添加
NODE_OPTIONS="--max-old-space-size=4096"
UV_THREADPOOL_SIZE=128
```

这些配置将确保项目在最新的技术栈上运行，获得最佳的性能和开发体验。
