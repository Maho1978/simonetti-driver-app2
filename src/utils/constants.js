// ============================================================
// SIMONETTI DRIVER APP - CONSTANTS & THEME
// ============================================================

export const API_BASE_URL = 'https://www.eiscafe-simonetti.de'

export const COLORS = {
  // Brand
  primary: '#4a5d54',
  primaryDark: '#2d3d36',
  primaryLight: '#6b8a7e',
  primaryGlow: 'rgba(74, 93, 84, 0.15)',
  primaryBg: 'rgba(74, 93, 84, 0.12)',

  // Background (Dark Mode)
  bg: '#0f1a16',
  bgCard: '#1a2720',
  bgCardLight: '#223029',
  bgInput: '#1a2720',
  dark: '#0f1a16',

  // Tab Bar
  tabBar: '#141f1a',
  tabBarBorder: '#2d3d36',
  tabActive: '#6b8a7e',
  tabInactive: '#4a5d54',

  // Status Colors
  success: '#22c55e',
  successBg: 'rgba(34, 197, 94, 0.12)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.12)',
  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.12)',

  // Text
  textPrimary: '#f0f4f2',
  textSecondary: '#8fa89e',
  textMuted: '#556b62',
  textInverse: '#0f1a16',

  // Borders
  border: '#2d3d36',
  borderLight: 'rgba(74, 93, 84, 0.3)',

  // Special
  gold: '#f59e0b',
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
    shadowColor: '#4a5d54',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
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
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.12)',
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
    color: '#8fa89e',
    bg: 'rgba(143, 168, 158, 0.12)',
    icon: 'ellipse-outline',
  },
}

export const REFRESH_INTERVAL = 30000 // 30 Sekunden