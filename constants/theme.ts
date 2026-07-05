// SONA AI - Design System Tokens
// All color/spacing/typography values centralized here

export const Colors = {
  dark: {
    background: '#0A0A0F',
    surface: '#12121A',
    card: '#1A1A28',
    cardBorder: '#2A2A3E',
    primary: '#6C63FF',
    primaryLight: '#8B83FF',
    primaryDark: '#4A42CC',
    secondary: '#00D4FF',
    accent: '#FF6B9D',
    gold: '#FFD700',
    success: '#00E676',
    warning: '#FFB300',
    error: '#FF5252',
    text: '#FFFFFF',
    textSecondary: '#A0A0B8',
    textMuted: '#606080',
    border: '#2A2A3E',
    overlay: 'rgba(0,0,0,0.6)',
    glass: 'rgba(26,26,40,0.8)',
    gradientStart: '#6C63FF',
    gradientEnd: '#00D4FF',
  },
  light: {
    background: '#F4F4FF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#E0E0F0',
    primary: '#6C63FF',
    primaryLight: '#8B83FF',
    primaryDark: '#4A42CC',
    secondary: '#0099CC',
    accent: '#E91E8C',
    gold: '#F59E0B',
    success: '#00C853',
    warning: '#FF8F00',
    error: '#D32F2F',
    text: '#0A0A1E',
    textSecondary: '#4A4A6A',
    textMuted: '#9090A8',
    border: '#E0E0F0',
    overlay: 'rgba(0,0,0,0.4)',
    glass: 'rgba(255,255,255,0.9)',
    gradientStart: '#6C63FF',
    gradientEnd: '#00D4FF',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 34,
  hero: 42,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
};
