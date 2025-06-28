import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Card } from '../components/UI/Card';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

const RegisterContainer = styled.div`
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

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 450px;
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

const PasswordStrength = styled.div<{ strength: number }>`
  height: 4px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: 2px;
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing.xs};

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ strength }) => strength}%;
    background: ${({ strength, theme }) => 
      strength < 30 ? theme.colors.status.error :
      strength < 60 ? theme.colors.status.warning :
      strength < 80 ? theme.colors.status.info :
      theme.colors.status.success
    };
    transition: all 0.3s ease;
  }
`;

const PasswordHint = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.spacing.xs};
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

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    
    return strength;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // 计算密码强度
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

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

    // 用户名验证
    if (!formData.username.trim()) {
      errors.username = '请输入用户名';
    } else if (formData.username.length < 3) {
      errors.username = '用户名至少3个字符';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = '用户名只能包含字母、数字和下划线';
    }

    // 邮箱验证
    if (!formData.email.trim()) {
      errors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    // 密码验证
    if (!formData.password) {
      errors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      errors.password = '密码至少6个字符';
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
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
      await register(formData);
      navigate('/game');
    } catch (error) {
      // 错误已经在store中处理
      console.error('注册失败:', error);
    }
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 30) return '弱';
    if (strength < 60) return '一般';
    if (strength < 80) return '良好';
    return '强';
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Title>创建账号</Title>
        <Subtitle>
          加入深圳1980的商业世界
          <br />
          开始您的创业传奇
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
            <Label htmlFor="email">邮箱地址</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="请输入邮箱地址"
              error={validationErrors.email}
              disabled={isLoading}
              autoComplete="email"
            />
            {validationErrors.email && (
              <ErrorMessage>{validationErrors.email}</ErrorMessage>
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
              placeholder="请输入密码"
              error={validationErrors.password}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {formData.password && (
              <>
                <PasswordStrength strength={passwordStrength} />
                <PasswordHint>
                  密码强度: {getPasswordStrengthText(passwordStrength)}
                  {passwordStrength < 80 && ' (建议包含大小写字母和数字)'}
                </PasswordHint>
              </>
            )}
            {validationErrors.password && (
              <ErrorMessage>{validationErrors.password}</ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="请再次输入密码"
              error={validationErrors.confirmPassword}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {validationErrors.confirmPassword && (
              <ErrorMessage>{validationErrors.confirmPassword}</ErrorMessage>
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
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </Button>
          </ButtonGroup>
        </Form>

        <LinkText>
          已有账号？{' '}
          <Link to="/login">立即登录</Link>
        </LinkText>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;
