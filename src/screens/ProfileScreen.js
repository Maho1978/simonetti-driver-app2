// ============================================================
// SIMONETTI FAHRER APP - ProfileScreen.js  v3.0
// FeaturesProvider (Context) + alle Toggles zentral
// ============================================================

import React, { useState, useEffect, createContext, useContext } from 'react'
import {
  View, Text, ScrollView,
  TouchableOpacity, Switch, Alert, StyleSheet,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import useLocationTracking from '../hooks/useLocationTracking'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/constants'

// ─────────────────────────────────────────────────────────────
// FEATURES CONTEXT
// Einbinden in App.js:  <FeaturesProvider><Navigator /></FeaturesProvider>
// Nutzen in Screen:     const { features, toggle } = useFeatures()
// ─────────────────────────────────────────────────────────────
const FEATURES_KEY = 'simonetti_features_v1'

export const DEFAULT_FEATURES = {
  weatherWidget:     true,   // Wetter-Widget auf Homescreen
  dailyStats:        true,   // Tagesstatistiken auf Homescreen
  routeOptimization: true,   // Routenoptimierung-Banner
  showTip:           true,   // Trinkgeld auf Bestellkarte
  imHereButton:      true,   // "Ich bin da" WhatsApp Button
  deliveryPhoto:     false,  // Foto bei Zustellung
  deliveryCode:      false,  // 4-stelliger Liefercode
}

const FeaturesContext = createContext({
  features: DEFAULT_FEATURES,
  toggle: () => {},
  setF: () => {},
})

export const useFeatures = () => useContext(FeaturesContext)

export const FeaturesProvider = ({ children }) => {
  const [features, setFeatures] = useState(DEFAULT_FEATURES)

  useEffect(() => {
    AsyncStorage.getItem(FEATURES_KEY)
      .then(raw => { if (raw) setFeatures(prev => ({ ...prev, ...JSON.parse(raw) })) })
      .catch(() => {})
  }, [])

  const save = (next) => {
    setFeatures(next)
    AsyncStorage.setItem(FEATURES_KEY, JSON.stringify(next)).catch(() => {})
  }

  const toggle = (key) => save({ ...features, [key]: !features[key] })
  const setF   = (key, val) => save({ ...features, [key]: val })

  return (
    <FeaturesContext.Provider value={{ features, toggle, setF }}>
      {children}
    </FeaturesContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────
// UI-Helfer
// ─────────────────────────────────────────────────────────────
const SectionLabel = ({ label }) => (
  <Text style={s.sectionLabel}>{label}</Text>
)

const Divider = () => <View style={s.divider} />

const Row = ({ icon, iconColor = COLORS.textMuted, label, sub, value, onToggle }) => (
  <View style={s.row}>
    <View style={[s.rowIcon, { backgroundColor: iconColor + '22' }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={s.rowText}>
      <Text style={s.rowLabel}>{label}</Text>
      {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: COLORS.border, true: COLORS.primary }}
      thumbColor="#fff"
      ios_backgroundColor={COLORS.border}
    />
  </View>
)

// ─────────────────────────────────────────────────────────────
// HAUPTSCREEN
// ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { driver, logout } = useAuth()
  const { features, toggle } = useFeatures()
  const { isTracking, currentLocation, error: trackingError, toggleTracking } = useLocationTracking(driver?.id)

  const speedKmh = currentLocation?.coords?.speed != null
    ? Math.round(currentLocation.coords.speed * 3.6) : null

  const handleLogout = () => {
    Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abmelden', style: 'destructive', onPress: async () => {
        if (isTracking) await toggleTracking()
        logout()
      }},
    ])
  }

  const handleTrackingToggle = () => {
    if (!isTracking) {
      Alert.alert(
        'Live-Tracking aktivieren',
        'Dein Standort wird alle 15 Sekunden an den Admin übertragen.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Aktivieren', onPress: toggleTracking },
        ]
      )
    } else {
      toggleTracking()
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Text style={s.title}>Profil</Text>

        {/* ── Fahrer-Card ───────────────────────────────── */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarLetter}>{driver?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={s.driverName}>{driver?.name ?? 'Fahrer'}</Text>
          <Text style={s.driverEmail}>{driver?.email ?? ''}</Text>
          {driver?.vehicle_type ? (
            <View style={s.vehicleBadge}>
              <Ionicons name="car-outline" size={13} color={COLORS.primary} />
              <Text style={s.vehicleText}>
                {driver.vehicle_type}{driver.vehicle_plate ? ` · ${driver.vehicle_plate}` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── GPS Tracking ──────────────────────────────── */}
        <SectionLabel label="Live-Tracking" />
        <View style={[s.card, isTracking && s.cardActive]}>
          <Row
            icon={isTracking ? 'navigate' : 'navigate-outline'}
            iconColor={isTracking ? COLORS.primary : COLORS.textSecondary}
            label="Standort übertragen"
            sub={isTracking
              ? `Aktiv – Admin sieht dich live${speedKmh != null ? ` · ${speedKmh} km/h` : ''}`
              : 'Inaktiv'}
            value={isTracking}
            onToggle={handleTrackingToggle}
          />
          {trackingError ? (
            <View style={s.errorBox}>
              <Ionicons name="warning-outline" size={13} color={COLORS.error} />
              <Text style={s.errorText}>{trackingError}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Homescreen-Features ───────────────────────── */}
        <SectionLabel label="Homescreen" />
        <View style={s.card}>
          <Row
            icon="partly-sunny-outline" iconColor="#0ea5e9"
            label="Wetter-Widget"
            sub="Aktuelles Wetter in Langenfeld"
            value={features.weatherWidget}
            onToggle={() => toggle('weatherWidget')}
          />
          <Divider />
          <Row
            icon="stats-chart-outline" iconColor="#22c55e"
            label="Tages-Statistiken"
            sub="Lieferungen, Umsatz & Trinkgeld"
            value={features.dailyStats}
            onToggle={() => toggle('dailyStats')}
          />
          <Divider />
          <Row
            icon="git-branch-outline" iconColor="#60a5fa"
            label="Routenoptimierung"
            sub="Vorschlag bei mehreren Bestellungen"
            value={features.routeOptimization}
            onToggle={() => toggle('routeOptimization')}
          />
        </View>

        {/* ── Bestellkarte ──────────────────────────────── */}
        <SectionLabel label="Bestellkarte" />
        <View style={s.card}>
          <Row
            icon="heart-outline" iconColor="#d4af37"
            label="Trinkgeld anzeigen"
            sub="Betrag direkt auf der Bestellkarte"
            value={features.showTip}
            onToggle={() => toggle('showTip')}
          />
        </View>

        {/* ── Lieferung ─────────────────────────────────── */}
        <SectionLabel label="Bei der Lieferung" />
        <View style={s.card}>
          <Row
            icon="logo-whatsapp" iconColor="#25D366"
            label='"Ich bin da" Button'
            sub="WhatsApp-Nachricht an Kunden – 1 Tap"
            value={features.imHereButton}
            onToggle={() => toggle('imHereButton')}
          />
          <Divider />
          <Row
            icon="camera-outline" iconColor="#f97316"
            label="Foto bei Zustellung"
            sub="Kamera für Liefernachweis öffnen"
            value={features.deliveryPhoto}
            onToggle={() => toggle('deliveryPhoto')}
          />
          <Divider />
          <Row
            icon="keypad-outline" iconColor="#6366f1"
            label="Liefercode"
            sub="Kunde bestätigt mit 4-stelligem Code"
            value={features.deliveryCode}
            onToggle={() => toggle('deliveryCode')}
          />
        </View>

        {/* Abmelden */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={s.logoutText}>Abmelden</Text>
        </TouchableOpacity>

        <Text style={s.version}>Simonetti Eiscafé · Fahrer App v3.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll:        { padding: SPACING.lg, paddingBottom: 100 },
  title:         { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.textPrimary, marginBottom: SPACING.xl },
  sectionLabel:  { fontSize: 11, fontWeight: FONTS.weights.bold, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginTop: SPACING.xl, marginBottom: SPACING.sm },

  card:          { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  cardActive:    { borderColor: COLORS.primary + '60', backgroundColor: COLORS.primaryBg },
  divider:       { height: 1, backgroundColor: COLORS.border, marginLeft: 54 },

  row:           { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.md },
  rowIcon:       { width: 36, height: 36, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  rowText:       { flex: 1 },
  rowLabel:      { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
  rowSub:        { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },

  profileCard:   { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.xs, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  avatar:        { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  avatarLetter:  { fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.bold, color: COLORS.primary },
  driverName:    { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.textPrimary, marginBottom: 4 },
  driverEmail:   { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  vehicleBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryBg, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.primary + '40' },
  vehicleText:   { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: FONTS.weights.medium },

  errorBox:      { flexDirection: 'row', alignItems: 'center', gap: 6, margin: SPACING.sm, padding: SPACING.sm, backgroundColor: COLORS.errorBg, borderRadius: RADIUS.sm },
  errorText:     { fontSize: FONTS.sizes.xs, color: COLORS.error, flex: 1 },

  logoutBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.errorBg, borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.xxl, borderWidth: 1, borderColor: COLORS.error + '30' },
  logoutText:    { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.error },
  version:       { textAlign: 'center', color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: SPACING.xl },
})