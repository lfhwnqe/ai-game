import React, { useState } from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../stores/gameStore';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { PlayerAction, GameAction } from '../../types';

const ActionContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  min-height: 0; /* 确保容器可以收缩 */
  flex: 1; /* 占满可用高度 */
  overflow: hidden;
`;

const ActionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  max-height: 200px;
  overflow-y: auto;
  flex-shrink: 0;
`;

const ActionItem = styled.button<{ selected?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ selected, theme }) =>
    selected ? theme.colors.primary + '20' : theme.colors.background.tertiary
  };
  border: 2px solid ${({ selected, theme }) =>
    selected ? theme.colors.primary : theme.colors.border.primary
  };
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  text-align: left;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.duration.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}10;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionType = styled.div<{ type: string }>`
  font-size: 0.8rem;
  font-weight: bold;
  color: ${({ type, theme }) => {
    switch (type) {
      case 'business': return theme.colors.success;
      case 'social': return theme.colors.info;
      case 'political': return theme.colors.warning;
      case 'personal': return theme.colors.primary;
      default: return theme.colors.text.muted;
    }
  }};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  text-transform: uppercase;
`;

const ActionName = styled.div`
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ActionDescription = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.4;
`;

const ActionDetails = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const ReasoningInput = styled.textarea`
  width: 100%;
  min-height: 100px;
  max-height: 150px;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 2px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ActionPanel: React.FC = () => {
  const { submitAction, isProcessing, currentGame, availableActions, addNotification } = useGameStore();

  const [selectedAction, setSelectedAction] = useState<GameAction | null>(null);
  const [reasoning, setReasoning] = useState('');

  console.log('ActionPanel状态:', {
    isProcessing,
    currentGameStatus: currentGame?.status,
    availableActionsCount: availableActions?.length || 0,
    availableActions: availableActions
  });

  const handleActionSelect = (action: any) => {
    setSelectedAction(action);
    setReasoning('');
  };

  const handleSubmitAction = async () => {
    if (!selectedAction || !currentGame || !reasoning.trim()) {
      addNotification({
        type: 'warning',
        title: '提交失败',
        message: '请选择行动并填写决策理由',
      });
      return;
    }

    const playerAction: PlayerAction = {
      actionId: selectedAction.actionId,
      actionType: selectedAction.actionType,
      actionName: selectedAction.actionName,
      actionData: {
        parameters: {},
        reasoning: reasoning.trim(),
      },
    };

    try {
      await submitAction(playerAction);
      setSelectedAction(null);
      setReasoning('');

      addNotification({
        type: 'success',
        title: '行动提交成功',
        message: `已提交"${selectedAction.actionName}"，等待AI处理...`,
      });
    } catch (error) {
      console.error('提交行动失败:', error);
    }
  };

  const getActionTypeText = (type: string): string => {
    const typeMap = {
      business: '商业',
      social: '社交',
      political: '政治',
      personal: '个人'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  if (!currentGame || currentGame.status !== 'active') {
    return (
      <ActionContainer>
        <Card.Header>
          <Card.Title>行动面板</Card.Title>
        </Card.Header>
        <Card.Content>
          <EmptyState>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div>等待游戏开始...</div>
          </EmptyState>
        </Card.Content>
      </ActionContainer>
    );
  }

  if (!availableActions || availableActions.length === 0) {
    return (
      <ActionContainer>
        <Card.Header>
          <Card.Title>行动面板</Card.Title>
          <Card.Subtitle>选择您的下一步行动</Card.Subtitle>
        </Card.Header>
        <Card.Content>
          <EmptyState>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            <div>正在加载可用行动...</div>
          </EmptyState>
        </Card.Content>
      </ActionContainer>
    );
  }

  return (
    <ActionContainer>
      <Card.Header>
        <Card.Title>行动面板</Card.Title>
        <Card.Subtitle>选择您的下一步行动</Card.Subtitle>
      </Card.Header>
      
      <Card.Content style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <ActionList>
          {availableActions.map((action) => (
            <ActionItem
              key={action.actionId}
              selected={selectedAction?.actionId === action.actionId}
              onClick={() => handleActionSelect(action)}
            >
              <ActionType type={action.actionType}>
                {getActionTypeText(action.actionType)}
              </ActionType>
              <ActionName>{action.actionName}</ActionName>
              <ActionDescription>{action.description}</ActionDescription>
            </ActionItem>
          ))}
        </ActionList>

        {selectedAction && (
          <ActionDetails>
            <div style={{ marginBottom: '1rem' }}>
              <strong>已选择：{selectedAction.actionName}</strong>
            </div>

            <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
              决策理由：
            </div>
            <ReasoningInput
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="请说明您选择这个行动的理由和策略考虑..."
              maxLength={500}
            />

            <div style={{
              fontSize: '0.8rem',
              color: '#666',
              marginTop: '0.5rem',
              textAlign: 'right'
            }}>
              {reasoning.length}/500
            </div>
          </ActionDetails>
        )}

        <SubmitButton
          variant="primary"
          size="large"
          onClick={handleSubmitAction}
          disabled={!selectedAction || !reasoning.trim() || isProcessing}
          style={{ marginTop: 'auto' }}
        >
          {isProcessing ? '处理中...' : '提交行动'}
        </SubmitButton>
      </Card.Content>
    </ActionContainer>
  );
};

export default ActionPanel;
