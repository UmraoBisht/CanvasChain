export const DESIGN_TOKENS = {
  colors: {
    brand: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
    },
    dark: {
      background: '#090d16',
      grid: '#1e293b',
      selection: 'rgba(99, 102, 241, 0.25)',
      nodeBg: '#1e293b',
      nodeBorder: '#334155',
    },
    light: {
      background: '#f8fafc',
      grid: '#e2e8f0',
      selection: 'rgba(99, 102, 241, 0.15)',
      nodeBg: '#ffffff',
      nodeBorder: '#cbd5e1',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
  },
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  spacing: {
    unit: 4,
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
} as const;
