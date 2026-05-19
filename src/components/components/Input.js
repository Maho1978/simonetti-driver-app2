// ============================================================
// SIMONETTI DRIVER APP - INPUT COMPONENT
// ============================================================

import React, { useState, useRef } from 'react'
import { View, TextInput, Text, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/constants'

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  error,
  autoFocus = false,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const borderAnim = useRef(new Animated.Value(0)).current

  const handleFocus = () => {
    setIsFocused(true)
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start()
  }

  const handleBlur = () => {
    setIsFocused(false)
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start()
  }

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? COLORS.error : COLORS.border, error ? COLORS.error : COLORS.primaryLight],
  })

  return (
    <View style={{ marginBottom: SPACING.lg }}>
      {label && (
        <Text
          style={{
            color: isFocused ? COLORS.primaryLight : COLORS.textSecondary,
            fontSize: FONTS.sizes.sm,
            fontWeight: FONTS.weights.medium,
            marginBottom: SPACING.sm,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.bgInput,
          borderRadius: RADIUS.lg,
          borderWidth: 1.5,
          borderColor,
          paddingHorizontal: SPACING.lg,
          height: 56,
        }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? COLORS.primaryLight : COLORS.textMuted}
            style={{ marginRight: SPACING.md }}
          />
        )}

        <TextInput
          style={{
            flex: 1,
            color: COLORS.textPrimary,
            fontSize: FONTS.sizes.md,
            fontWeight: FONTS.weights.medium,
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          selectionColor={COLORS.primary}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs, gap: 4 }}>
          <Ionicons name="alert-circle-outline" size={14} color={COLORS.error} />
          <Text style={{ color: COLORS.error, fontSize: FONTS.sizes.sm }}>{error}</Text>
        </View>
      )}
    </View>
  )
}

export default Input
