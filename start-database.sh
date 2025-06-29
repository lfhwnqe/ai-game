#!/bin/bash

# AI游戏数据库一键启动脚本
# 使用方法: ./start-database.sh

set -e

echo "🗄️  AI游戏数据库启动脚本"
echo "=========================="

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ 错误: Docker未运行，请先启动Docker"
    echo ""
    echo "📋 启动Docker的方法："
    echo "  - macOS: 打开Docker Desktop应用"
    echo "  - Linux: sudo systemctl start docker"
    echo "  - Windows: 打开Docker Desktop应用"
    exit 1
fi

# 创建必要的数据目录
echo "📁 创建数据目录..."
mkdir -p data/mongodb
mkdir -p data/neo4j
mkdir -p data/redis
mkdir -p logs

# 检查是否有运行中的数据库容器
echo "🔍 检查现有数据库服务..."
if docker-compose ps | grep -E "(mongodb|neo4j|redis)" | grep -q "Up"; then
    echo "⚠️  检测到已运行的数据库服务"
    read -p "是否重启数据库服务？(y/N): " restart_choice
    if [[ $restart_choice =~ ^[Yy]$ ]]; then
        echo "🔄 重启数据库服务..."
        docker-compose down mongodb neo4j redis
        sleep 3
    else
        echo "✅ 使用现有数据库服务"
        echo ""
        echo "📱 数据库访问地址:"
        echo "  🗄️  MongoDB:     mongodb://localhost:27017"
        echo "  🔗 Neo4j浏览器:  http://localhost:7474"
        echo "     (用户名: neo4j, 密码: password)"
        echo "  🔴 Redis:        redis://localhost:6379"
        echo ""
        echo "🛠️  数据库管理命令:"
        echo "  查看状态: docker-compose ps"
        echo "  查看日志: docker-compose logs -f [mongodb|neo4j|redis]"
        echo "  停止服务: docker-compose down"
        exit 0
    fi
fi

# 启动数据库服务
echo "🚀 启动数据库服务..."
echo "  - MongoDB (端口: 27017)"
echo "  - Neo4j (端口: 7474, 7687)"
echo "  - Redis (端口: 6379)"
echo ""

# 使用代理配置启动数据库
export https_proxy=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890

docker-compose up -d mongodb neo4j redis

echo "⏳ 等待数据库服务启动..."
sleep 15

# 检查数据库连接状态
echo "🔍 检查数据库连接状态..."

# 检查MongoDB
echo -n "  MongoDB: "
if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✅ 连接成功"
else
    echo "⏳ 启动中..."
fi

# 检查Neo4j
echo -n "  Neo4j: "
max_attempts=6
attempt=1
while [ $attempt -le $max_attempts ]; do
    if docker-compose exec -T neo4j cypher-shell -u neo4j -p password "RETURN 1" > /dev/null 2>&1; then
        echo "✅ 连接成功"
        break
    elif [ $attempt -eq $max_attempts ]; then
        echo "⏳ 仍在启动中（这是正常的，Neo4j需要更长时间）"
    else
        sleep 5
        attempt=$((attempt + 1))
    fi
done

# 检查Redis
echo -n "  Redis: "
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ 连接成功"
else
    echo "⏳ 启动中..."
fi

echo ""
echo "🎉 数据库服务启动完成！"
echo ""
echo "📱 数据库访问地址:"
echo "  🗄️  MongoDB:     mongodb://localhost:27017"
echo "  🔗 Neo4j浏览器:  http://localhost:7474"
echo "     (用户名: neo4j, 密码: password)"
echo "  🔴 Redis:        redis://localhost:6379"
echo ""
echo "🛠️  数据库管理命令:"
echo "  查看状态: docker-compose ps"
echo "  查看日志: docker-compose logs -f [mongodb|neo4j|redis]"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart [mongodb|neo4j|redis]"
echo ""
echo "📚 初始化数据库（可选）:"
echo "  等前后端启动后运行: docker-compose exec backend npm run db:init"
echo ""
echo "➡️  下一步: 运行 ./start-app.sh 启动前后端应用"
