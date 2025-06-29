import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAtom } from 'jotai';
import { activeTabAtom } from '../../atoms/gameAtoms';

const SidebarContainer = styled.aside`
  width: 240px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-right: 2px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  position: relative;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 60px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NavItem = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ active, theme }) => 
    active ? theme.colors.primary + '20' : 'transparent'
  };
  color: ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.text.secondary
  };
  border: 2px solid ${({ active, theme }) => 
    active ? theme.colors.primary : 'transparent'
  };
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  text-align: left;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.duration.normal};
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}10;
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary}40;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    justify-content: center;
    padding: ${({ theme }) => theme.spacing.sm};
    
    .nav-text {
      display: none;
    }
  }
`;

const NavIcon = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  min-width: 20px;
  text-align: center;
`;

const NavText = styled.span`
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    justify-content: center;
    
    .status-text {
      display: none;
    }
  }
`;

const StatusDot = styled.div<{ status: 'connected' | 'disconnected' | 'connecting' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ status, theme }) => 
    status === 'connected' ? theme.colors.status.success :
    status === 'connecting' ? theme.colors.status.warning :
    theme.colors.status.error
  };
  animation: ${({ status }) => status === 'connecting' ? 'pulse 1s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const StatusText = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

interface NavItemData {
  path: string;
  icon: string;
  text: string;
  key: 'game' | 'characters' | 'relationships';
}

const navItems: NavItemData[] = [
  {
    path: '/games',
    icon: '🎮',
    text: '游戏列表',
    key: 'game',
  },
  {
    path: '/characters',
    icon: '👥',
    text: '角色',
    key: 'characters',
  },
  {
    path: '/relationships',
    icon: '🔗',
    text: '关系',
    key: 'relationships',
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  // 模拟连接状态 - 实际应该从WebSocket状态获取
  const connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'connected';

  const handleNavClick = (item: NavItemData) => {
    setActiveTab(item.key);
    navigate(item.path);
  };

  const getStatusText = (status: typeof connectionStatus): string => {
    switch (status) {
      case 'connected':
        return '已连接';
      case 'connecting':
        return '连接中...';
      case 'disconnected':
        return '已断开';
      default:
        return '未知';
    }
  };

  return (
    <SidebarContainer>
      <NavList>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
                          (item.path === '/games' && location.pathname === '/') ||
                          (item.path === '/games' && location.pathname.startsWith('/game'));

          return (
            <NavItem
              key={item.key}
              active={isActive}
              onClick={() => handleNavClick(item)}
            >
              <NavIcon>{item.icon}</NavIcon>
              <NavText className="nav-text">{item.text}</NavText>
            </NavItem>
          );
        })}
      </NavList>

      <SidebarFooter>
        <StatusIndicator>
          <StatusDot status={connectionStatus} />
          <StatusText className="status-text">
            {getStatusText(connectionStatus)}
          </StatusText>
        </StatusIndicator>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
