import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAtom } from 'jotai';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { addNotificationAtom } from '../atoms/gameAtoms';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CreateContainer = styled.div`
  max-width: 600px;
  width: 100%;
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

const GameSetupForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
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

const Description = styled.p`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.spacing.xs};
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const BackButton = styled(Button)`
  flex: 1;
`;

const CreateButton = styled(Button)`
  flex: 2;
`;

const GameCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createGame, isLoading } = useGameStore();
  const [, addNotification] = useAtom(addNotificationAtom);

  const [gameConfig, setGameConfig] = useState({
    difficulty: 'standard' as 'easy' | 'standard' | 'hard',
    winCondition: 'wealth' as 'wealth' | 'reputation' | 'influence',
  });

  const handleCreateGame = async () => {
    if (!user?.userId) {
      addNotification({
        type: 'error',
        title: '创建失败',
        message: '请先登录',
      });
      return;
    }

    try {
      await createGame(gameConfig);
      
      addNotification({
        type: 'success',
        title: '游戏创建成功',
        message: '正在跳转到游戏列表...',
      });

      // 跳转回游戏列表
      setTimeout(() => {
        navigate('/games');
      }, 1000);
      
    } catch (error: any) {
      console.error('创建游戏失败:', error);
      addNotification({
        type: 'error',
        title: '创建失败',
        message: error.message || '创建游戏时发生错误',
      });
    }
  };

  const handleBack = () => {
    navigate('/games');
  };

  const getDifficultyDescription = (difficulty: string): string => {
    const descriptions = {
      easy: '较多的初始资金，较低的市场波动，适合新手玩家',
      standard: '标准的游戏体验，平衡的挑战和奖励',
      hard: '有限的初始资金，高市场波动，适合有经验的玩家'
    };
    return descriptions[difficulty as keyof typeof descriptions] || '';
  };

  const getWinConditionDescription = (winCondition: string): string => {
    const descriptions = {
      wealth: '通过商业投资和贸易积累财富，达到指定金额即可获胜',
      reputation: '通过社交活动和慈善事业建立声望，成为深圳知名人士',
      influence: '通过政商关系和媒体影响力，成为深圳的重要决策者'
    };
    return descriptions[winCondition as keyof typeof descriptions] || '';
  };

  return (
    <PageContainer>
      <CreateContainer>
        <Header>
          <Title>创建新游戏</Title>
          <Subtitle>配置您的深圳1980商业之旅</Subtitle>
        </Header>

        <Card>
          <Card.Header>
            <Card.Title>游戏设置</Card.Title>
            <Card.Subtitle>选择难度和胜利条件</Card.Subtitle>
          </Card.Header>

          <Card.Content>
            <GameSetupForm>
              <FormGroup>
                <Label htmlFor="difficulty">游戏难度</Label>
                <Select
                  id="difficulty"
                  value={gameConfig.difficulty}
                  onChange={(e) => setGameConfig(prev => ({
                    ...prev,
                    difficulty: e.target.value as 'easy' | 'standard' | 'hard'
                  }))}
                >
                  <option value="easy">简单</option>
                  <option value="standard">标准</option>
                  <option value="hard">困难</option>
                </Select>
                <Description>
                  {getDifficultyDescription(gameConfig.difficulty)}
                </Description>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="winCondition">胜利条件</Label>
                <Select
                  id="winCondition"
                  value={gameConfig.winCondition}
                  onChange={(e) => setGameConfig(prev => ({
                    ...prev,
                    winCondition: e.target.value as 'wealth' | 'reputation' | 'influence'
                  }))}
                >
                  <option value="wealth">财富目标</option>
                  <option value="reputation">声望目标</option>
                  <option value="influence">影响力目标</option>
                </Select>
                <Description>
                  {getWinConditionDescription(gameConfig.winCondition)}
                </Description>
              </FormGroup>

              <ButtonGroup>
                <BackButton
                  variant="secondary"
                  size="large"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  返回列表
                </BackButton>
                <CreateButton
                  variant="primary"
                  size="large"
                  onClick={handleCreateGame}
                  disabled={isLoading}
                >
                  {isLoading ? '创建中...' : '创建游戏'}
                </CreateButton>
              </ButtonGroup>
            </GameSetupForm>
          </Card.Content>
        </Card>
      </CreateContainer>
    </PageContainer>
  );
};

export default GameCreatePage;
