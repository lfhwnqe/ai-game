import React from 'react';
import styled, { css } from 'styled-components';

interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  glowEffect?: boolean;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'elevated':
      return css`
        background: ${({ theme }) => theme.colors.background.secondary};
        border: 1px solid ${({ theme }) => theme.colors.border.secondary};
        box-shadow: ${({ theme }) => theme.shadows.lg};
      `;

    case 'outlined':
      return css`
        background: transparent;
        border: 2px solid ${({ theme }) => theme.colors.border.primary};
        box-shadow: none;
      `;

    case 'glass':
      return css`
        background: rgba(26, 26, 26, 0.8);
        border: 1px solid ${({ theme }) => theme.colors.border.primary};
        backdrop-filter: blur(10px);
        box-shadow: ${({ theme }) => theme.shadows.md};
      `;

    default: // default
      return css`
        background: ${({ theme }) => theme.colors.background.secondary};
        border: 1px solid ${({ theme }) => theme.colors.border.primary};
        box-shadow: ${({ theme }) => theme.shadows.sm};
      `;
  }
};

const getPaddingStyles = (padding: string) => {
  switch (padding) {
    case 'none':
      return css`
        padding: 0;
      `;

    case 'small':
      return css`
        padding: ${({ theme }) => theme.spacing.sm};
      `;

    case 'large':
      return css`
        padding: ${({ theme }) => theme.spacing.xl};
      `;

    default: // medium
      return css`
        padding: ${({ theme }) => theme.spacing.md};
      `;
  }
};

const StyledCard = styled.div<CardProps>`
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.animations.duration.normal} ${({ theme }) => theme.animations.easing.easeOut};
  position: relative;
  overflow: hidden;
  
  /* 像素艺术风格 */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;

  ${({ variant = 'default' }) => getVariantStyles(variant)}
  ${({ padding = 'medium' }) => getPaddingStyles(padding)}

  ${({ onClick, hoverable }) => (onClick || hoverable) && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.lg};
      border-color: ${({ theme }) => theme.colors.primary};
    }

    &:active {
      transform: translateY(0);
    }
  `}

  ${({ glowEffect, theme }) => glowEffect && css`
    box-shadow: 
      ${theme.shadows.md},
      0 0 20px ${theme.colors.primary}20;
    
    &:hover {
      box-shadow: 
        ${theme.shadows.lg},
        0 0 30px ${theme.colors.primary}40;
    }
  `}

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

  /* 内容容器 */
  > * {
    position: relative;
    z-index: 2;
  }
`;

const CardHeader = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  font-family: 'Orbitron', ${({ theme }) => theme.fonts.primary};
`;

const CardSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing.xs} 0 0 0;
`;

const CardContent = styled.div`
  /* 内容样式 */
`;

const CardFooter = styled.div`
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'medium',
  children,
  className,
  onClick,
  hoverable = false,
  glowEffect = false,
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      padding={padding}
      className={className}
      onClick={onClick}
      hoverable={hoverable}
      glowEffect={glowEffect}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

// 导出子组件
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Actions = CardActions;

// 类型导出
export type { CardProps };
