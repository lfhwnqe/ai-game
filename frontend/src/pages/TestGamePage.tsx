import React from 'react';
import styled from 'styled-components';
import { useAuthStore } from '../stores/authStore';

const TestContainer = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 100vh;
`;

const TestTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const TestInfo = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  margin-bottom: 1rem;
`;

const TestLabel = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
`;

const TestValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const TestGamePage: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  console.log('TestGamePage渲染:', { isAuthenticated, user, isLoading });

  return (
    <TestContainer>
      <TestTitle>🎮 游戏页面测试</TestTitle>
      
      <TestInfo>
        <TestLabel>认证状态:</TestLabel>
        <TestValue>{isAuthenticated ? '✅ 已认证' : '❌ 未认证'}</TestValue>
      </TestInfo>

      <TestInfo>
        <TestLabel>用户信息:</TestLabel>
        <TestValue>
          {user ? (
            <>
              <div>用户名: {user.username}</div>
              <div>邮箱: {user.email}</div>
              <div>用户ID: {user.userId}</div>
            </>
          ) : (
            '无用户信息'
          )}
        </TestValue>
      </TestInfo>

      <TestInfo>
        <TestLabel>加载状态:</TestLabel>
        <TestValue>{isLoading ? '⏳ 加载中' : '✅ 加载完成'}</TestValue>
      </TestInfo>

      <TestInfo>
        <TestLabel>页面状态:</TestLabel>
        <TestValue>✅ 页面正常渲染</TestValue>
      </TestInfo>

      <TestInfo>
        <TestLabel>时间戳:</TestLabel>
        <TestValue>{new Date().toLocaleString()}</TestValue>
      </TestInfo>
    </TestContainer>
  );
};

export default TestGamePage;
