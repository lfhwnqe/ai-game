import React, { useState } from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../stores/gameStore';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';

const HistoryContainer = styled(Card)`
  height: 300px;
  display: flex;
  flex-direction: column;
`;

const HistoryContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const HistoryTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const HistoryTab = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ active, theme }) => 
    active ? theme.colors.primary + '20' : 'transparent'
  };
  color: ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.text.secondary
  };
  border: none;
  border-bottom: 2px solid ${({ active, theme }) => 
    active ? theme.colors.primary : 'transparent'
  };
  cursor: pointer;
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  transition: all ${({ theme }) => theme.animations.duration.normal};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}10;
  }
`;

const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const HistoryItem = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.animations.duration.normal};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}05;
  }
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const HistoryTitle = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const HistoryTime = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const HistoryDescription = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: center;
`;

type HistoryTab = 'actions' | 'events' | 'results';

const GameHistory: React.FC = () => {
  const { actionHistory, gameState } = useGameStore();
  const [activeTab, setActiveTab] = useState<HistoryTab>('actions');

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderActionHistory = () => {
    if (!actionHistory || actionHistory.length === 0) {
      return (
        <EmptyState>
          <div style={{ marginBottom: '1rem' }}>📝</div>
          <div>暂无行动记录</div>
        </EmptyState>
      );
    }

    return (
      <HistoryList>
        {actionHistory.slice().reverse().map((item, index) => (
          <HistoryItem key={index}>
            <HistoryHeader>
              <HistoryTitle>
                第{item.roundNumber}回合: {item.action.actionName}
              </HistoryTitle>
              <HistoryTime>
                {formatTimestamp(item.timestamp)}
              </HistoryTime>
            </HistoryHeader>
            <HistoryDescription>
              {item.action.actionData.reasoning}
            </HistoryDescription>
          </HistoryItem>
        ))}
      </HistoryList>
    );
  };

  const renderEventHistory = () => {
    const events = gameState?.recentEvents || [];
    
    if (events.length === 0) {
      return (
        <EmptyState>
          <div style={{ marginBottom: '1rem' }}>📰</div>
          <div>暂无事件记录</div>
        </EmptyState>
      );
    }

    return (
      <HistoryList>
        {events.map((event, index) => (
          <HistoryItem key={index}>
            <HistoryHeader>
              <HistoryTitle>{event.title}</HistoryTitle>
              <HistoryTime>
                {formatTimestamp(event.timestamp)}
              </HistoryTime>
            </HistoryHeader>
            <HistoryDescription>
              {event.description}
            </HistoryDescription>
          </HistoryItem>
        ))}
      </HistoryList>
    );
  };

  const renderResultHistory = () => {
    if (!actionHistory || actionHistory.length === 0) {
      return (
        <EmptyState>
          <div style={{ marginBottom: '1rem' }}>📊</div>
          <div>暂无结果记录</div>
        </EmptyState>
      );
    }

    return (
      <HistoryList>
        {actionHistory.slice().reverse().map((item, index) => {
          if (!item.result) return null;
          
          return (
            <HistoryItem key={index}>
              <HistoryHeader>
                <HistoryTitle>
                  第{item.roundNumber}回合结果
                </HistoryTitle>
                <HistoryTime>
                  {formatTimestamp(item.timestamp)}
                </HistoryTime>
              </HistoryHeader>
              <HistoryDescription>
                AI行动: {item.result.aiActions?.length || 0}个 | 
                事件: {item.result.events?.length || 0}个 | 
                关系变化: {item.result.relationshipChanges?.length || 0}个
              </HistoryDescription>
            </HistoryItem>
          );
        }).filter(Boolean)}
      </HistoryList>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'actions':
        return renderActionHistory();
      case 'events':
        return renderEventHistory();
      case 'results':
        return renderResultHistory();
      default:
        return null;
    }
  };

  return (
    <HistoryContainer>
      <Card.Header>
        <Card.Title>游戏历史</Card.Title>
      </Card.Header>
      
      <HistoryContent>
        <HistoryTabs>
          <HistoryTab
            active={activeTab === 'actions'}
            onClick={() => setActiveTab('actions')}
          >
            我的行动
          </HistoryTab>
          <HistoryTab
            active={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
          >
            游戏事件
          </HistoryTab>
          <HistoryTab
            active={activeTab === 'results'}
            onClick={() => setActiveTab('results')}
          >
            回合结果
          </HistoryTab>
        </HistoryTabs>
        
        {renderTabContent()}
      </HistoryContent>
    </HistoryContainer>
  );
};

export default GameHistory;
