import React, { useState } from 'react';
import styled from 'styled-components';
import { useAtom } from 'jotai';
import { useGameStore } from '../../stores/gameStore';
import { 
  availableActionsAtom, 
  selectedActionAtom, 
  canSubmitActionAtom,
  addNotificationAtom 
} from '../../atoms/gameAtoms';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { PlayerAction } from '../../types';

const ActionContainer = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md};
  height: fit-content;
`;

const ActionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: ${({ theme }) => theme.spacing.md};
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

const ActionName = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ActionDescription = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

const ActionType = styled.span<{ type: string }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ type, theme }) => {
    switch (type) {
      case 'business':
        return theme.colors.game.money + '20';
      case 'social':
        return theme.colors.game.connections + '20';
      case 'personal':
        return theme.colors.game.health + '20';
      case 'investment':
        return theme.colors.game.reputation + '20';
      default:
        return theme.colors.background.tertiary;
    }
  }};
  color: ${({ type, theme }) => {
    switch (type) {
      case 'business':
        return theme.colors.game.money;
      case 'social':
        return theme.colors.game.connections;
      case 'personal':
        return theme.colors.game.health;
      case 'investment':
        return theme.colors.game.reputation;
      default:
        return theme.colors.text.secondary;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ActionDetails = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const ReasoningInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ActionPanel: React.FC = () => {
  const { submitAction, isProcessing, currentGame } = useGameStore();
  const [availableActions] = useAtom(availableActionsAtom);
  const [selectedAction, setSelectedAction] = useAtom(selectedActionAtom);
  const [canSubmitAction] = useAtom(canSubmitActionAtom);
  const [, addNotification] = useAtom(addNotificationAtom);
  
  const [reasoning, setReasoning] = useState('');

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
    const types = {
      business: '商业',
      social: '社交',
      personal: '个人',
      investment: '投资'
    };
    return types[type as keyof typeof types] || type;
  };

  if (isProcessing) {
    return (
      <ActionContainer>
        <Card.Header>
          <Card.Title>行动选择</Card.Title>
        </Card.Header>
        <Card.Content>
          <EmptyState>
            <div style={{ marginBottom: '1rem' }}>🤖</div>
            <div>AI正在处理回合...</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#666' }}>
              请稍候，其他角色正在做出决策
            </div>
          </EmptyState>
        </Card.Content>
      </ActionContainer>
    );
  }

  if (!availableActions || availableActions.length === 0) {
    return (
      <ActionContainer>
        <Card.Header>
          <Card.Title>行动选择</Card.Title>
        </Card.Header>
        <Card.Content>
          <EmptyState>
            <div style={{ marginBottom: '1rem' }}>⏳</div>
            <div>暂无可用行动</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#666' }}>
              等待游戏状态更新...
            </div>
          </EmptyState>
        </Card.Content>
      </ActionContainer>
    );
  }

  return (
    <ActionContainer>
      <Card.Header>
        <Card.Title>行动选择</Card.Title>
        <Card.Subtitle>选择您这回合的行动</Card.Subtitle>
      </Card.Header>
      
      <Card.Content>
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

            <ButtonGroup>
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setSelectedAction(null);
                  setReasoning('');
                }}
              >
                取消
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleSubmitAction}
                disabled={!canSubmitAction || !reasoning.trim()}
                fullWidth
              >
                提交行动
              </Button>
            </ButtonGroup>
          </ActionDetails>
        )}
      </Card.Content>
    </ActionContainer>
  );
};

export default ActionPanel;
