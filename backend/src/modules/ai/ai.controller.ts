import { 
  Controller, 
  Get, 
  Post,
  Body, 
  Param, 
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * 获取AI统计信息
   */
  @Get('stats')
  async getAIStats() {
    const stats = await this.aiService.getAIStats();
    
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * 评估角色关系
   */
  @Post('relationships/evaluate')
  async evaluateRelationship(@Body() evaluateDto: {
    characterId: string;
    targetCharacterId: string;
    interactionHistory: any[];
  }) {
    const evaluation = await this.aiService.evaluateRelationship(
      evaluateDto.characterId,
      evaluateDto.targetCharacterId,
      evaluateDto.interactionHistory
    );
    
    return {
      success: true,
      data: evaluation,
    };
  }

  /**
   * 生成事件响应
   */
  @Post('events/respond')
  async generateEventResponse(@Body() responseDto: {
    characterId: string;
    event: any;
    gameState: any;
  }) {
    const response = await this.aiService.generateEventResponse(
      responseDto.characterId,
      responseDto.event,
      responseDto.gameState
    );
    
    return {
      success: true,
      data: response,
    };
  }

  /**
   * 更新AI角色状态
   */
  @Post('characters/:characterId/state')
  async updateCharacterState(
    @Param('characterId') characterId: string,
    @Body() stateChanges: any,
  ) {
    await this.aiService.updateAICharacterState(characterId, stateChanges);
    
    return {
      success: true,
      message: 'AI character state updated successfully',
    };
  }
}
