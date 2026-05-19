// ============================================================
// SIMONETTI DRIVER APP - SHARED COMPONENTS
// ============================================================

import React, { useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/constants'

// ──────────────────────────────────────────────
// BUTTON
// ──────────────────────────────────────────────
export const Button = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | danger | ghost
  size = 'lg', // sm | md | lg
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start()
  }
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start()
  }

  const variants = {
    primary: { bg: COLORS.primary, text: COLORS.white, border: 'transparent' },
    secondary: { bg: COLORS.bgCardLight, text: COLORS.textPrimary, border: COLORS.border },
    danger: { bg: COLORS.error, text: COLORS.white, border: 'transparent' },
    success: { bg: COLORS.success, text: COLORS.white, border: 'transparent' },
    ghost: { bg: 'transparent', text: COLORS.primary, border: COLORS.primaryLight },
  }

  const sizes = {
    sm: { height: 40, fontSize: FONTS.sizes.sm, paddingH: SPACING.lg, iconSize: 16 },
    md: { height: 48, fontSize: FONTS.sizes.md, paddingH: SPACING.xl, iconSize: 18 },
    lg: { height: 58, fontSize: FONTS.sizes.lg, paddingH: SPACING.xxl, iconSize: 20 },
  }

  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.lg
  const isDisabled = disabled || loading

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
        style={[
          {
            height: s.height,
            backgroundColor: isDisabled ? COLORS.textMuted : v.bg,
            borderRadius: RADIUS.lg,
            borderWidth: v.border !== 'transparent' ? 1 : 0,
            borderColor: v.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: s.paddingH,
            gap: SPACING.sm,
          },
          !isDisabled && variant === 'primary' && SHADOWS.glow,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.text} size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={s.iconSize} color={v.text} />
            )}
            <Text
              style={{
                color: v.text,
                fontSize: s.fontSize,
                fontWeight: FONTS.weights.bold,
                letterSpacing: 0.3,
              }}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={s.iconSize} color={v.text} />
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

// ──────────────────────────────────────────────
// BADGE
// ──────────────────────────────────────────────
export const Badge = ({ label, color, bg, size = 'md' }) => {
  const sizes = { sm: { fontSize: 10, px: 8, py: 3 }, md: { fontSize: 12, px: 10, py: 4 } }
  const s = sizes[size] || sizes.md
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: RADIUS.full,
        paddingHorizontal: s.px,
        paddingVertical: s.py,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color, fontSize: s.fontSize, fontWeight: FONTS.weights.semibold }}>
        {label}
      </Text>
    </View>
  )
}

// ──────────────────────────────────────────────
// CARD
// ──────────────────────────────────────────────
export const Card = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          {
            backgroundColor: COLORS.bgCard,
            borderRadius: RADIUS.xl,
            borderWidth: 1,
            borderColor: COLORS.border,
            overflow: 'hidden',
          },
          SHADOWS.medium,
          style,
        ]}
      >
        {children}
      </TouchableOpacity>
    )
  }
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.bgCard,
          borderRadius: RADIUS.xl,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: 'hidden',
        },
        SHADOWS.medium,
        style,
      ]}
    >
      {children}
    </View>
  )
}

// ──────────────────────────────────────────────
// INPUT
// ──────────────────────────────────────────────
export { default as Input } from './Input'

// ──────────────────────────────────────────────
// DIVIDER
// ──────────────────────────────────────────────
export const Divider = ({ style }) => (
  <View
    style={[{ height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md }, style]}
  />
)

// ──────────────────────────────────────────────
// EMPTY STATE
// ──────────────────────────────────────────────
export const EmptyState = ({ icon = 'cube-outline', title, subtitle }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.section }}>
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primaryGlow,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
      }}
    >
      <Ionicons name={icon} size={36} color={COLORS.primaryLight} />
    </View>
    <Text
      style={{
        color: COLORS.textPrimary,
        fontSize: FONTS.sizes.xl,
        fontWeight: FONTS.weights.bold,
        textAlign: 'center',
        marginBottom: SPACING.sm,
      }}
    >
      {title}
    </Text>
    {subtitle && (
      <Text
        style={{
          color: COLORS.textSecondary,
          fontSize: FONTS.sizes.md,
          textAlign: 'center',
          lineHeight: 22,
        }}
      >
        {subtitle}
      </Text>
    )}
  </View>
)

// ──────────────────────────────────────────────
// LOADING SCREEN
// ──────────────────────────────────────────────
export const LoadingScreen = ({ message = 'Laden...' }) => (
  <View
    style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}
  >
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={{ color: COLORS.textSecondary, marginTop: SPACING.lg, fontSize: FONTS.sizes.md }}>
      {message}
    </Text>
  </View>
)

// ──────────────────────────────────────────────
// INFO ROW (for detail screen)
// ──────────────────────────────────────────────
export const InfoRow = ({ icon, label, value, valueStyle, onPress, accent }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.md,
      gap: SPACING.md,
    }}
  >
    <View
      style={{
        width: 38,
        height: 38,
        borderRadius: RADIUS.md,
        backgroundColor: accent ? COLORS.primaryGlow : COLORS.bgCardLight,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={18} color={accent ? COLORS.primaryLight : COLORS.textSecondary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginBottom: 2 }}>
        {label}
      </Text>
      <Text
        style={[
          { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
          valueStyle,
        ]}
      >
        {value}
      </Text>
    </View>
    {onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />}
  </TouchableOpacity>
)
