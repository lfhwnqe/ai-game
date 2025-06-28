import React from 'react';
import styled, { keyframes, css } from 'styled-components';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'dots' | 'pulse' | 'bars';
  color?: string;
  className?: string;
}

// 旋转动画
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// 脉冲动画
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
`;

// 点动画
const dotBounce = keyframes`
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
`;

// 条形动画
const barStretch = keyframes`
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1); }
`;

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'small':
      return css`
        width: 16px;
        height: 16px;
      `;
    case 'large':
      return css`
        width: 48px;
        height: 48px;
      `;
    default: // medium
      return css`
        width: 32px;
        height: 32px;
      `;
  }
};

// 默认旋转加载器
const SpinnerContainer = styled.div<{ size: string; color?: string }>`
  ${({ size }) => getSizeStyles(size)}
  border: 2px solid transparent;
  border-top: 2px solid ${({ color, theme }) => color || theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  display: inline-block;
  
  /* 像素艺术风格 */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

// 点加载器
const DotsContainer = styled.div<{ size: string }>`
  display: inline-flex;
  gap: ${({ size }) => size === 'small' ? '2px' : size === 'large' ? '6px' : '4px'};
  align-items: center;
`;

const Dot = styled.div<{ size: string; color?: string; delay: number }>`
  ${({ size }) => {
    const dotSize = size === 'small' ? '4px' : size === 'large' ? '12px' : '8px';
    return css`
      width: ${dotSize};
      height: ${dotSize};
    `;
  }}
  background: ${({ color, theme }) => color || theme.colors.primary};
  border-radius: 50%;
  animation: ${dotBounce} 1.4s ease-in-out infinite both;
  animation-delay: ${({ delay }) => delay}s;
  
  /* 像素艺术风格 */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

// 脉冲加载器
const PulseContainer = styled.div<{ size: string; color?: string }>`
  ${({ size }) => getSizeStyles(size)}
  background: ${({ color, theme }) => color || theme.colors.primary};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  display: inline-block;
  
  /* 像素艺术风格 */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

// 条形加载器
const BarsContainer = styled.div<{ size: string }>`
  display: inline-flex;
  gap: ${({ size }) => size === 'small' ? '1px' : size === 'large' ? '3px' : '2px'};
  align-items: center;
  height: ${({ size }) => size === 'small' ? '16px' : size === 'large' ? '48px' : '32px'};
`;

const Bar = styled.div<{ size: string; color?: string; delay: number }>`
  width: ${({ size }) => size === 'small' ? '2px' : size === 'large' ? '6px' : '4px'};
  height: 100%;
  background: ${({ color, theme }) => color || theme.colors.primary};
  animation: ${barStretch} 1.2s infinite ease-in-out;
  animation-delay: ${({ delay }) => delay}s;
  
  /* 像素艺术风格 */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

// 加载屏幕组件
const LoadingScreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.background.primary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const LoadingText = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Orbitron', ${({ theme }) => theme.fonts.primary};
  text-align: center;
`;

const LoadingSubtext = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  variant = 'default',
  color,
  className,
}) => {
  switch (variant) {
    case 'dots':
      return (
        <DotsContainer size={size} className={className}>
          <Dot size={size} color={color} delay={0} />
          <Dot size={size} color={color} delay={0.16} />
          <Dot size={size} color={color} delay={0.32} />
        </DotsContainer>
      );

    case 'pulse':
      return (
        <PulseContainer size={size} color={color} className={className} />
      );

    case 'bars':
      return (
        <BarsContainer size={size} className={className}>
          <Bar size={size} color={color} delay={0} />
          <Bar size={size} color={color} delay={0.1} />
          <Bar size={size} color={color} delay={0.2} />
          <Bar size={size} color={color} delay={0.3} />
          <Bar size={size} color={color} delay={0.4} />
        </BarsContainer>
      );

    default:
      return (
        <SpinnerContainer size={size} color={color} className={className} />
      );
  }
};

// 全屏加载组件
interface LoadingScreenProps {
  text?: string;
  subtext?: string;
  variant?: LoadingSpinnerProps['variant'];
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text = '加载中...',
  subtext,
  variant = 'default',
}) => {
  return (
    <LoadingScreenContainer>
      <LoadingSpinner size="large" variant={variant} />
      <LoadingText>{text}</LoadingText>
      {subtext && <LoadingSubtext>{subtext}</LoadingSubtext>}
    </LoadingScreenContainer>
  );
};

// 内联加载组件
interface InlineLoadingProps {
  text?: string;
  size?: LoadingSpinnerProps['size'];
  variant?: LoadingSpinnerProps['variant'];
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  text,
  size = 'small',
  variant = 'default',
  className,
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className || ''}`}>
      <LoadingSpinner size={size} variant={variant} />
      {text && <span>{text}</span>}
    </div>
  );
};
