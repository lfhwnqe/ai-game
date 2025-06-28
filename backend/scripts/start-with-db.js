#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🎮 启动AI游戏项目（包含数据库）...\n');

// 检查Docker是否运行
function checkDocker() {
  return new Promise((resolve) => {
    exec('docker info', (error) => {
      if (error) {
        console.log('⚠️  Docker未运行，将只启动应用服务');
        console.log('💡 如需完整功能，请启动Docker Desktop并运行数据库');
        resolve(false);
      } else {
        console.log('✅ Docker运行正常');
        resolve(true);
      }
    });
  });
}

// 启动数据库服务
function startDatabases() {
  return new Promise((resolve, reject) => {
    console.log('📦 启动数据库服务...');
    
    const dbProcess = spawn('docker-compose', ['up', '-d', 'mongodb', 'neo4j', 'redis'], {
      cwd: path.join(__dirname, '../..'),
      stdio: 'inherit'
    });

    dbProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 数据库服务启动成功');
        resolve();
      } else {
        reject(new Error(`数据库启动失败，退出码: ${code}`));
      }
    });
  });
}

// 等待数据库就绪
function waitForDatabases() {
  return new Promise((resolve) => {
    console.log('⏳ 等待数据库服务就绪...');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      // 检查MongoDB
      exec('docker-compose exec -T mongodb mongosh --eval "db.runCommand(\'ping\')" --quiet', {
        cwd: path.join(__dirname, '../..')
      }, (error) => {
        if (!error) {
          console.log('✅ MongoDB就绪');
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          console.log('⚠️  数据库启动超时，但继续启动应用...');
          clearInterval(checkInterval);
          resolve();
        } else {
          process.stdout.write('.');
        }
      });
    }, 2000);
  });
}

// 启动NestJS应用
function startApp() {
  console.log('\n🚀 启动NestJS应用...');
  
  const appProcess = spawn('npm', ['run', 'start:dev'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  appProcess.on('close', (code) => {
    console.log(`\n应用退出，退出码: ${code}`);
  });

  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('\n🛑 正在停止服务...');
    appProcess.kill('SIGINT');
    process.exit(0);
  });
}

// 主函数
async function main() {
  try {
    const dockerRunning = await checkDocker();

    if (dockerRunning) {
      await startDatabases();
      await waitForDatabases();

      console.log('\n🎉 项目启动完成！');
      console.log('📱 访问地址:');
      console.log('  后端API: http://localhost:3001/api');
      console.log('  API文档: http://localhost:3001/api/docs (如果配置了Swagger)');
      console.log('  Neo4j浏览器: http://localhost:7474 (用户名: neo4j, 密码: password)');
      console.log('\n💡 提示:');
      console.log('  - 按 Ctrl+C 停止服务');
      console.log('  - 运行 "npm run db:logs" 查看数据库日志');
      console.log('  - 运行 "npm run db:down" 停止数据库');
    } else {
      console.log('\n🚀 仅启动应用服务（无数据库）...');
      console.log('📱 访问地址: http://localhost:3001/api');
      console.log('⚠️  注意：某些功能可能因缺少数据库而无法正常工作');
    }

    startApp();

  } catch (error) {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
  }
}

main();
