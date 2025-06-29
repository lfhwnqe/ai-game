import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAtom } from 'jotai';
import { useGameStore } from '../stores/gameStore';
import { useAuth } from '../stores/authStore';
import { useGameSocket } from '../hooks/useSocket';
import { addNotificationAtom } from '../atoms/gameAtoms';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import GameBoard from '../components/Game/GameBoard';
import PlayerStats from '../components/Game/PlayerStats';
import ActionPanel from '../components/Game/ActionPanel';
import GameHistory from '../components/Game/GameHistory';

const GamePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; /* 确保容器可以收缩 */
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: ${({ theme }) => theme.spacing.md};
  height: 100%;
  min-height: 0; /* 确保网格项可以收缩 */
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const MainGameArea = styled.div`
  grid-column: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  min-height: 0; /* 确保flex项可以收缩 */

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-column: 1;
    grid-row: 2;
  }
`;

const SidePanel = styled.div`
  grid-column: 2;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  min-height: 0; /* 确保flex项可以收缩 */
  min-width: 320px; /* 确保最小宽度 */

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-column: 1;
    grid-row: 1;
    min-width: auto;
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
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const {
    currentGame,
    gameState,
    availableActions,
    isLoading,
    error,
    loadGame,
    startGame,
    clearError,
  } = useGameStore();

  const { user } = useAuth();
  const [, addNotification] = useAtom(addNotificationAtom);

  // WebSocket 连接
  const { isConnected } = useGameSocket(gameId);

  console.log('GamePage状态:', {
    gameId,
    currentGame: currentGame?.gameId,
    gameStatus: currentGame?.status,
    gameState: gameState?.currentRound,
    isLoading,
    user: user?.username,
    hasGameState: !!gameState,
    hasAvailableActions: !!availableActions?.length
  });

  // 根据URL参数加载特定游戏
  useEffect(() => {
    if (!gameId || !user?.userId) {
      return;
    }

    const loadSpecificGame = async () => {
      console.log('加载游戏:', gameId);

      try {
        await loadGame(gameId);
        console.log('游戏加载成功');
      } catch (error: any) {
        console.error('加载游戏失败:', error);
        addNotification({
          type: 'error',
          title: '加载失败',
          message: error.message || '无法加载游戏，请返回游戏列表',
        });

        // 3秒后自动跳转到游戏列表
        setTimeout(() => {
          navigate('/games');
        }, 3000);
      }
    };

    loadSpecificGame();
  }, [gameId, user?.userId, loadGame, navigate, addNotification]);

  useEffect(() => {
    // 清除错误
    if (error) {
      clearError();
    }
  }, [error, clearError]);

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

  const handleBackToList = () => {
    navigate('/games');
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

  // 如果没有gameId，跳转到游戏列表
  if (!gameId) {
    navigate('/games');
    return null;
  }

  // 如果正在加载
  if (isLoading) {
    return (
      <GamePageContainer>
        <Card>
          <LoadingContainer>
            <LoadingSpinner size="large" variant="dots" />
            <div>加载游戏中...</div>
          </LoadingContainer>
        </Card>
      </GamePageContainer>
    );
  }

  // 如果没有游戏，显示错误信息
  if (!currentGame) {
    return (
      <GamePageContainer>
        <Card>
          <Card.Header>
            <Card.Title>游戏未找到</Card.Title>
            <Card.Subtitle>无法加载指定的游戏</Card.Subtitle>
          </Card.Header>

          <Card.Content>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ marginBottom: '2rem', fontSize: '3rem' }}>😕</div>
              <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                游戏ID "{gameId}" 不存在或您没有访问权限
              </p>

              <Button
                variant="primary"
                size="large"
                onClick={handleBackToList}
              >
                返回游戏列表
              </Button>
            </div>
          </Card.Content>
        </Card>
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

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button
                  variant="secondary"
                  size="large"
                  onClick={handleBackToList}
                >
                  返回列表
                </Button>
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleStartGame}
                  disabled={isLoading}
                >
                  {isLoading ? '启动中...' : '开始游戏'}
                </Button>
              </div>
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
        <MainGameArea>
          <GameBoard />
          <GameHistory />
        </MainGameArea>

        <SidePanel>
          <div style={{ flexShrink: 0 }}>
            <PlayerStats />
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <ActionPanel />
          </div>
        </SidePanel>
      </GameGrid>
    </GamePageContainer>
  );
};

export default GamePage;
