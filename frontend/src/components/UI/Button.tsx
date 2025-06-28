import React from 'react';
import styled, { css } from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return css`
        background: ${({ theme }) => theme.colors.primary};
        color: ${({ theme }) => theme.colors.background.primary};
        border: 2px solid ${({ theme }) => theme.colors.primary};
        box-shadow: 
          0 0 10px ${({ theme }) => theme.colors.primary}40,
          inset 0 0 10px ${({ theme }) => theme.colors.primary}20;

        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.secondary};
          border-color: ${({ theme }) => theme.colors.secondary};
          box-shadow: 
            0 0 20px ${({ theme }) => theme.colors.secondary}60,
            inset 0 0 10px ${({ theme }) => theme.colors.secondary}30;
          transform: translateY(-2px);
        }

        &:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 
            0 0 5px ${({ theme }) => theme.colors.primary}40,
            inset 0 0 10px ${({ theme }) => theme.colors.primary}40;
        }
      `;

    case 'secondary':
      return css`
        background: transparent;
        color: ${({ theme }) => theme.colors.primary};
        border: 2px solid ${({ theme }) => theme.colors.primary};

        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.primary}20;
          box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary}40;
          transform: translateY(-1px);
        }

        &:active:not(:disabled) {
          background: ${({ theme }) => theme.colors.primary}40;
          transform: translateY(0);
        }
      `;

    case 'accent':
      return css`
        background: ${({ theme }) => theme.colors.accent};
        color: ${({ theme }) => theme.colors.background.primary};
        border: 2px solid ${({ theme }) => theme.colors.accent};
        box-shadow: 
          0 0 10px ${({ theme }) => theme.colors.accent}40,
          inset 0 0 10px ${({ theme }) => theme.colors.accent}20;

        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.secondary};
          border-color: ${({ theme }) => theme.colors.secondary};
          box-shadow: 
            0 0 20px ${({ theme }) => theme.colors.secondary}60,
            inset 0 0 10px ${({ theme }) => theme.colors.secondary}30;
          transform: translateY(-2px);
        }
      `;

    case 'danger':
      return css`
        background: ${({ theme }) => theme.colors.status.error};
        color: ${({ theme }) => theme.colors.text.primary};
        border: 2px solid ${({ theme }) => theme.colors.status.error};
        box-shadow: 
          0 0 10px ${({ theme }) => theme.colors.status.error}40,
          inset 0 0 10px ${({ theme }) => theme.colors.status.error}20;

        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.status.error}dd;
          box-shadow: 
            0 0 20px ${({ theme }) => theme.colors.status.error}60,
            inset 0 0 10px ${({ theme }) => theme.colors.status.error}30;
          transform: translateY(-2px);
        }
      `;

    case 'ghost':
      return css`
        background: transparent;
        color: ${({ theme }) => theme.colors.text.secondary};
        border: 2px solid transparent;

        &:hover:not(:disabled) {
          color: ${({ theme }) => theme.colors.primary};
          border-color: ${({ theme }) => theme.colors.primary}40;
          background: ${({ theme }) => theme.colors.primary}10;
        }

        &:active:not(:disabled) {
          background: ${({ theme }) => theme.colors.primary}20;
        }
      `;

    default:
      return css``;
  }
};

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'small':
      return css`
        padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
        font-size: ${({ theme }) => theme.fonts.sizes.sm};
        min-height: 32px;
      `;

    case 'large':
      return css`
        padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
        font-size: ${({ theme }) => theme.fonts.sizes.lg};
        min-height: 48px;
      `;

    default: // medium
      return css`
        padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
        font-size: ${({ theme }) => theme.fonts.sizes.md};
        min-height: 40px;
      `;
  }
};

const StyledButton = styled.button<ButtonProps>`
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.duration.normal} ${({ theme }) => theme.animations.easing.easeOut};
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  white-space: nowrap;
  user-select: none;
  
  /* 像素艺术风格 */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;

  ${({ variant = 'primary' }) => getVariantStyles(variant)}
  ${({ size = 'medium' }) => getSizeStyles(size)}

  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  ${({ loading }) => loading && css`
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 16px;
      margin: -8px 0 0 -8px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}

  /* 扫描线效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled)::before {
    left: 100%;
  }

  /* 焦点样式 */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  children,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      loading={loading}
      onClick={handleClick}
      type={type}
      className={className}
      {...props}
    >
      {loading ? '' : children}
    </StyledButton>
  );
};
