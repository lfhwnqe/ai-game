import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../stores/gameStore';
import { Card } from '../UI/Card';

const GameBoardContainer = styled(Card)`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0; /* 确保容器可以收缩 */
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  height: 100%;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const MarketPanel = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md};
`;

const MarketCondition = styled.div<{ condition: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ condition, theme }) => {
    switch (condition) {
      case 'boom':
        return theme.colors.status.success + '20';
      case 'recession':
        return theme.colors.status.error + '20';
      default:
        return theme.colors.status.info + '20';
    }
  }};
  border: 2px solid ${({ condition, theme }) => {
    switch (condition) {
      case 'boom':
        return theme.colors.status.success;
      case 'recession':
        return theme.colors.status.error;
      default:
        return theme.colors.status.info;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MarketIcon = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xl};
`;

const MarketInfo = styled.div`
  flex: 1;
`;

const MarketTitle = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MarketDescription = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EventsPanel = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md};
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 200px;
  overflow-y: auto;
`;

const EventItem = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const EventTitle = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const EventDescription = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

const RoundResultPanel = styled(Card)`
  grid-column: 1 / -1;
  padding: ${({ theme }) => theme.spacing.md};
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const ResultItem = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  text-align: center;
`;

const ResultLabel = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ResultValue = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const GameBoard: React.FC = () => {
  const { gameState, lastRoundResult } = useGameStore();

  const getMarketInfo = (condition: string) => {
    switch (condition) {
      case 'boom':
        return {
          icon: '📈',
          title: '经济繁荣',
          description: '市场活跃，投资机会增多，商业活动频繁'
        };
      case 'recession':
        return {
          icon: '📉',
          title: '经济衰退',
          description: '市场低迷，投资风险增大，需要谨慎决策'
        };
      default:
        return {
          icon: '📊',
          title: '市场稳定',
          description: '经济平稳发展，适合稳健投资和长期规划'
        };
    }
  };

  // 从游戏状态中获取市场条件和事件
  const marketCondition = gameState?.marketState?.condition || 'stable';
  const recentEvents = gameState?.recentNews || [];

  if (!gameState) {
    return (
      <GameBoardContainer>
        <Card.Header>
          <Card.Title>游戏面板</Card.Title>
        </Card.Header>
        <Card.Content>
          <EmptyState>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
            <div>等待游戏开始...</div>
          </EmptyState>
        </Card.Content>
      </GameBoardContainer>
    );
  }

  const marketInfo = getMarketInfo(marketCondition);

  return (
    <GameBoardContainer>
      <Card.Header>
        <Card.Title>游戏面板</Card.Title>
        <Card.Subtitle>第 {gameState.currentRound} 回合</Card.Subtitle>
      </Card.Header>
      
      <Card.Content style={{ flex: 1, overflow: 'hidden' }}>
        <BoardGrid>
          <MarketPanel>
            <Card.Header>
              <Card.Title>市场状况</Card.Title>
            </Card.Header>
            <Card.Content>
              <MarketCondition condition={marketCondition}>
                <MarketIcon>{marketInfo.icon}</MarketIcon>
                <MarketInfo>
                  <MarketTitle>{marketInfo.title}</MarketTitle>
                  <MarketDescription>{marketInfo.description}</MarketDescription>
                </MarketInfo>
              </MarketCondition>
            </Card.Content>
          </MarketPanel>

          <EventsPanel>
            <Card.Header>
              <Card.Title>最近事件</Card.Title>
            </Card.Header>
            <Card.Content>
              {recentEvents.length === 0 ? (
                <EmptyState style={{ height: 'auto', padding: '2rem' }}>
                  <div>暂无事件</div>
                </EmptyState>
              ) : (
                <EventsList>
                  {recentEvents.slice(0, 5).map((event, index) => (
                    <EventItem key={index}>
                      <EventTitle>{event.title}</EventTitle>
                      <EventDescription>{event.description}</EventDescription>
                    </EventItem>
                  ))}
                </EventsList>
              )}
            </Card.Content>
          </EventsPanel>
        </BoardGrid>

        {lastRoundResult && (
          <RoundResultPanel style={{ marginTop: '1rem' }}>
            <Card.Header>
              <Card.Title>上回合结果</Card.Title>
              <Card.Subtitle>第 {lastRoundResult.roundNumber || '未知'} 回合</Card.Subtitle>
            </Card.Header>
            <Card.Content>
              <ResultGrid>
                <ResultItem>
                  <ResultLabel>玩家行动</ResultLabel>
                  <ResultValue>
                    {lastRoundResult.playerAction?.actionName ||
                     lastRoundResult.actionName ||
                     '处理中...'}
                  </ResultValue>
                </ResultItem>
                <ResultItem>
                  <ResultLabel>AI行动数</ResultLabel>
                  <ResultValue>{lastRoundResult.aiActions?.length || 0}</ResultValue>
                </ResultItem>
                <ResultItem>
                  <ResultLabel>触发事件</ResultLabel>
                  <ResultValue>{lastRoundResult.events?.length || 0}</ResultValue>
                </ResultItem>
                <ResultItem>
                  <ResultLabel>关系变化</ResultLabel>
                  <ResultValue>{lastRoundResult.relationshipChanges?.length || 0}</ResultValue>
                </ResultItem>
              </ResultGrid>
            </Card.Content>
          </RoundResultPanel>
        )}
      </Card.Content>
    </GameBoardContainer>
  );
};

export default GameBoard;
