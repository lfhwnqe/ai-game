import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { useSocket } from '../../hooks/useSocket';
import Header from './Header';
import Sidebar from './Sidebar';
import NotificationCenter from '../UI/NotificationCenter';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  overflow: hidden;
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  /* 扫描线效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      transparent 50%,
      rgba(0, 255, 136, 0.02) 50%
    );
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 1;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
  z-index: 2;
  padding: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const Layout: React.FC = () => {
  // 初始化WebSocket连接
  useSocket();

  return (
    <LayoutContainer>
      <Header />
      <MainContainer>
        <Sidebar />
        <ContentArea>
          <ContentWrapper>
            <Outlet />
          </ContentWrapper>
        </ContentArea>
      </MainContainer>
      <NotificationCenter />
    </LayoutContainer>
  );
};

export default Layout;
