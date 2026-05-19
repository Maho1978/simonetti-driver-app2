// ============================================================
// SIMONETTI DRIVER APP - LOGIN SCREEN
// ============================================================

import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components'
import Input from '../components/Input'
import { FONTS, SPACING, RADIUS, SHADOWS } from '../utils/constants'

const { width, height } = Dimensions.get('window')

export default function LoginScreen() {
  const { colors: COLORS, isDark } = useTheme()
  const { login, isLoggingIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const passwordRef = useRef(null)

  // Animations
  const logoAnim = useRef(new Animated.Value(0)).current
  const formAnim = useRef(new Animated.Value(0)).current
  const shakeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start()
  }, [])

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start()
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Bitte E-Mail und Passwort eingeben')
      shake()
      return
    }
    setError('')
    const result = await login(email.trim().toLowerCase(), password)
    if (!result.success) {
      setError(result.error || 'Login fehlgeschlagen')
      shake()
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.bg} />

      {/* Background gradient */}
      <LinearGradient
        colors={[isDark ? '#1a3028' : '#e8ecea', COLORS.bg, COLORS.bg]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.5 }}
      />

      {/* Decorative circles */}
      <View
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 250,
          height: 250,
          borderRadius: 125,
          backgroundColor: COLORS.primaryGlow,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 60,
          left: -60,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: 'rgba(74, 93, 84, 0.06)',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: SPACING.xxl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <Animated.View
            style={{
              alignItems: 'center',
              marginBottom: SPACING.section + 8,
              opacity: logoAnim,
              transform: [
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            }}
          >
            {/* Logo icon */}
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 26,
                backgroundColor: COLORS.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.xl,
                ...SHADOWS.glow,
              }}
            >
              <Text style={{ fontSize: 40 }}>🍦</Text>
            </View>

            <Text
              style={{
                color: COLORS.textPrimary,
                fontSize: FONTS.sizes.xxxl,
                fontWeight: FONTS.weights.extrabold,
                letterSpacing: -0.5,
              }}
            >
              Simonetti
            </Text>
            <Text
              style={{
                color: COLORS.textSecondary,
                fontSize: FONTS.sizes.lg,
                fontWeight: FONTS.weights.medium,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginTop: 4,
              }}
            >
              Fahrer App
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={{
              opacity: formAnim,
              transform: [
                {
                  translateY: formAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
                { translateX: shakeAnim },
              ],
            }}
          >
            <View
              style={{
                backgroundColor: COLORS.bgCard,
                borderRadius: RADIUS.xxl,
                borderWidth: 1,
                borderColor: COLORS.border,
                padding: SPACING.xxl,
                ...SHADOWS.large,
              }}
            >
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: FONTS.sizes.xl,
                  fontWeight: FONTS.weights.bold,
                  marginBottom: SPACING.xxl,
                }}
              >
                Anmelden
              </Text>

              <Input
                label="E-Mail"
                value={email}
                onChangeText={(t) => { setEmail(t); setError('') }}
                placeholder="fahrer@simonetti.de"
                keyboardType="email-address"
                icon="mail-outline"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />

              <Input
                label="Passwort"
                value={password}
                onChangeText={(t) => { setPassword(t); setError('') }}
                placeholder="••••••••"
                secureTextEntry
                icon="lock-closed-outline"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                blurOnSubmit
              />

              {/* Error Message */}
              {error ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: COLORS.errorBg,
                    borderRadius: RADIUS.md,
                    padding: SPACING.md,
                    marginBottom: SPACING.lg,
                    gap: SPACING.sm,
                    borderWidth: 1,
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                  <Text style={{ color: COLORS.error, fontSize: FONTS.sizes.sm, flex: 1 }}>
                    {error}
                  </Text>
                </View>
              ) : null}

              <Button
                title="Anmelden"
                onPress={handleLogin}
                loading={isLoggingIn}
                icon="arrow-forward"
                iconPosition="right"
              />
            </View>

            {/* Footer */}
            <View style={{ alignItems: 'center', marginTop: SPACING.xxl, gap: SPACING.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
                <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.textMuted} />
                <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
                  Sichere Verbindung
                </Text>
              </View>
              <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>
                Eiscafe Simonetti · Fahrerbereich
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
