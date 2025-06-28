import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { GameService } from './game.service';
import { CharactersService } from '../characters/characters.service';
import { AiService } from '../ai/ai.service';
import { Game } from './schemas/game.schema';
import { GameState } from './schemas/game-state.schema';
import { PlayerAction } from './schemas/player-action.schema';

describe('GameService', () => {
  let service: GameService;
  let mockGameModel: any;
  let mockGameStateModel: any;
  let mockPlayerActionModel: any;

  beforeEach(async () => {
    // 创建模拟的模型
    mockGameModel = {
      findOne: jest.fn(),
      save: jest.fn(),
      exec: jest.fn(),
    };

    mockGameStateModel = {
      findOne: jest.fn(),
      save: jest.fn(),
      exec: jest.fn(),
    };

    mockPlayerActionModel = {
      save: jest.fn(),
    };

    // 创建模拟的服务
    const mockCharactersService = {
      getAllCharacters: jest.fn(),
    };

    const mockAiService = {
      generateAIActions: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          'game.balance.initialMoney': 100000,
          'game.balance.initialReputation': 50,
          'game.balance.maxActionPoints': 3,
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: getModelToken(Game.name),
          useValue: mockGameModel,
        },
        {
          provide: getModelToken(GameState.name),
          useValue: mockGameStateModel,
        },
        {
          provide: getModelToken(PlayerAction.name),
          useValue: mockPlayerActionModel,
        },
        {
          provide: CharactersService,
          useValue: mockCharactersService,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGame', () => {
    it('should create a new game', async () => {
      const playerId = 'test-player-id';
      const difficulty = 'standard';

      // 模拟保存操作
      const mockGame = {
        gameId: expect.any(String),
        playerId,
        difficulty,
        status: 'waiting',
        save: jest.fn().mockResolvedValue(true),
      };

      mockGameModel.mockImplementation(() => mockGame);

      const result = await service.createGame(playerId, difficulty);

      expect(result).toBeDefined();
      expect(result.playerId).toBe(playerId);
      expect(result.difficulty).toBe(difficulty);
      expect(result.status).toBe('waiting');
      expect(mockGame.save).toHaveBeenCalled();
    });
  });

  describe('generateGameId', () => {
    it('should generate unique game IDs', () => {
      // 使用反射访问私有方法进行测试
      const gameId1 = (service as any).generateGameId();
      const gameId2 = (service as any).generateGameId();

      expect(gameId1).toMatch(/^game_\d+_[a-z0-9]+$/);
      expect(gameId2).toMatch(/^game_\d+_[a-z0-9]+$/);
      expect(gameId1).not.toBe(gameId2);
    });
  });
});
