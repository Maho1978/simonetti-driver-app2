// ============================================================
// SIMONETTI DRIVER APP - PROFILE SCREEN
// ============================================================

import React from 'react'
import { View, Text, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'
import { Card, Divider, Button } from '../components'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/constants'

const MenuItem = ({ icon, label, value, onPress, danger, accent }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.7}
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
        backgroundColor: danger
          ? COLORS.errorBg
          : accent
          ? COLORS.primaryGlow
          : COLORS.bgCardLight,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons
        name={icon}
        size={18}
        color={danger ? COLORS.error : accent ? COLORS.primaryLight : COLORS.textSecondary}
      />
    </View>
    <Text
      style={{
        color: danger ? COLORS.error : COLORS.textPrimary,
        fontSize: FONTS.sizes.md,
        fontWeight: FONTS.weights.medium,
        flex: 1,
      }}
    >
      {label}
    </Text>
    {value && (
      <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm }}>{value}</Text>
    )}
    {onPress && (
      <Ionicons
        name="chevron-forward"
        size={16}
        color={danger ? COLORS.error : COLORS.textMuted}
      />
    )}
  </TouchableOpacity>
)

export default function ProfileScreen() {
  const { driver, logout } = useAuth()
  const { activeOrders, deliveredOrders } = useOrders()

  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Abmelden', style: 'destructive', onPress: logout },
      ]
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
        {/* Header */}
        <Text
          style={{
            color: COLORS.textPrimary,
            fontSize: FONTS.sizes.xxl,
            fontWeight: FONTS.weights.extrabold,
            marginBottom: SPACING.xl,
          }}
        >
          Profil
        </Text>

        {/* Driver Card */}
        <View
          style={{
            backgroundColor: COLORS.bgCard,
            borderRadius: RADIUS.xxl,
            padding: SPACING.xxl,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: SPACING.lg,
            ...SHADOWS.medium,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: SPACING.lg,
              ...SHADOWS.glow,
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: FONTS.sizes.xxxl,
                fontWeight: FONTS.weights.extrabold,
              }}
            >
              {driver?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>

          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: FONTS.sizes.xxl,
              fontWeight: FONTS.weights.extrabold,
            }}
          >
            {driver?.name}
          </Text>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: FONTS.sizes.md,
              marginTop: SPACING.xs,
            }}
          >
            {driver?.email}
          </Text>

          {/* Online badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: SPACING.md,
              backgroundColor: COLORS.successBg,
              borderRadius: RADIUS.full,
              paddingHorizontal: SPACING.lg,
              paddingVertical: SPACING.xs,
              borderWidth: 1,
              borderColor: 'rgba(34,197,94,0.3)',
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.success,
              }}
            />
            <Text style={{ color: COLORS.success, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold }}>
              Online
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg }}>
          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.bgCard,
              borderRadius: RADIUS.xl,
              padding: SPACING.lg,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ color: COLORS.warning, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold }}>
              {activeOrders.length}
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, marginTop: 2 }}>
              Ausstehend
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.bgCard,
              borderRadius: RADIUS.xl,
              padding: SPACING.lg,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ color: COLORS.success, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold }}>
              {deliveredOrders.length}
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, marginTop: 2 }}>
              Geliefert
            </Text>
          </View>
        </View>

        {/* Vehicle Info */}
        <Card style={{ marginBottom: SPACING.md }}>
          <View style={{ padding: SPACING.lg }}>
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: FONTS.sizes.xs,
                fontWeight: FONTS.weights.semibold,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                marginBottom: SPACING.md,
              }}
            >
              Fahrzeug
            </Text>
            <MenuItem
              icon="car-outline"
              label="Fahrzeug-Typ"
              value={driver?.vehicle_type || '—'}
              accent
            />
            <Divider style={{ marginVertical: 0 }} />
            <MenuItem
              icon="id-card-outline"
              label="Kennzeichen"
              value={driver?.vehicle_plate || '—'}
              accent
            />
          </View>
        </Card>

        {/* Settings */}
        <Card style={{ marginBottom: SPACING.md }}>
          <View style={{ padding: SPACING.lg }}>
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: FONTS.sizes.xs,
                fontWeight: FONTS.weights.semibold,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                marginBottom: SPACING.md,
              }}
            >
              Konto
            </Text>
            <MenuItem icon="person-outline" label="Name" value={driver?.name} />
            <Divider style={{ marginVertical: 0 }} />
            <MenuItem icon="mail-outline" label="E-Mail" value={driver?.email} />
            {driver?.phone && (
              <>
                <Divider style={{ marginVertical: 0 }} />
                <MenuItem icon="call-outline" label="Telefon" value={driver?.phone} />
              </>
            )}
          </View>
        </Card>

        {/* Logout */}
        <Button
          title="Abmelden"
          onPress={handleLogout}
          variant="secondary"
          icon="log-out-outline"
          style={{ marginTop: SPACING.md }}
        />

        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONTS.sizes.xs,
            textAlign: 'center',
            marginTop: SPACING.xxl,
          }}
        >
          Eiscafe Simonetti · Fahrer App v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
