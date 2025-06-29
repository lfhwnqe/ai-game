import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAtom } from 'jotai';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { addNotificationAtom } from '../atoms/gameAtoms';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Game } from '../types';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fonts.sizes.xxl};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-shadow: 0 0 20px ${({ theme }) => theme.colors.primary}40;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const GameCard = styled(Card)<{ status: string }>`
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.duration.normal};
  border: 2px solid ${({ status, theme }) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'waiting':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.text.muted;
      case 'paused':
        return theme.colors.info;
      default:
        return theme.colors.border.primary;
    }
  }};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const GameStatus = styled.span<{ status: string }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  text-transform: uppercase;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'active':
        return theme.colors.success + '20';
      case 'waiting':
        return theme.colors.warning + '20';
      case 'completed':
        return theme.colors.text.muted + '20';
      case 'paused':
        return theme.colors.info + '20';
      default:
        return theme.colors.background.tertiary;
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'waiting':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.text.muted;
      case 'paused':
        return theme.colors.info;
      default:
        return theme.colors.text.secondary;
    }
  }};
`;

const GameInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const GameListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { gameHistory, isLoading, loadGameHistory } = useGameStore();
  const [, addNotification] = useAtom(addNotificationAtom);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      loadGameHistory();
    }
  }, [user?.userId, loadGameHistory]);

  const getStatusText = (status: string): string => {
    const statusMap = {
      active: '进行中',
      waiting: '等待开始',
      completed: '已完成',
      paused: '已暂停',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getDifficultyText = (difficulty: string): string => {
    const difficultyMap = {
      easy: '简单',
      standard: '标准',
      hard: '困难',
    };
    return difficultyMap[difficulty as keyof typeof difficultyMap] || difficulty;
  };

  const getWinConditionText = (winCondition: string): string => {
    const winConditionMap = {
      wealth: '财富目标',
      reputation: '声望目标',
      influence: '影响力目标',
    };
    return winConditionMap[winCondition as keyof typeof winConditionMap] || winCondition;
  };

  const handleGameSelect = (game: Game) => {
    if (game.status === 'completed') {
      addNotification({
        type: 'info',
        title: '游戏已完成',
        message: '该游戏已经结束，您可以查看历史记录',
      });
      return;
    }

    // 导航到游戏页面，并传递游戏ID
    navigate(`/game/${game.gameId}`);
  };

  const handleCreateNewGame = () => {
    navigate('/game/create');
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState>
          <div style={{ marginBottom: '1rem' }}>⏳</div>
          <div>加载游戏列表中...</div>
        </LoadingState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>深圳1980</Title>
        <Subtitle>我的游戏</Subtitle>
      </Header>

      <ContentContainer>
        <ActionsBar>
          <div>
            <h2 style={{ margin: 0, color: '#fff' }}>
              游戏列表 ({gameHistory.length})
            </h2>
          </div>
          <Button
            variant="primary"
            size="large"
            onClick={handleCreateNewGame}
          >
            + 创建新游戏
          </Button>
        </ActionsBar>

        {gameHistory.length === 0 ? (
          <EmptyState>
            <div style={{ marginBottom: '2rem', fontSize: '3rem' }}>🎮</div>
            <h3 style={{ marginBottom: '1rem' }}>还没有游戏</h3>
            <p style={{ marginBottom: '2rem' }}>
              开始您的深圳1980商业之旅吧！
            </p>
            <Button
              variant="primary"
              size="large"
              onClick={handleCreateNewGame}
            >
              创建第一个游戏
            </Button>
          </EmptyState>
        ) : (
          <GameGrid>
            {gameHistory.map((game) => (
              <GameCard
                key={game.gameId}
                status={game.status}
                onClick={() => handleGameSelect(game)}
              >
                <Card.Header>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Card.Title>游戏 #{game.gameId.split('_')[1]?.slice(-4)}</Card.Title>
                    <GameStatus status={game.status}>
                      {getStatusText(game.status)}
                    </GameStatus>
                  </div>
                  <Card.Subtitle>
                    {getDifficultyText(game.difficulty)} • {getWinConditionText(game.winCondition)}
                  </Card.Subtitle>
                </Card.Header>

                <Card.Content>
                  <GameInfo>
                    <span>回合: {game.currentRound || 1}</span>
                    <span>创建: {new Date(game.createdAt).toLocaleDateString()}</span>
                  </GameInfo>
                  
                  {game.status === 'active' && (
                    <div style={{ 
                      marginTop: '1rem', 
                      padding: '0.5rem', 
                      background: 'rgba(0, 255, 0, 0.1)', 
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      color: '#00ff00'
                    }}>
                      点击继续游戏
                    </div>
                  )}
                  
                  {game.status === 'waiting' && (
                    <div style={{ 
                      marginTop: '1rem', 
                      padding: '0.5rem', 
                      background: 'rgba(255, 255, 0, 0.1)', 
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      color: '#ffff00'
                    }}>
                      点击开始游戏
                    </div>
                  )}
                </Card.Content>
              </GameCard>
            ))}
          </GameGrid>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default GameListPage;
