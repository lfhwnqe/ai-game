#!/bin/bash

# AI游戏服务停止脚本
# 使用方法: ./stop.sh

echo "🛑 AI游戏服务停止脚本"
echo "===================="

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，无法停止Docker服务"
else
    echo "🔍 检查运行中的服务..."
    
    # 显示当前运行的服务
    if docker-compose ps | grep -q "Up"; then
        echo ""
        echo "📋 当前运行的服务:"
        docker-compose ps
        echo ""
        
        echo "请选择停止方式："
        echo "1) 停止所有服务（包括数据库）"
        echo "2) 仅停止应用服务（保留数据库）"
        echo "3) 仅停止数据库服务"
        echo "4) 取消"
        echo ""
        read -p "请选择 (1-4，默认1): " stop_choice
        
        case $stop_choice in
            2)
                echo "🛑 停止应用服务..."
                docker-compose down frontend backend
                echo "✅ 应用服务已停止，数据库继续运行"
                ;;
            3)
                echo "🛑 停止数据库服务..."
                docker-compose down mongodb neo4j redis
                echo "✅ 数据库服务已停止"
                ;;
            4)
                echo "❌ 取消操作"
                exit 0
                ;;
            *)
                echo "🛑 停止所有服务..."
                docker-compose down
                echo "✅ 所有服务已停止"
                ;;
        esac
    else
        echo "ℹ️  没有运行中的Docker服务"
    fi
fi

# 检查本地Node.js进程
echo ""
echo "🔍 检查本地Node.js进程..."

# 查找可能的游戏相关进程
BACKEND_PIDS=$(pgrep -f "nest start" 2>/dev/null || true)
FRONTEND_PIDS=$(pgrep -f "vite.*dev" 2>/dev/null || true)

if [ -n "$BACKEND_PIDS" ] || [ -n "$FRONTEND_PIDS" ]; then
    echo "发现本地运行的进程："
    
    if [ -n "$BACKEND_PIDS" ]; then
        echo "  后端进程: $BACKEND_PIDS"
    fi
    
    if [ -n "$FRONTEND_PIDS" ]; then
        echo "  前端进程: $FRONTEND_PIDS"
    fi
    
    echo ""
    read -p "是否停止这些进程？(y/N): " kill_choice
    
    if [[ $kill_choice =~ ^[Yy]$ ]]; then
        if [ -n "$BACKEND_PIDS" ]; then
            echo "🛑 停止后端进程..."
            kill $BACKEND_PIDS 2>/dev/null || true
        fi
        
        if [ -n "$FRONTEND_PIDS" ]; then
            echo "🛑 停止前端进程..."
            kill $FRONTEND_PIDS 2>/dev/null || true
        fi
        
        echo "✅ 本地进程已停止"
    else
        echo "ℹ️  保留本地进程运行"
    fi
else
    echo "ℹ️  没有发现相关的本地进程"
fi

echo ""
echo "🔍 最终状态检查..."

# 检查端口占用情况
for port in 3000 3001 7474 7687 27017 6379; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo "⚠️  端口 $port 仍被占用"
    fi
done

echo ""
echo "✅ 停止操作完成"
echo ""
echo "🚀 重新启动服务："
echo "  ./start-database.sh  # 启动数据库"
echo "  ./start-app.sh       # 启动应用"
echo "  ./start.sh           # 一键启动"
