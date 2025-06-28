// 像素艺术风格主题配置
export const theme = {
  // 颜色配置 - 深圳1980年代风格
  colors: {
    // 主色调 - 霓虹色彩
    primary: '#00ff88',      // 霓虹绿
    secondary: '#ff0088',    // 霓虹粉
    accent: '#ffaa00',       // 霓虹橙
    
    // 背景色
    background: {
      primary: '#0a0a0a',    // 深黑
      secondary: '#1a1a1a',  // 深灰
      tertiary: '#2a2a2a',   // 中灰
    },
    
    // 文字颜色
    text: {
      primary: '#ffffff',    // 白色
      secondary: '#cccccc',  // 浅灰
      muted: '#888888',      // 中灰
      accent: '#00ff88',     // 强调色
    },
    
    // 状态颜色
    status: {
      success: '#00ff88',    // 成功 - 绿色
      warning: '#ffaa00',    // 警告 - 橙色
      error: '#ff4444',      // 错误 - 红色
      info: '#4488ff',       // 信息 - 蓝色
    },
    
    // 游戏相关颜色
    game: {
      money: '#ffdd00',      // 金钱 - 金色
      reputation: '#ff0088', // 声望 - 粉色
      health: '#00ff88',     // 健康 - 绿色
      connections: '#4488ff', // 人脉 - 蓝色
    },
    
    // 边框和分割线
    border: {
      primary: '#333333',
      secondary: '#555555',
      accent: '#00ff88',
    }
  },
  
  // 字体配置
  fonts: {
    primary: '"Courier New", "Monaco", "Menlo", monospace', // 像素字体
    secondary: '"Arial", sans-serif',
    sizes: {
      xs: '10px',
      sm: '12px',
      md: '14px',
      lg: '16px',
      xl: '18px',
      xxl: '24px',
      title: '32px',
    },
    weights: {
      normal: 400,
      bold: 700,
    }
  },
  
  // 间距配置
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // 边框半径
  borderRadius: {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '8px',
  },
  
  // 阴影效果
  shadows: {
    sm: '0 1px 2px rgba(0, 255, 136, 0.1)',
    md: '0 2px 4px rgba(0, 255, 136, 0.2)',
    lg: '0 4px 8px rgba(0, 255, 136, 0.3)',
    glow: '0 0 10px rgba(0, 255, 136, 0.5)',
    neon: '0 0 20px rgba(0, 255, 136, 0.8)',
  },
  
  // 动画配置
  animations: {
    duration: {
      fast: '0.1s',
      normal: '0.2s',
      slow: '0.3s',
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    }
  },
  
  // 断点配置
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px',
  },
  
  // Z-index层级
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  }
};

export type Theme = typeof theme;
