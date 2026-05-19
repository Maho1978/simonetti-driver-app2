// ============================================================
// SIMONETTI FAHRER APP - ProfileScreen.js  v4.0
// Theme-Switcher + 2 Tracking-Toggles + FeaturesProvider
// ============================================================

import React, { useState, useEffect, createContext, useContext, useMemo } from 'react'
import {
  View, Text, ScrollView,
  TouchableOpacity, Switch, Alert, StyleSheet,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import useLocationTracking from '../hooks/useLocationTracking'
import { FONTS, SPACING, RADIUS, SHADOWS } from '../utils/constants'

// ─────────────────────────────────────────────────────────────
// FEATURES CONTEXT (unverändert — bestehende API)
// ─────────────────────────────────────────────────────────────
const FEATURES_KEY = 'simonetti_features_v1'
const CUSTOMER_TRACKING_KEY = 'simonetti_customer_tracking_v1'

export const DEFAULT_FEATURES = {
  weatherWidget:     true,
  dailyStats:        true,
  routeOptimization: true,
  showTip:           true,
  imHereButton:      true,
  deliveryPhoto:     false,
  deliveryCode:      false,
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
// HAUPTSCREEN
// ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { colors: COLORS, themeMode, setThemeMode } = useTheme()
  const styles = useMemo(() => makeStyles(COLORS), [COLORS])

  const { driver, logout } = useAuth()
  const { features, toggle } = useFeatures()
  const { isTracking, currentLocation, error: trackingError, toggleTracking } = useLocationTracking(driver?.id)

  // Kunden-Tracking-Toggle (UI-State, Backend-Filter folgt in einem späteren Release)
  const [customerTracking, setCustomerTracking] = useState(false)
  useEffect(() => {
    AsyncStorage.getItem(CUSTOMER_TRACKING_KEY)
      .then(raw => { if (raw === 'true') setCustomerTracking(true) })
      .catch(() => {})
  }, [])
  const handleCustomerTrackingToggle = (next) => {
    setCustomerTracking(next)
    AsyncStorage.setItem(CUSTOMER_TRACKING_KEY, next ? 'true' : 'false').catch(() => {})
  }

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

  const handleAdminTrackingToggle = () => {
    if (!isTracking) {
      Alert.alert(
        'Admin-Tracking aktivieren',
        'Dein Standort wird alle 15 Sek an das Admin-Dashboard übertragen, damit Mahmut sehen kann wo du bist. Sichtbar nur im Admin-Kanban — nicht für Kunden.',
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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Profil</Text>

        {/* ── Fahrer-Card ───────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{driver?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.driverName}>{driver?.name ?? 'Fahrer'}</Text>
          <Text style={styles.driverEmail}>{driver?.email ?? ''}</Text>
          {driver?.vehicle_type ? (
            <View style={styles.vehicleBadge}>
              <Ionicons name="car-outline" size={13} color={COLORS.primary} />
              <Text style={styles.vehicleText}>
                {driver.vehicle_type}{driver.vehicle_plate ? ` · ${driver.vehicle_plate}` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Theme ─────────────────────────────────────── */}
        <SectionLabel COLORS={COLORS} styles={styles} label="Darstellung" />
        <View style={styles.card}>
          <View style={styles.themeRow}>
            <View style={styles.rowIcon}>
              <Ionicons name="contrast-outline" size={18} color={COLORS.primaryLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Erscheinungsbild</Text>
              <Text style={styles.rowSub}>System folgt automatisch dem Handy</Text>
            </View>
          </View>
          <View style={styles.themeSegments}>
            {[
              { key: 'system', label: 'Auto', icon: 'phone-portrait-outline' },
              { key: 'light',  label: 'Hell', icon: 'sunny-outline' },
              { key: 'dark',   label: 'Dunkel', icon: 'moon-outline' },
            ].map(opt => {
              const active = themeMode === opt.key
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setThemeMode(opt.key)}
                  activeOpacity={0.75}
                  style={[styles.themeSegment, active && styles.themeSegmentActive]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={16}
                    color={active ? COLORS.textInverse : COLORS.textSecondary}
                  />
                  <Text style={[styles.themeSegmentText, active && styles.themeSegmentTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* ── Tracking ──────────────────────────────────── */}
        <SectionLabel COLORS={COLORS} styles={styles} label="Live-Tracking" />

        {/* Admin-Tracking */}
        <View style={[styles.card, isTracking && styles.cardActive]}>
          <TrackingRow
            COLORS={COLORS}
            styles={styles}
            icon={isTracking ? 'navigate' : 'navigate-outline'}
            iconColor={isTracking ? COLORS.primary : COLORS.textSecondary}
            label="Admin-Tracking (Kanban)"
            sub={isTracking
              ? `Aktiv · Admin sieht dich live${speedKmh != null ? ` · ${speedKmh} km/h` : ''}`
              : 'Aus — Mahmut sieht deinen Standort im Admin-Kanban'}
            value={isTracking}
            onToggle={handleAdminTrackingToggle}
          />
          <Text style={styles.helperHint}>
            Sendet alle 15 Sekunden GPS-Position an das Admin-Dashboard. Schaltet sich
            30 Min nach der letzten Lieferung automatisch ab.
          </Text>
          {trackingError ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={13} color={COLORS.error} />
              <Text style={styles.errorText}>{trackingError}</Text>
            </View>
          ) : null}
        </View>

        {/* Kunden-Tracking */}
        <View style={[styles.card, customerTracking && styles.cardActive]}>
          <TrackingRow
            COLORS={COLORS}
            styles={styles}
            icon={customerTracking ? 'people' : 'people-outline'}
            iconColor={customerTracking ? COLORS.info : COLORS.textSecondary}
            label="Kunden-Tracking (Lieferstatus)"
            sub={customerTracking
              ? 'Kunden sehen deine ungefähre Position'
              : 'Aus — Kunden sehen nur den Status, nicht deinen Standort'}
            value={customerTracking}
            onToggle={handleCustomerTrackingToggle}
          />
          <Text style={styles.helperHint}>
            Erlaubt Kunden auf der Lieferstatus-Seite eine ungefähre ETA + Position zu
            sehen. Backend-Filterung kommt im nächsten Server-Update — Toggle wird
            jetzt schon respektiert sobald Backend-Side live ist.
          </Text>
        </View>

        {/* ── Homescreen-Features ───────────────────────── */}
        <SectionLabel COLORS={COLORS} styles={styles} label="Homescreen" />
        <View style={styles.card}>
          <FeatureRow
            COLORS={COLORS} styles={styles}
            icon="partly-sunny-outline" iconColor="#0ea5e9"
            label="Wetter-Widget"
            sub="Aktuelles Wetter in Langenfeld"
            value={features.weatherWidget}
            onToggle={() => toggle('weatherWidget')}
          />
          <Divider COLORS={COLORS} styles={styles} />
          <FeatureRow
            COLORS={COLORS} styles={styles}
            icon="stats-chart-outline" iconColor="#22c55e"
            label="Tages-Statistiken"
            sub="Lieferungen, Umsatz & Trinkgeld"
            value={features.dailyStats}
            onToggle={() => toggle('dailyStats')}
          />
          <Divider COLORS={COLORS} styles={styles} />
          <FeatureRow
            COLORS={COLORS} styles={styles}
            icon="git-branch-outline" iconColor="#60a5fa"
            label="Routenoptimierung"
            sub="Vorschlag bei mehreren Bestellungen"
            value={features.routeOptimization}
            onToggle={() => toggle('routeOptimization')}
          />
        </View>

        {/* ── Bestellkarte ──────────────────────────────── */}
        <SectionLabel COLORS={COLORS} styles={styles} label="Bestellkarte" />
        <View style={styles.card}>
          <FeatureRow
            COLORS={COLORS} styles={styles}
            icon="heart-outline" iconColor="#d4af37"
            label="Trinkgeld anzeigen"
            sub="Betrag direkt auf der Bestellkarte"
            value={features.showTip}
            onToggle={() => toggle('showTip')}
          />
        </View>

        {/* ── Lieferung ─────────────────────────────────── */}
        <SectionLabel COLORS={COLORS} styles={styles} label="Bei der Lieferung" />
        <View style={styles.card}>
          <FeatureRow
            COLORS={COLORS} styles={styles}
            icon="logo-whatsapp" iconColor="#25D366"
            label='"Ich bin da" Button'
            sub="WhatsApp-Nachricht an Kunden — 1 Tap"
            value={features.imHereButton}
            onToggle={() => toggle('imHereButton')}
          />
          <Divider COLORS={COLORS} styles={styles} />
          <FeatureRow
            COLORS={COLORS} styles={styles}
            icon="camera-outline" iconColor="#f97316"
            label="Foto bei Zustellung"
            sub="Kamera für Liefernachweis öffnen"
            value={features.deliveryPhoto}
            onToggle={() => toggle('deliveryPhoto')}
          />
          <Divider COLORS={COLORS} styles={styles} />
          <FeatureRow
            COLORS={COLORS} styles={styles}
            icon="keypad-outline" iconColor="#6366f1"
            label="Liefercode"
            sub="Kunde bestätigt mit 4-stelligem Code"
            value={features.deliveryCode}
            onToggle={() => toggle('deliveryCode')}
          />
        </View>

        {/* Abmelden */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Abmelden</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Simonetti Eiscafé · Fahrer App v4.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS (alle theme-aware via Prop)
// ─────────────────────────────────────────────────────────────
const SectionLabel = ({ label, styles }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
)

const Divider = ({ styles }) => <View style={styles.divider} />

const TrackingRow = ({ COLORS, styles, icon, iconColor, label, sub, value, onToggle }) => (
  <View style={styles.row}>
    <View style={[styles.rowIcon, { backgroundColor: iconColor + '22' }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
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

const FeatureRow = ({ COLORS, styles, icon, iconColor, label, sub, value, onToggle }) => (
  <View style={styles.row}>
    <View style={[styles.rowIcon, { backgroundColor: iconColor + '22' }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
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
// STYLES (factory — wird bei Theme-Wechsel neu erzeugt)
// ─────────────────────────────────────────────────────────────
const makeStyles = (COLORS) => StyleSheet.create({
  scroll:        { padding: SPACING.lg, paddingBottom: 100 },
  title:         { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.textPrimary, marginBottom: SPACING.xl },
  sectionLabel:  { fontSize: 11, fontWeight: FONTS.weights.bold, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginTop: SPACING.xl, marginBottom: SPACING.sm },

  card:          { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm },
  cardActive:    { borderColor: COLORS.primary + '60', backgroundColor: COLORS.primaryBg },
  divider:       { height: 1, backgroundColor: COLORS.border, marginLeft: 54 },

  row:           { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.md },
  rowIcon:       { width: 36, height: 36, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryGlow },
  rowText:       { flex: 1 },
  rowLabel:      { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
  rowSub:        { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  helperHint:    { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, lineHeight: 16, paddingHorizontal: 4, paddingBottom: SPACING.sm },

  // Theme switcher segmented control
  themeRow:      { flexDirection: 'row', alignItems: 'center', paddingTop: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.sm },
  themeSegments: { flexDirection: 'row', backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, padding: 3, marginBottom: SPACING.md },
  themeSegment:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: RADIUS.sm },
  themeSegmentActive: { backgroundColor: COLORS.primary },
  themeSegmentText:   { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  themeSegmentTextActive: { color: COLORS.textInverse },

  profileCard:   { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.xs, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  avatar:        { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  avatarLetter:  { fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.bold, color: COLORS.primaryLight },
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
