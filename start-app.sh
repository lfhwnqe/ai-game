#!/bin/bash

# AI游戏前后端应用一键启动脚本
# 使用方法: ./start-app.sh

set -e

echo "🚀 AI游戏前后端应用启动脚本"
echo "=============================="

# 检查数据库是否运行
echo "🔍 检查数据库服务状态..."
if ! docker-compose ps | grep -E "(mongodb|neo4j|redis)" | grep -q "Up"; then
    echo "❌ 错误: 数据库服务未运行"
    echo ""
    echo "请先启动数据库服务："
    echo "  ./start-database.sh"
    echo ""
    exit 1
fi

echo "✅ 数据库服务运行正常"

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "❌ 错误: .env文件不存在"
    echo ""
    echo "请创建环境变量文件："
    echo "  cp .env.example .env"
    echo "  然后编辑.env文件，添加你的API Keys"
    exit 1
fi

# 检查必要的环境变量
source .env
if [ -z "$GOOGLE_API_KEY" ] || [ "$GOOGLE_API_KEY" = "your_google_api_key_here" ]; then
    echo "⚠️  警告: GOOGLE_API_KEY未设置或使用默认值"
    echo "请在.env文件中设置正确的Google Gemini API Key"
    echo ""
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your_jwt_secret_here_minimum_32_characters" ]; then
    echo "⚠️  警告: JWT_SECRET未设置或使用默认值"
    echo "请在.env文件中设置安全的JWT密钥（至少32个字符）"
    echo ""
fi

# 检查Node.js环境
echo "🔍 检查Node.js环境..."
if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js版本: $NODE_VERSION"
    
    # 检查是否为推荐版本
    if [[ $NODE_VERSION == v22* ]]; then
        echo "✅ 使用推荐的Node.js 22版本"
    else
        echo "⚠️  推荐使用Node.js 22版本，当前版本: $NODE_VERSION"
    fi
else
    echo "❌ Node.js未安装，将尝试Docker模式启动"
    FORCE_DOCKER=true
fi

# 检查包管理器
if command -v yarn > /dev/null 2>&1; then
    PACKAGE_MANAGER="yarn"
    echo "✅ 使用yarn作为包管理器"
elif command -v npm > /dev/null 2>&1; then
    PACKAGE_MANAGER="npm"
    echo "✅ 使用npm作为包管理器"
else
    echo "❌ 未找到包管理器，将尝试Docker模式启动"
    FORCE_DOCKER=true
fi

echo ""
echo "🚀 启动前后端应用..."

# 选择启动模式
if [ "$FORCE_DOCKER" = true ]; then
    echo "🐳 使用Docker模式启动..."
    startup_mode="docker"
else
    echo "请选择启动模式："
    echo "1) 本地模式 (推荐，更快的开发体验)"
    echo "2) Docker模式"
    echo "3) 混合模式 (后端本地，前端Docker)"
    echo ""
    read -p "请选择 (1-3，默认1): " mode_choice
    
    case $mode_choice in
        2)
            startup_mode="docker"
            ;;
        3)
            startup_mode="hybrid"
            ;;
        *)
            startup_mode="local"
            ;;
    esac
fi

case $startup_mode in
    "local")
        echo ""
        echo "🏠 本地模式启动..."
        echo "========================"
        
        # 启动后端
        echo "🔧 启动后端服务..."
        cd backend
        if [ ! -d "node_modules" ]; then
            echo "📦 安装后端依赖..."
            $PACKAGE_MANAGER install
        fi
        
        echo "🚀 启动后端开发服务器..."
        $PACKAGE_MANAGER run start:dev &
        BACKEND_PID=$!
        cd ..
        
        # 等待后端启动
        echo "⏳ 等待后端服务启动..."
        sleep 8
        
        # 启动前端
        echo "🎨 启动前端服务..."
        cd frontend
        if [ ! -d "node_modules" ]; then
            echo "📦 安装前端依赖..."
            $PACKAGE_MANAGER install
        fi
        
        echo "🚀 启动前端开发服务器..."
        $PACKAGE_MANAGER run dev &
        FRONTEND_PID=$!
        cd ..
        
        echo ""
        echo "🎉 本地模式启动成功！"
        echo ""
        echo "进程ID:"
        echo "  后端PID: $BACKEND_PID"
        echo "  前端PID: $FRONTEND_PID"
        echo ""
        echo "停止应用："
        echo "  kill $BACKEND_PID $FRONTEND_PID"
        echo "  或者按 Ctrl+C"
        ;;
        
    "docker")
        echo ""
        echo "🐳 Docker模式启动..."
        echo "====================="
        
        # 使用代理配置启动应用
        export https_proxy=http://127.0.0.1:7890
        export http_proxy=http://127.0.0.1:7890
        export all_proxy=socks5://127.0.0.1:7890
        
        echo "🔨 构建并启动应用容器..."
        if docker-compose up --build frontend backend; then
            echo "🎉 Docker模式启动成功！"
        else
            echo "❌ Docker模式启动失败"
            echo ""
            echo "请尝试本地模式启动："
            echo "  重新运行此脚本并选择本地模式"
            exit 1
        fi
        ;;
        
    "hybrid")
        echo ""
        echo "🔀 混合模式启动..."
        echo "=================="
        
        # 本地启动后端
        echo "🔧 本地启动后端服务..."
        cd backend
        if [ ! -d "node_modules" ]; then
            echo "📦 安装后端依赖..."
            $PACKAGE_MANAGER install
        fi
        $PACKAGE_MANAGER run start:dev &
        BACKEND_PID=$!
        cd ..
        
        # Docker启动前端
        echo "🎨 Docker启动前端服务..."
        docker-compose up --build frontend &
        
        echo "🎉 混合模式启动成功！"
        echo "后端PID: $BACKEND_PID"
        ;;
esac

echo ""
echo "📱 访问地址:"
echo "  🎮 前端游戏界面: http://localhost:3000"
echo "  🔧 后端API:     http://localhost:3001"
echo "  🗄️  Neo4j浏览器:  http://localhost:7474"
echo "     (用户名: neo4j, 密码: password)"
echo ""
echo "🛠️  开发工具:"
echo "  查看日志: docker-compose logs -f [frontend|backend]"
echo "  重启服务: docker-compose restart [frontend|backend]"
echo "  停止服务: docker-compose down frontend backend"
echo ""
echo "📚 初始化数据库（首次启动后）:"
echo "  docker-compose exec backend npm run db:init"
echo ""
echo "🆘 如遇问题，请查看 STARTUP_GUIDE.md"

# 如果是本地模式，等待用户中断
if [ "$startup_mode" = "local" ] || [ "$startup_mode" = "hybrid" ]; then
    echo ""
    echo "按 Ctrl+C 停止应用..."
    
    # 设置信号处理
    trap 'echo ""; echo "🛑 正在停止应用..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT
    
    # 等待
    wait
fi
