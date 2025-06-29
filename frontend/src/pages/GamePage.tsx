import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAtom } from 'jotai';
import { useGameStore } from '../stores/gameStore';
import { useGameSocket } from '../hooks/useSocket';
import { useAuth } from '../stores/authStore';
import { gameOverviewAtom, addNotificationAtom } from '../atoms/gameAtoms';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import GameBoard from '../components/Game/GameBoard';
import PlayerStats from '../components/Game/PlayerStats';
import ActionPanel from '../components/Game/ActionPanel';
import GameHistory from '../components/Game/GameHistory';
import { gameService } from '../services/gameService';

const GamePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  height: 100%;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto;
  }
`;

const MainGameArea = styled.div`
  grid-column: 1;
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-column: 1;
    grid-row: 2;
  }
`;

const SidePanel = styled.div`
  grid-column: 2;
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-column: 1;
    grid-row: 1;
  }
`;

const WelcomeCard = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const WelcomeTitle = styled.h1`
  font-size: ${({ theme }) => theme.fonts.sizes.title};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-family: 'Orbitron', ${({ theme }) => theme.fonts.primary};
  text-shadow: ${({ theme }) => theme.shadows.glow};
`;

const WelcomeText = styled.p`
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
`;

const GameSetupForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 400px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primary};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: ${({ theme }) => theme.spacing.md};
`;

const GamePage: React.FC = () => {
  console.log('GamePage组件渲染');

  const {
    currentGame,
    gameState,
    isLoading,
    error,
    createGame,
    loadGame,
    startGame,
    clearError,
  } = useGameStore();

  const { user } = useAuth();
  const [gameOverview] = useAtom(gameOverviewAtom);
  const [, addNotification] = useAtom(addNotificationAtom);
  const [hasCheckedExistingGame, setHasCheckedExistingGame] = useState(false);

  console.log('GamePage状态:', {
    currentGame: currentGame?.gameId,
    isLoading,
    hasCheckedExistingGame,
    user: user?.username
  });

  const [gameConfig, setGameConfig] = useState({
    difficulty: 'standard' as 'easy' | 'standard' | 'hard',
    winCondition: 'wealth' as 'wealth' | 'reputation' | 'influence',
  });

  // 初始化WebSocket连接
  useGameSocket(currentGame?.gameId);

  // 检查用户是否有现有游戏
  useEffect(() => {
    const checkExistingGame = async () => {
      const token = localStorage.getItem('auth_token');
      console.log('useEffect 触发，检查条件:', {
        userId: user?.userId,
        hasCheckedExistingGame,
        currentGame: !!currentGame,
        hasToken: !!token,
        user: user
      });

      if (!user?.userId || hasCheckedExistingGame || currentGame) {
        console.log('跳过检查，条件不满足');
        if (!hasCheckedExistingGame && !currentGame && user?.userId) {
          setHasCheckedExistingGame(true);
        }
        return;
      }

      try {
        console.log('开始检查用户现有游戏...');
        const userGames = await gameService.getUserGames();
        console.log('获取到用户游戏列表:', userGames);

        // 查找进行中的游戏
        const activeGame = userGames.find(game =>
          game.status === 'active' || game.status === 'waiting'
        );

        if (activeGame) {
          console.log('找到现有游戏:', activeGame);
          await loadGame(activeGame.gameId);
          addNotification({
            type: 'info',
            title: '游戏已恢复',
            message: '已为您恢复之前的游戏进度',
          });
        } else {
          console.log('未找到现有游戏，用户可以创建新游戏');
        }
      } catch (error) {
        console.error('检查现有游戏失败:', error);
        // 不显示错误通知，让用户正常创建新游戏
      } finally {
        console.log('检查完成，设置hasCheckedExistingGame为true');
        setHasCheckedExistingGame(true);
      }
    };

    checkExistingGame();
  }, [user?.userId, hasCheckedExistingGame, currentGame]);

  useEffect(() => {
    // 清除错误
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleCreateGame = async () => {
    try {
      await createGame(gameConfig);
      addNotification({
        type: 'success',
        title: '游戏创建成功',
        message: '准备开始您的深圳1980商业之旅！',
      });
    } catch (error) {
      console.error('创建游戏失败:', error);
    }
  };

  const handleStartGame = async () => {
    if (!currentGame) return;
    
    try {
      await startGame(currentGame.gameId);
      addNotification({
        type: 'success',
        title: '游戏开始',
        message: '欢迎来到1980年的深圳！',
      });
    } catch (error) {
      console.error('开始游戏失败:', error);
    }
  };

  const getDifficultyName = (difficulty: string): string => {
    const names = {
      easy: '简单',
      standard: '标准',
      hard: '困难'
    };
    return names[difficulty as keyof typeof names] || difficulty;
  };

  const getWinConditionName = (condition: string): string => {
    const names = {
      wealth: '财富积累',
      reputation: '声望建立',
      influence: '影响力扩张'
    };
    return names[condition as keyof typeof names] || condition;
  };

  // 如果正在加载或还在检查现有游戏
  if (isLoading || !hasCheckedExistingGame) {
    return (
      <GamePageContainer>
        <Card>
          <LoadingContainer>
            <LoadingSpinner size="large" variant="dots" />
            <div>{!hasCheckedExistingGame ? '检查游戏状态中...' : '加载游戏中...'}</div>
          </LoadingContainer>
        </Card>
      </GamePageContainer>
    );
  }

  // 如果没有游戏，显示创建游戏界面
  if (!currentGame) {
    return (
      <GamePageContainer>
        <WelcomeCard>
          <WelcomeTitle>欢迎来到深圳1980</WelcomeTitle>
          <WelcomeText>
            在这个AI驱动的商业模拟游戏中，您将体验1980年代深圳的创业传奇。
            与50个AI角色互动，建立商业帝国，成为时代的传奇人物。
          </WelcomeText>
          
          <GameSetupForm>
            <FormGroup>
              <Label>游戏难度</Label>
              <Select
                value={gameConfig.difficulty}
                onChange={(e) => setGameConfig(prev => ({
                  ...prev,
                  difficulty: e.target.value as any
                }))}
              >
                <option value="easy">简单 - 适合新手</option>
                <option value="standard">标准 - 平衡体验</option>
                <option value="hard">困难 - 挑战极限</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>胜利条件</Label>
              <Select
                value={gameConfig.winCondition}
                onChange={(e) => setGameConfig(prev => ({
                  ...prev,
                  winCondition: e.target.value as any
                }))}
              >
                <option value="wealth">财富积累 - 成为最富有的人</option>
                <option value="reputation">声望建立 - 获得最高声望</option>
                <option value="influence">影响力扩张 - 建立最大影响力</option>
              </Select>
            </FormGroup>

            <Button
              variant="primary"
              size="large"
              onClick={handleCreateGame}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? '创建中...' : '开始新游戏'}
            </Button>
          </GameSetupForm>
        </WelcomeCard>
      </GamePageContainer>
    );
  }

  // 如果游戏还未开始
  if (currentGame.status === 'waiting') {
    return (
      <GamePageContainer>
        <Card>
          <Card.Header>
            <Card.Title>游戏设置</Card.Title>
            <Card.Subtitle>
              难度: {getDifficultyName(currentGame.difficulty)} | 
              胜利条件: {getWinConditionName(currentGame.winCondition)}
            </Card.Subtitle>
          </Card.Header>
          
          <Card.Content>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                游戏已创建，准备开始您的深圳1980商业之旅！
              </p>
              
              <Button
                variant="primary"
                size="large"
                onClick={handleStartGame}
                disabled={isLoading}
              >
                {isLoading ? '启动中...' : '开始游戏'}
              </Button>
            </div>
          </Card.Content>
        </Card>
      </GamePageContainer>
    );
  }

  // 游戏进行中的界面
  return (
    <GamePageContainer>
      <GameGrid>
        <SidePanel>
          <PlayerStats />
          <ActionPanel />
        </SidePanel>
        
        <MainGameArea>
          <GameBoard />
          <GameHistory />
        </MainGameArea>
      </GameGrid>
    </GamePageContainer>
  );
};

export default GamePage;
