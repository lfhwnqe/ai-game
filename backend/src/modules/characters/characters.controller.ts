import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Body, 
  Param, 
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CharactersService } from './characters.service';

@Controller('characters')
@UseGuards(JwtAuthGuard)
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  /**
   * 获取所有角色
   */
  @Get()
  async getAllCharacters(@Query('type') type?: string) {
    const characters = type
      ? await this.charactersService.getCharactersByType(type)
      : await this.charactersService.getAllCharacters();

    return {
      success: true,
      data: characters,
    };
  }

  /**
   * 获取角色统计信息
   */
  @Get('stats')
  async getCharacterStats() {
    const stats = await this.charactersService.getCharacterStats();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * 获取最有影响力的角色
   */
  @Get('stats/influential')
  async getMostInfluentialCharacters(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    const characters = await this.charactersService.getMostInfluentialCharacters(limitNum);

    return {
      success: true,
      data: characters,
    };
  }

  /**
   * 获取单个角色详情
   */
  @Get(':characterId')
  async getCharacter(@Param('characterId') characterId: string) {
    const character = await this.charactersService.getCharacterById(characterId);

    return {
      success: true,
      data: character,
    };
  }

  /**
   * 获取角色关系
   */
  @Get(':characterId/relationships')
  async getCharacterRelationships(@Param('characterId') characterId: string) {
    const relationships = await this.charactersService.getCharacterRelationships(characterId);

    return {
      success: true,
      data: relationships,
    };
  }

  /**
   * 获取角色社交网络
   */
  @Get(':characterId/network')
  async getCharacterNetwork(
    @Param('characterId') characterId: string,
    @Query('depth') depth?: string,
  ) {
    const networkDepth = depth ? parseInt(depth) : 2;
    const network = await this.charactersService.getCharacterNetwork(characterId, networkDepth);

    return {
      success: true,
      data: network,
    };
  }

  /**
   * 查找两个角色之间的连接路径
   */
  @Get(':fromId/path/:toId')
  async findConnectionPath(
    @Param('fromId') fromId: string,
    @Param('toId') toId: string,
  ) {
    const path = await this.charactersService.findConnectionPath(fromId, toId);

    return {
      success: true,
      data: path,
    };
  }

  /**
   * 获取角色的潜在合作伙伴
   */
  @Get(':characterId/potential-partners')
  async getPotentialPartners(@Param('characterId') characterId: string) {
    const partners = await this.charactersService.getPotentialPartners(characterId);
    
    return {
      success: true,
      data: partners,
    };
  }

  /**
   * 更新角色状态
   */
  @Put(':characterId/status')
  async updateCharacterStatus(
    @Param('characterId') characterId: string,
    @Body() statusUpdate: any,
  ) {
    const character = await this.charactersService.updateCharacterStatus(
      characterId,
      statusUpdate,
    );
    
    return {
      success: true,
      data: character,
      message: 'Character status updated successfully',
    };
  }

  /**
   * 更新角色关系强度
   */
  @Put(':fromId/relationships/:toId')
  async updateRelationshipStrength(
    @Param('fromId') fromId: string,
    @Param('toId') toId: string,
    @Body() updateData: { strengthChange: number; reason?: string },
  ) {
    await this.charactersService.updateRelationshipStrength(
      fromId,
      toId,
      updateData.strengthChange,
      updateData.reason,
    );
    
    return {
      success: true,
      message: 'Relationship updated successfully',
    };
  }
}
