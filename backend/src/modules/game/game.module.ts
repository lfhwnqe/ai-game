import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';

// 导入数据模型
import { Game, GameSchema } from './schemas/game.schema';
import { GameState, GameStateSchema } from './schemas/game-state.schema';
import { PlayerAction, PlayerActionSchema } from './schemas/player-action.schema';

// 导入其他模块
import { CharactersModule } from '../characters/characters.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: GameState.name, schema: GameStateSchema },
      { name: PlayerAction.name, schema: PlayerActionSchema },
    ]),
    CharactersModule,
    AiModule,
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway],
  exports: [GameService],
})
export class GameModule {}
