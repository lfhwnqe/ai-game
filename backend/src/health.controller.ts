import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private configService: ConfigService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('NODE_ENV'),
      version: '1.0.0',
      services: {
        api: 'healthy',
        database: 'checking...',
        ai: 'checking...',
      },
    };
  }

  @Get('version')
  getVersion() {
    return {
      version: '1.0.0',
      name: 'AI Game Backend',
      description: 'AI驱动的深圳1980商业模拟游戏后端',
      node: process.version,
      environment: this.configService.get('NODE_ENV'),
    };
  }
}
