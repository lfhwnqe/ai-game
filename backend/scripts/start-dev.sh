#!/bin/bash

# AI Game Backend 开发启动脚本

echo "🚀 启动AI游戏后端开发环境..."

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 22+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 18+ 版本"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查包管理器
if command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
    echo "✅ 使用 Yarn 作为包管理器"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
    echo "✅ 使用 NPM 作为包管理器"
else
    echo "❌ 未找到包管理器，请安装 npm 或 yarn"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📋 复制环境变量模板..."
        cp .env.example .env
        echo "⚠️  请编辑 .env 文件配置必要的环境变量"
    else
        echo "❌ 未找到环境变量文件"
        exit 1
    fi
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn install
    else
        npm install
    fi
fi

# 检查数据库连接
echo "🔍 检查数据库连接..."

# 检查MongoDB
if ! nc -z localhost 27017 2>/dev/null; then
    echo "⚠️  MongoDB 未运行在 localhost:27017"
    echo "   请启动 MongoDB 或使用 Docker: docker-compose up -d mongodb"
fi

# 检查Neo4j
if ! nc -z localhost 7687 2>/dev/null; then
    echo "⚠️  Neo4j 未运行在 localhost:7687"
    echo "   请启动 Neo4j 或使用 Docker: docker-compose up -d neo4j"
fi

# 检查Redis
if ! nc -z localhost 6379 2>/dev/null; then
    echo "⚠️  Redis 未运行在 localhost:6379"
    echo "   请启动 Redis 或使用 Docker: docker-compose up -d redis"
fi

# 初始化数据库（可选）
read -p "是否初始化数据库？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 初始化数据库..."
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn db:init
    else
        npm run db:init
    fi
fi

# 启动开发服务器
echo "🎯 启动开发服务器..."
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn start:dev
else
    npm run start:dev
fi
