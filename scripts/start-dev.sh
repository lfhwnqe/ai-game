#!/bin/bash

# AI游戏开发环境启动脚本

set -e

echo "🎮 启动AI游戏开发环境..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ 错误: Docker未运行，请先启动Docker"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "❌ 错误: .env文件不存在"
    echo "请复制.env.example并配置必要的环境变量："
    echo "cp .env.example .env"
    echo "然后编辑.env文件，添加你的API Keys"
    exit 1
fi

# 检查必要的环境变量
source .env
if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
    echo "⚠️  警告: OPENAI_API_KEY未设置或使用默认值"
    echo "请在.env文件中设置正确的OpenAI API Key"
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your_jwt_secret_here_minimum_32_characters" ]; then
    echo "⚠️  警告: JWT_SECRET未设置或使用默认值"
    echo "请在.env文件中设置安全的JWT密钥（至少32个字符）"
fi

# 创建必要的目录
mkdir -p logs
mkdir -p data/mongodb
mkdir -p data/neo4j
mkdir -p data/redis

echo "📦 拉取最新的Docker镜像..."
docker-compose pull

echo "🗄️  启动数据库服务..."
docker-compose up -d mongodb neo4j redis

echo "⏳ 等待数据库服务启动..."
sleep 15

# 检查数据库连接
echo "🔍 检查数据库连接..."

# 检查MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB连接成功"
else
    echo "❌ MongoDB连接失败"
fi

# 检查Neo4j
if docker-compose exec -T neo4j cypher-shell -u neo4j -p password "RETURN 1" > /dev/null 2>&1; then
    echo "✅ Neo4j连接成功"
else
    echo "⏳ Neo4j仍在启动中，等待更长时间..."
    sleep 30
fi

# 检查Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis连接成功"
else
    echo "❌ Redis连接失败"
fi

echo "🚀 启动应用服务..."
docker-compose up frontend backend

echo "🎉 开发环境启动完成!"
echo ""
echo "📱 访问地址:"
echo "  前端游戏界面: http://localhost:3000"
echo "  后端API:     http://localhost:3001"
echo "  Neo4j浏览器:  http://localhost:7474 (用户名: neo4j, 密码: password)"
echo "  MongoDB:     mongodb://localhost:27017"
echo "  Redis:       redis://localhost:6379"
echo ""
echo "🛠️  开发工具:"
echo "  查看日志: docker-compose logs -f [service_name]"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart [service_name]"
echo "  进入容器: docker-compose exec [service_name] sh"
echo ""
echo "📚 初始化数据库:"
echo "  docker-compose exec backend yarn db:init"
