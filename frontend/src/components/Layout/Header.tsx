import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAtom } from 'jotai';
import { useAuthStore } from '../../stores/authStore';
import { useGameStore } from '../../stores/gameStore';
import { gameOverviewAtom } from '../../atoms/gameAtoms';
import { Button } from '../UI/Button';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 2px 10px rgba(0, 255, 136, 0.2);
  position: relative;
  z-index: ${({ theme }) => theme.zIndex.sticky};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xl};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  font-family: 'Orbitron', ${({ theme }) => theme.fonts.primary};
  text-shadow: ${({ theme }) => theme.shadows.glow};
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

const GameTitle = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const GameStatus = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CenterSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

const GameTime = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const TimeLabel = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
`;

const TimeValue = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  font-family: 'Orbitron', ${({ theme }) => theme.fonts.primary};
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 8px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${({ progress }) => progress}%;
  background: linear-gradient(90deg, 
    ${({ theme }) => theme.colors.primary}, 
    ${({ theme }) => theme.colors.secondary}
  );
  transition: width 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

const Username = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
`;

const UserRole = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentGame } = useGameStore();
  const [gameOverview] = useAtom(gameOverviewAtom);

  const handleLogoClick = () => {
    navigate('/game');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <Logo onClick={handleLogoClick}>
          深圳1980
        </Logo>
        
        {currentGame && (
          <GameInfo>
            <GameTitle>当前游戏</GameTitle>
            <GameStatus>
              {currentGame.status === 'active' ? '进行中' : 
               currentGame.status === 'paused' ? '已暂停' : 
               currentGame.status === 'completed' ? '已完成' : '等待开始'}
            </GameStatus>
          </GameInfo>
        )}
      </LeftSection>

      <CenterSection>
        {gameOverview.gameTime && (
          <GameTime>
            <TimeLabel>游戏时间</TimeLabel>
            <TimeValue>{gameOverview.gameTime.display}</TimeValue>
          </GameTime>
        )}
        
        {gameOverview.gameProgress !== undefined && (
          <div>
            <TimeLabel style={{ marginBottom: '4px' }}>游戏进度</TimeLabel>
            <ProgressBar>
              <ProgressFill progress={gameOverview.gameProgress} />
            </ProgressBar>
          </div>
        )}
      </CenterSection>

      <RightSection>
        {user && (
          <UserInfo>
            <Username>{user.username}</Username>
            <UserRole>玩家</UserRole>
          </UserInfo>
        )}
        
        <Button
          variant="ghost"
          size="small"
          onClick={handleLogout}
        >
          登出
        </Button>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
