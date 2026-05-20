// ============================================================
// SIMONETTI DRIVER APP - CONSTANTS & THEME
// ============================================================

export const API_BASE_URL = 'https://www.eiscafe-simonetti.de'

export const COLORS = {
  // Brand (Gold — Kunden-App Palette)
  primary: '#C4973A',
  primaryDark: '#A07828',
  primaryLight: '#D4AF6A',
  primaryGlow: 'rgba(196, 151, 58, 0.18)',
  primaryBg: 'rgba(196, 151, 58, 0.14)',

  // Background (Dark Mode)
  bg: '#121212',
  bgCard: '#1E1E1E',
  bgCardLight: '#2A2A2A',
  bgInput: '#1E1E1E',
  dark: '#121212',

  // Tab Bar
  tabBar: '#1A1A1A',
  tabBarBorder: '#333333',
  tabActive: '#D4AF6A',
  tabInactive: '#666666',

  // Status Colors
  success: '#4CAF50',
  successBg: 'rgba(76, 175, 80, 0.14)',
  warning: '#FF9800',
  warningBg: 'rgba(255, 152, 0, 0.14)',
  error: '#EF5350',
  errorBg: 'rgba(239, 83, 80, 0.14)',
  info: '#42A5F5',
  infoBg: 'rgba(66, 165, 245, 0.14)',

  // Text
  textPrimary: '#F5F5F5',
  textSecondary: '#AAAAAA',
  textMuted: '#666666',
  textInverse: '#1A1A1A',

  // Borders
  border: '#333333',
  borderLight: 'rgba(51, 51, 51, 0.5)',

  // Special
  gold: '#C4973A',
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
}

export const FONTS = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
}

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
}

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: {
    shadowColor: '#C4973A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
}

export const STATUS = {
  AN_FAHRER: {
    label: 'Zugewiesen',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    icon: 'time-outline',
  },
  GELIEFERT: {
    label: 'Geliefert',
    color: '#4CAF50',
    bg: 'rgba(76, 175, 80, 0.12)',
    icon: 'checkmark-circle-outline',
  },
  IN_BEARBEITUNG: {
    label: 'In Bearbeitung',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    icon: 'refresh-outline',
  },
  OFFEN: {
    label: 'Offen',
    color: '#888888',
    bg: 'rgba(136, 136, 136, 0.12)',
    icon: 'ellipse-outline',
  },
}

export const REFRESH_INTERVAL = 30000 // 30 Sekunden