import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useAtom } from 'jotai';
import { notificationsAtom, removeNotificationAtom } from '../../atoms/gameAtoms';
import { Notification } from '../../types';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  z-index: ${({ theme }) => theme.zIndex.toast};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-width: 400px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    top: ${({ theme }) => theme.spacing.sm};
    right: ${({ theme }) => theme.spacing.sm};
    left: ${({ theme }) => theme.spacing.sm};
    max-width: none;
  }
`;

const NotificationItem = styled.div<{ type: Notification['type']; removing?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 2px solid ${({ type, theme }) => {
    switch (type) {
      case 'success':
        return theme.colors.status.success;
      case 'warning':
        return theme.colors.status.warning;
      case 'error':
        return theme.colors.status.error;
      case 'info':
      default:
        return theme.colors.status.info;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: ${({ removing }) => removing ? slideOut : slideIn} 0.3s ease-out;
  position: relative;
  overflow: hidden;
  
  /* 像素艺术风格 */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  
  /* 发光效果 */
  box-shadow: 
    ${({ theme }) => theme.shadows.lg},
    0 0 20px ${({ type, theme }) => {
      switch (type) {
        case 'success':
          return theme.colors.status.success + '40';
        case 'warning':
          return theme.colors.status.warning + '40';
        case 'error':
          return theme.colors.status.error + '40';
        case 'info':
        default:
          return theme.colors.status.info + '40';
      }
    }};
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NotificationTitle = styled.h4`
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  font-family: 'Orbitron', ${({ theme }) => theme.fonts.primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all ${({ theme }) => theme.animations.duration.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const NotificationMessage = styled.p`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

const NotificationTimestamp = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const NotificationIcon = styled.div<{ type: Notification['type'] }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  width: 4px;
  height: 100%;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'success':
        return theme.colors.status.success;
      case 'warning':
        return theme.colors.status.warning;
      case 'error':
        return theme.colors.status.error;
      case 'info':
      default:
        return theme.colors.status.info;
    }
  }};
  border-radius: 2px;
`;

const NotificationCenter: React.FC = () => {
  const [notifications] = useAtom(notificationsAtom);
  const [, removeNotification] = useAtom(removeNotificationAtom);

  const handleClose = (notificationId: string) => {
    removeNotification(notificationId);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // 小于1分钟
      return '刚刚';
    } else if (diff < 3600000) { // 小于1小时
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 小于1天
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTypeIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <NotificationContainer>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          type={notification.type}
        >
          <NotificationIcon type={notification.type} />
          
          <NotificationHeader>
            <NotificationTitle>
              {getTypeIcon(notification.type)} {notification.title}
            </NotificationTitle>
            <CloseButton
              onClick={() => handleClose(notification.id)}
              aria-label="关闭通知"
            >
              ×
            </CloseButton>
          </NotificationHeader>
          
          <NotificationMessage>
            {notification.message}
          </NotificationMessage>
          
          <NotificationTimestamp>
            {formatTimestamp(notification.timestamp)}
          </NotificationTimestamp>
        </NotificationItem>
      ))}
    </NotificationContainer>
  );
};

export default NotificationCenter;
