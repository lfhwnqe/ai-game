# 使用官方Node.js 22镜像
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 启用Corepack以支持项目指定的包管理器版本
RUN corepack enable

# 复制package.json和yarn.lock
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S reactjs -u 1001

# 切换到非root用户
USER reactjs

# 启动开发服务器
CMD ["yarn", "dev", "--host", "0.0.0.0"]
