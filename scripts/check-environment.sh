#!/bin/bash

# AI游戏环境检查脚本

set -e

echo "🔍 检查AI游戏开发环境..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查结果
CHECKS_PASSED=0
TOTAL_CHECKS=0

# 检查函数
check_requirement() {
    local name=$1
    local command=$2
    local min_version=$3
    local current_version=$4
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if eval "$command" &> /dev/null; then
        if [ -n "$min_version" ] && [ -n "$current_version" ]; then
            echo -e "${GREEN}✅ $name: $current_version${NC}"
        else
            echo -e "${GREEN}✅ $name: 已安装${NC}"
        fi
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo -e "${RED}❌ $name: 未安装或版本不符合要求${NC}"
        if [ -n "$min_version" ]; then
            echo -e "   ${YELLOW}需要版本: $min_version${NC}"
        fi
    fi
}

# 检查 Node.js 版本
echo "📦 检查运行时环境..."
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 || echo "")
if [ -n "$NODE_VERSION" ]; then
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 22 ]; then
        check_requirement "Node.js" "true" ">=22.0.0" "v$NODE_VERSION"
    else
        check_requirement "Node.js" "false" ">=22.0.0" "v$NODE_VERSION (版本过低)"
        echo -e "   ${YELLOW}请升级到 Node.js 22+: nvm install 22 && nvm use 22${NC}"
    fi
else
    check_requirement "Node.js" "false" ">=22.0.0" ""
    echo -e "   ${YELLOW}请安装 Node.js 22+: https://nodejs.org/${NC}"
fi

# 检查 Yarn 版本
YARN_VERSION=$(yarn --version 2>/dev/null || echo "")
if [ -n "$YARN_VERSION" ]; then
    YARN_MAJOR=$(echo $YARN_VERSION | cut -d'.' -f1)
    if [ "$YARN_MAJOR" -ge 4 ]; then
        check_requirement "Yarn" "true" ">=4.0.0" "$YARN_VERSION"
    else
        check_requirement "Yarn" "false" ">=4.0.0" "$YARN_VERSION (版本过低)"
        echo -e "   ${YELLOW}请升级 Yarn: corepack prepare yarn@4.5.3 --activate${NC}"
    fi
else
    check_requirement "Yarn" "false" ">=4.0.0" ""
    echo -e "   ${YELLOW}请安装 Yarn: corepack enable && corepack prepare yarn@4.5.3 --activate${NC}"
fi

echo ""
echo "🐳 检查容器环境..."

# 检查 Docker
DOCKER_VERSION=$(docker --version 2>/dev/null | cut -d' ' -f3 | cut -d',' -f1 || echo "")
if [ -n "$DOCKER_VERSION" ]; then
    check_requirement "Docker" "docker info" "" "$DOCKER_VERSION"
else
    check_requirement "Docker" "false" "" ""
    echo -e "   ${YELLOW}请安装 Docker: https://docs.docker.com/get-docker/${NC}"
fi

# 检查 Docker Compose
COMPOSE_VERSION=$(docker-compose --version 2>/dev/null | cut -d' ' -f4 | cut -d',' -f1 || echo "")
if [ -n "$COMPOSE_VERSION" ]; then
    check_requirement "Docker Compose" "true" "" "$COMPOSE_VERSION"
else
    check_requirement "Docker Compose" "false" "" ""
    echo -e "   ${YELLOW}请安装 Docker Compose${NC}"
fi

echo ""
echo "📁 检查项目文件..."

# 检查关键文件
check_requirement ".env 文件" "test -f .env" "" ""
if [ ! -f .env ]; then
    echo -e "   ${YELLOW}请复制环境变量模板: cp .env.example .env${NC}"
fi

check_requirement "前端 package.json" "test -f frontend/package.json" "" ""
check_requirement "后端 package.json" "test -f backend/package.json" "" ""
check_requirement "Docker Compose 配置" "test -f docker-compose.yml" "" ""

echo ""
echo "🔧 检查项目依赖..."

# 检查前端依赖
if [ -d "frontend/node_modules" ]; then
    check_requirement "前端依赖" "true" "" "已安装"
else
    check_requirement "前端依赖" "false" "" ""
    echo -e "   ${YELLOW}请安装前端依赖: cd frontend && yarn install${NC}"
fi

# 检查后端依赖
if [ -d "backend/node_modules" ]; then
    check_requirement "后端依赖" "true" "" "已安装"
else
    check_requirement "后端依赖" "false" "" ""
    echo -e "   ${YELLOW}请安装后端依赖: cd backend && yarn install${NC}"
fi

echo ""
echo "📊 检查结果总结:"
echo "通过检查: $CHECKS_PASSED/$TOTAL_CHECKS"

if [ $CHECKS_PASSED -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}🎉 所有检查通过！环境配置正确。${NC}"
    echo ""
    echo -e "${GREEN}🚀 可以开始开发了！${NC}"
    echo "运行以下命令启动开发环境:"
    echo "  ./scripts/start-dev.sh"
    exit 0
else
    echo -e "${RED}❌ 有 $((TOTAL_CHECKS - CHECKS_PASSED)) 项检查未通过。${NC}"
    echo ""
    echo -e "${YELLOW}📚 请参考以下文档解决问题:${NC}"
    echo "  - docs/version-requirements.md"
    echo "  - README.md"
    exit 1
fi
