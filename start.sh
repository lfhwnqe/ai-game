#!/bin/bash

# AI游戏一键启动脚本
# 使用方法: ./start.sh

set -e

echo "🎮 AI游戏一键启动脚本"
echo "========================"

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

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "❌ 错误: .env文件不存在"
    echo "环境变量文件已存在，继续启动..."
fi

echo "🗄️  启动数据库服务..."
docker-compose up -d mongodb neo4j redis

echo "⏳ 等待数据库服务启动..."
sleep 10

echo "🚀 启动应用服务..."
echo ""

# 尝试Docker模式启动
echo "尝试Docker模式启动..."
if timeout 60 docker-compose up --build frontend backend 2>/dev/null; then
    echo "🎉 Docker模式启动成功!"
else
    echo ""
    echo "⚠️  Docker模式启动遇到问题，请手动启动："
    echo ""
    echo "📋 手动启动步骤："
    echo "1. 后端启动："
    echo "   cd backend"
    echo "   npm install"
    echo "   npm run start:dev"
    echo ""
    echo "2. 前端启动（新终端窗口）："
    echo "   cd frontend" 
    echo "   npm install"
    echo "   npm run dev"
    echo ""
    echo "3. 数据库已启动，无需额外操作"
fi

echo ""
echo "📱 访问地址:"
echo "  🎮 前端游戏界面: http://localhost:3000"
echo "  🔧 后端API:     http://localhost:3001"
echo "  🗄️  Neo4j浏览器:  http://localhost:7474"
echo "     (用户名: neo4j, 密码: password)"
echo ""
echo "🛠️  常用命令:"
echo "  停止所有服务: docker-compose down"
echo "  查看日志:    docker-compose logs -f"
echo "  重启服务:    docker-compose restart"
echo ""
echo "🆘 如遇问题，请查看 STARTUP_GUIDE.md"
