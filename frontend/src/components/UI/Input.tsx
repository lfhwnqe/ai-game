import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string;
  success?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const InputWrapper = styled.div<{ 
  hasError?: boolean; 
  hasSuccess?: boolean; 
  hasLeftIcon?: boolean; 
  hasRightIcon?: boolean;
  size?: string;
}>`
  position: relative;
  display: flex;
  align-items: center;
  
  ${({ hasLeftIcon, theme }) => hasLeftIcon && css`
    padding-left: ${theme.spacing.lg};
  `}
  
  ${({ hasRightIcon, theme }) => hasRightIcon && css`
    padding-right: ${theme.spacing.lg};
  `}
`;

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

const StyledInput = styled.input<{
  hasError?: boolean;
  hasSuccess?: boolean;
  size?: string;
  fullWidth?: boolean;
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
}>`
  font-family: ${({ theme }) => theme.fonts.primary};
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.animations.duration.normal} ${({ theme }) => theme.animations.easing.easeOut};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  outline: none;
  
  /* 像素艺术风格 */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;

  ${({ size = 'medium' }) => getSizeStyles(size)}

  ${({ hasLeftIcon, theme }) => hasLeftIcon && css`
    padding-left: ${theme.spacing.xl};
  `}

  ${({ hasRightIcon, theme }) => hasRightIcon && css`
    padding-right: ${theme.spacing.xl};
  `}

  /* 状态样式 */
  ${({ hasError, theme }) => hasError && css`
    border-color: ${theme.colors.status.error};
    box-shadow: 0 0 0 1px ${theme.colors.status.error}40;
  `}

  ${({ hasSuccess, theme }) => hasSuccess && css`
    border-color: ${theme.colors.status.success};
    box-shadow: 0 0 0 1px ${theme.colors.status.success}40;
  `}

  /* 交互状态 */
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 
      0 0 0 1px ${({ theme }) => theme.colors.primary},
      0 0 10px ${({ theme }) => theme.colors.primary}40;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background.secondary};
  }

  /* 占位符样式 */
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
    opacity: 0.7;
  }

  /* 自动填充样式 */
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme.colors.background.tertiary} inset;
    -webkit-text-fill-color: ${({ theme }) => theme.colors.text.primary};
  }

  /* 数字输入框样式 */
  &[type="number"] {
    -moz-appearance: textfield;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  /* 密码输入框样式 */
  &[type="password"] {
    letter-spacing: 2px;
  }
`;

const IconContainer = styled.div<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ position }) => position}: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.muted};
  pointer-events: none;
  z-index: 1;
`;

const HelperText = styled.div<{ hasError?: boolean; hasSuccess?: boolean }>`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ hasError, hasSuccess, theme }) => 
    hasError ? theme.colors.status.error :
    hasSuccess ? theme.colors.status.success :
    theme.colors.text.muted
  };
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  error,
  success = false,
  size = 'medium',
  fullWidth = false,
  leftIcon,
  rightIcon,
  label,
  helperText,
  className,
  ...props
}, ref) => {
  const hasError = Boolean(error);
  const hasSuccess = success && !hasError;

  return (
    <InputContainer fullWidth={fullWidth} className={className}>
      {label && <Label>{label}</Label>}
      
      <InputWrapper
        hasError={hasError}
        hasSuccess={hasSuccess}
        hasLeftIcon={Boolean(leftIcon)}
        hasRightIcon={Boolean(rightIcon)}
        size={size}
      >
        {leftIcon && (
          <IconContainer position="left">
            {leftIcon}
          </IconContainer>
        )}
        
        <StyledInput
          ref={ref}
          hasError={hasError}
          hasSuccess={hasSuccess}
          size={size}
          fullWidth={fullWidth}
          hasLeftIcon={Boolean(leftIcon)}
          hasRightIcon={Boolean(rightIcon)}
          {...props}
        />
        
        {rightIcon && (
          <IconContainer position="right">
            {rightIcon}
          </IconContainer>
        )}
      </InputWrapper>
      
      {(error || helperText) && (
        <HelperText hasError={hasError} hasSuccess={hasSuccess}>
          {error || helperText}
        </HelperText>
      )}
    </InputContainer>
  );
});
