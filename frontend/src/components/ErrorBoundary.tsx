import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 2px solid ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin: 2rem;
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.colors.status.error};
  margin-bottom: 1rem;
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  text-align: center;
`;

const ErrorDetails = styled.details`
  margin-top: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.muted};
  max-width: 100%;
  overflow: auto;
`;

const ReloadButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: ${({ theme }) => theme.fonts.mono};
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorTitle>🚫 页面渲染错误</ErrorTitle>
          <ErrorMessage>
            抱歉，页面遇到了一个错误。请尝试刷新页面或联系技术支持。
          </ErrorMessage>
          
          <ReloadButton onClick={this.handleReload}>
            刷新页面
          </ReloadButton>

          {this.state.error && (
            <ErrorDetails>
              <summary>错误详情</summary>
              <div>
                <strong>错误信息:</strong> {this.state.error.message}
              </div>
              {this.state.error.stack && (
                <div>
                  <strong>错误堆栈:</strong>
                  <pre>{this.state.error.stack}</pre>
                </div>
              )}
              {this.state.errorInfo && (
                <div>
                  <strong>组件堆栈:</strong>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              )}
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
