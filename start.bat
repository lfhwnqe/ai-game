@echo off
chcp 65001 >nul
echo 🎮 AI游戏一键启动脚本 (Windows)
echo ========================

REM 检查Docker是否运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: Docker未运行，请先启动Docker Desktop
    echo.
    echo 📋 启动Docker Desktop后再运行此脚本
    pause
    exit /b 1
)

echo 🗄️  启动数据库服务...
docker-compose up -d mongodb neo4j redis

echo ⏳ 等待数据库服务启动...
timeout /t 10 /nobreak >nul

echo 🚀 启动应用服务...
echo.

REM 尝试Docker模式启动
echo 尝试Docker模式启动...
docker-compose up --build frontend backend

echo.
echo 📱 访问地址:
echo   🎮 前端游戏界面: http://localhost:3000
echo   🔧 后端API:     http://localhost:3001
echo   🗄️  Neo4j浏览器:  http://localhost:7474
echo      (用户名: neo4j, 密码: password)
echo.
echo 🛠️  常用命令:
echo   停止所有服务: docker-compose down
echo   查看日志:    docker-compose logs -f
echo.
echo 🆘 如遇问题，请查看 STARTUP_GUIDE.md
pause
