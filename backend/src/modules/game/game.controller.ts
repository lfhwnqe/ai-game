import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { SubmitActionDto } from './dto/submit-action.dto';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  /**
   * 创建新游戏
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGame(@Request() req, @Body() createGameDto: CreateGameDto) {
    const playerId = req.user.userId;
    const game = await this.gameService.createGame(
      playerId, 
      createGameDto.difficulty
    );
    
    return {
      success: true,
      data: game,
      message: 'Game created successfully',
    };
  }

  /**
   * 获取游戏信息
   */
  @Get(':gameId')
  async getGame(@Param('gameId') gameId: string) {
    const game = await this.gameService.getGame(gameId);
    
    return {
      success: true,
      data: game,
    };
  }

  /**
   * 获取当前游戏状态
   */
  @Get(':gameId/state')
  async getGameState(@Param('gameId') gameId: string) {
    const gameState = await this.gameService.getCurrentGameState(gameId);
    
    return {
      success: true,
      data: gameState,
    };
  }

  /**
   * 开始游戏
   */
  @Post(':gameId/start')
  @HttpCode(HttpStatus.OK)
  async startGame(@Param('gameId') gameId: string) {
    const game = await this.gameService.startGame(gameId);
    
    return {
      success: true,
      data: game,
      message: 'Game started successfully',
    };
  }

  /**
   * 提交玩家行动
   */
  @Post(':gameId/actions')
  @HttpCode(HttpStatus.ACCEPTED)
  async submitAction(
    @Param('gameId') gameId: string,
    @Request() req,
    @Body() submitActionDto: SubmitActionDto,
  ) {
    const playerId = req.user.userId;
    const playerAction = await this.gameService.submitPlayerAction(
      gameId,
      playerId,
      submitActionDto,
    );
    
    return {
      success: true,
      data: playerAction,
      message: 'Action submitted successfully',
    };
  }

  /**
   * 获取玩家行动历史
   */
  @Get(':gameId/actions')
  async getActionHistory(@Param('gameId') gameId: string, @Request() req) {
    // TODO: 实现获取行动历史的逻辑
    return {
      success: true,
      data: [],
      message: 'Action history retrieved successfully',
    };
  }

  /**
   * 获取游戏统计信息
   */
  @Get(':gameId/stats')
  async getGameStats(@Param('gameId') gameId: string) {
    // TODO: 实现获取游戏统计的逻辑
    return {
      success: true,
      data: {},
      message: 'Game stats retrieved successfully',
    };
  }
}
