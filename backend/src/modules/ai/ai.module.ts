import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DecisionEngineService } from './services/decision-engine.service';
import { PromptService } from './services/prompt.service';
import { CacheService } from './services/cache.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    AiService,
    DecisionEngineService,
    PromptService,
    CacheService,
  ],
  exports: [AiService, DecisionEngineService],
})
export class AiModule {}
