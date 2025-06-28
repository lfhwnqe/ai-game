# 使用官方Node.js 22镜像
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 安装yarn
RUN npm install -g yarn

# 复制package.json和yarn.lock
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 暴露端口
EXPOSE 3001

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 切换到非root用户
USER nestjs

# 启动应用
CMD ["yarn", "start:prod"]
