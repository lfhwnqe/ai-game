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
  overflow: hidden; /* 改为hidden避免滚动条 */
  position: relative;
  z-index: 2;
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  min-height: 0; /* 确保容器可以收缩 */

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const Layout: React.FC = () => {
  // 初始化WebSocket连接
  console.log('Layout组件渲染');

  try {
    useSocket();
  } catch (error) {
    console.error('WebSocket初始化失败:', error);
  }

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
