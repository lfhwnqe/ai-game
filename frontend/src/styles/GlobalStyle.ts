import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  /* 重置样式 */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    height: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.primary};
    font-size: ${({ theme }) => theme.fonts.sizes.md};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.primary};
    line-height: 1.5;
    height: 100%;
    overflow-x: hidden;
    
    /* 像素艺术风格 - 禁用抗锯齿 */
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }

  #root {
    height: 100%;
    min-height: 100vh;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  /* 链接样式 */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.animations.duration.normal};
    
    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
    }
  }

  /* 按钮重置 */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    outline: none;
  }

  /* 输入框重置 */
  input, textarea, select {
    font-family: inherit;
    outline: none;
    border: none;
  }

  /* 列表重置 */
  ul, ol {
    list-style: none;
  }

  /* 图片样式 */
  img {
    max-width: 100%;
    height: auto;
    /* 像素艺术风格 */
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }

  /* 表格样式 */
  table {
    border-collapse: collapse;
    width: 100%;
  }

  /* 选择文本样式 */
  ::selection {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background.primary};
  }

  /* 焦点样式 */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* 禁用状态 */
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 像素艺术动画类 */
  .pixel-perfect {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }

  /* 霓虹发光效果 */
  .neon-glow {
    text-shadow: 
      0 0 5px ${({ theme }) => theme.colors.primary},
      0 0 10px ${({ theme }) => theme.colors.primary},
      0 0 15px ${({ theme }) => theme.colors.primary};
  }

  /* 扫描线效果 */
  .scanlines {
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        transparent 50%,
        rgba(0, 255, 136, 0.03) 50%
      );
      background-size: 100% 4px;
      pointer-events: none;
      z-index: 1;
    }
  }

  /* CRT显示器效果 */
  .crt-effect {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(
        ellipse at center,
        transparent 0%,
        rgba(0, 0, 0, 0.1) 100%
      );
      pointer-events: none;
      z-index: 2;
    }
  }

  /* 响应式设计 */
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    html {
      font-size: 14px;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    html {
      font-size: 12px;
    }
  }

  /* 打印样式 */
  @media print {
    body {
      background: white;
      color: black;
    }
    
    .no-print {
      display: none;
    }
  }
`;

export default GlobalStyle;
