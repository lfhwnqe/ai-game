import React from 'react';
import styled from 'styled-components';
import { useAtom } from 'jotai';
import { playerStatsAtom, gameTimeAtom } from '../../atoms/gameAtoms';
import { Card } from '../UI/Card';

const StatsContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  min-height: 0; /* 确保容器可以收缩 */
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.animations.duration.normal};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary}20;
  }
`;

const StatIcon = styled.div<{ color: string }>`
  font-size: ${({ theme }) => theme.fonts.sizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ color }) => color};
  text-shadow: 0 0 5px ${({ color }) => color}80;
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Orbitron', ${({ theme }) => theme.fonts.primary};
  text-align: center;
`;

const TimeDisplay = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.primary}20,
    ${({ theme }) => theme.colors.secondary}20
  );
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TimeLabel = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TimeValue = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xxl};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  font-family: 'Orbitron', ${({ theme }) => theme.fonts.primary};
  text-shadow: ${({ theme }) => theme.shadows.glow};
`;

const PlayerStats: React.FC = () => {
  const [playerStats] = useAtom(playerStatsAtom);
  const [gameTime] = useAtom(gameTimeAtom);

  if (!playerStats) {
    return (
      <StatsContainer>
        <Card.Header>
          <Card.Title>角色状态</Card.Title>
        </Card.Header>
        <Card.Content>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            暂无角色数据
          </div>
        </Card.Content>
      </StatsContainer>
    );
  }

  const stats = [
    {
      icon: '💰',
      label: '资金',
      value: playerStats.moneyDisplay,
      color: '#ffdd00',
    },
    {
      icon: '⭐',
      label: '声望',
      value: playerStats.reputationDisplay,
      color: '#ff0088',
    },
    {
      icon: '❤️',
      label: '健康',
      value: playerStats.healthDisplay,
      color: '#00ff88',
    },
    {
      icon: '🤝',
      label: '人脉',
      value: playerStats.connectionsDisplay,
      color: '#4488ff',
    },
  ];

  return (
    <StatsContainer>
      <Card.Header>
        <Card.Title>角色状态</Card.Title>
      </Card.Header>
      
      <Card.Content>
        {gameTime && (
          <TimeDisplay>
            <TimeLabel>游戏时间</TimeLabel>
            <TimeValue>{gameTime.display}</TimeValue>
          </TimeDisplay>
        )}
        
        <StatsGrid>
          {stats.map((stat, index) => (
            <StatItem key={index}>
              <StatIcon color={stat.color}>
                {stat.icon}
              </StatIcon>
              <StatLabel>{stat.label}</StatLabel>
              <StatValue>{stat.value}</StatValue>
            </StatItem>
          ))}
        </StatsGrid>
      </Card.Content>
    </StatsContainer>
  );
};

export default PlayerStats;
