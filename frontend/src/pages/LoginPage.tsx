import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Card } from '../components/UI/Card';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.background.primary} 0%,
    ${({ theme }) => theme.colors.background.secondary} 100%);
  padding: ${({ theme }) => theme.spacing.md};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/grid-pattern.png') repeat;
    opacity: 0.1;
    pointer-events: none;
  }
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadows.neon};
  position: relative;
  z-index: 1;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg};
    margin: ${({ theme }) => theme.spacing.md};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fonts.sizes.title};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-shadow: ${({ theme }) => theme.shadows.glow};
  font-family: 'Orbitron', ${({ theme }) => theme.fonts.primary};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.status.error};
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const LinkText = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.fonts.weights.bold};
    
    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
      text-shadow: ${({ theme }) => theme.shadows.glow};
    }
  }
`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // 清除对应字段的验证错误
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // 清除全局错误
    if (error) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!formData.username.trim()) {
      errors.username = '请输入用户名';
    } else if (formData.username.length < 3) {
      errors.username = '用户名至少3个字符';
    }

    if (!formData.password) {
      errors.password = '请输入密码';
    } else if (formData.password.length < 8) {
      errors.password = '密码至少8个字符';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      console.log('登录成功，准备跳转...');

      // 添加短暂延迟确保状态更新完成
      setTimeout(() => {
        console.log('执行跳转到游戏页面');
        navigate('/game');
      }, 100);
    } catch (error) {
      // 错误已经在store中处理
      console.error('登录失败:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>深圳1980</Title>
        <Subtitle>
          欢迎来到AI驱动的商业模拟世界
          <br />
          体验1980年代深圳的创业传奇
        </Subtitle>

        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="请输入用户名"
              error={validationErrors.username}
              disabled={isLoading}
              autoComplete="username"
              autoFocus
            />
            {validationErrors.username && (
              <ErrorMessage>{validationErrors.username}</ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="请输入密码"
              error={validationErrors.password}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {validationErrors.password && (
              <ErrorMessage>{validationErrors.password}</ErrorMessage>
            )}
          </InputGroup>

          <ButtonGroup>
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </ButtonGroup>
        </Form>

        <LinkText>
          还没有账号？{' '}
          <Link to="/register">立即注册</Link>
        </LinkText>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
