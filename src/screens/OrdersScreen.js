// ============================================================
// SIMONETTI DRIVER APP - OrdersScreen.js  v3.0
// Wetter · Tagesstatistiken · Trinkgeld · Routenoptimierung
// alle Features via useFeatures() togglebar
// ============================================================

import React, { useCallback, useState, useEffect } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  RefreshControl, StatusBar, Switch, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { useOrders } from '../context/OrdersContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { EmptyState, LoadingScreen } from '../components'
import { FONTS, SPACING, RADIUS, SHADOWS, STATUS } from '../utils/constants'
import useLocationTracking from '../hooks/useLocationTracking'
import useAutoStopTracking from '../hooks/useAutoStopTracking'
import { useFeatures } from './ProfileScreen'

// ── Adresse formatieren ───────────────────────────────────
const formatAddress = (address) => {
  if (!address) return ''
  if (typeof address === 'object') return `${address.street}, ${address.zip} ${address.city}`
  return address
}

// ── Wetter-Widget ─────────────────────────────────────────
const WEATHER_CODES = {
  0: ['☀️','Klar'], 1: ['🌤️','Überwiegend klar'], 2: ['⛅','Teilweise bewölkt'],
  3: ['☁️','Bedeckt'], 45: ['🌫️','Nebel'], 48: ['🌫️','Reifnebel'],
  51: ['🌦️','Leichter Niesel'], 53: ['🌦️','Nieselregen'], 55: ['🌧️','Starker Niesel'],
  61: ['🌧️','Leichter Regen'], 63: ['🌧️','Regen'], 65: ['🌧️','Starker Regen'],
  71: ['🌨️','Leichter Schnee'], 73: ['❄️','Schnee'], 75: ['❄️','Starker Schnee'],
  80: ['🌦️','Schauer'], 81: ['🌧️','Starke Schauer'], 82: ['⛈️','Gewittschauer'],
  95: ['⛈️','Gewitter'], 99: ['⛈️','Starkes Gewitter'],
}

const WeatherWidget = () => {
  const { colors: COLORS } = useTheme()
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=51.1089&longitude=6.9482' +
      '&current=temperature_2m,weathercode,windspeed_10m,precipitation&timezone=Europe/Berlin'
    )
      .then(r => r.json())
      .then(d => setWeather({
        temp:   Math.round(d.current.temperature_2m),
        code:   d.current.weathercode,
        wind:   Math.round(d.current.windspeed_10m),
        rain:   d.current.precipitation,
      }))
      .catch(() => setWeather(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <View style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
      <ActivityIndicator size="small" color={COLORS.textMuted} />
    </View>
  )

  if (!weather) return null

  const [icon, desc] = WEATHER_CODES[weather.code] ?? ['🌡️', 'Unbekannt']

  // Hinweis bei Regen
  const rainHint = weather.rain > 0 ? '  ·  🌂 Regenausrüstung!' : ''

  return (
    <View style={{
      marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
      backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
      borderWidth: 1, borderColor: COLORS.border,
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg,
      gap: SPACING.md,
    }}>
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold }}>
          {weather.temp}°C <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.regular }}>{desc}</Text>
        </Text>
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>
          💨 {weather.wind} km/h · Langenfeld{rainHint}
        </Text>
      </View>
      <Text style={{ color: COLORS.textMuted, fontSize: 10, letterSpacing: 0.5 }}>LIVE</Text>
    </View>
  )
}

// ── Tagesstatistiken ──────────────────────────────────────
const DailyStats = ({ orders }) => {
  const { colors: COLORS } = useTheme()
  const delivered = orders.filter(o => o.status === 'GELIEFERT')
  const active    = orders.filter(o => o.status === 'AN_FAHRER')
  const revenue   = delivered.reduce((s, o) => s + (Number(o.total) || 0), 0)
  const tips      = delivered.reduce((s, o) => s + (Number(o.tip)   || 0), 0)

  const items = [
    { icon: 'bicycle-outline',         color: COLORS.warning, label: 'Aktiv',     value: active.length },
    { icon: 'checkmark-circle-outline',color: COLORS.success, label: 'Geliefert', value: delivered.length },
    { icon: 'cash-outline',            color: COLORS.primary, label: 'Umsatz',    value: `${revenue.toFixed(0)}€` },
    { icon: 'heart-outline',           color: '#d4af37',      label: 'Trinkgeld', value: `${tips.toFixed(0)}€` },
  ]

  return (
    <View style={{
      flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
      backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
      borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
    }}>
      {items.map((it, i) => (
        <View key={i} style={{
          flex: 1, alignItems: 'center', paddingVertical: SPACING.md,
          borderRightWidth: i < 3 ? 1 : 0, borderRightColor: COLORS.border,
        }}>
          <Ionicons name={it.icon} size={15} color={it.color} />
          <Text style={{ color: it.color, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.extrabold, marginTop: 3 }}>
            {it.value}
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>{it.label}</Text>
        </View>
      ))}
    </View>
  )
}

// ── Tracking Bar ──────────────────────────────────────────
const TrackingBar = ({ driverId, activeOrderCount = 0 }) => {
  const { colors: COLORS } = useTheme()
  const { isTracking, toggleTracking, currentLocation, error, stopTracking } = useLocationTracking(driverId)
  useAutoStopTracking({ isTracking, activeOrderCount, stopTracking })
  const speedKmh = currentLocation?.coords?.speed != null
    ? Math.round(currentLocation.coords.speed * 3.6) : null

  return (
    <TouchableOpacity
      onPress={toggleTracking} activeOpacity={0.85}
      style={{
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
        backgroundColor: isTracking ? '#111' : COLORS.bgCard,
        borderRadius: RADIUS.lg, paddingVertical: SPACING.sm + 2,
        paddingHorizontal: SPACING.md, borderWidth: 1,
        borderColor: isTracking ? COLORS.primary : COLORS.border,
        gap: SPACING.sm, ...SHADOWS.sm,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isTracking ? COLORS.primary : COLORS.border }} />
      <Ionicons name={isTracking ? 'navigate' : 'navigate-outline'} size={16} color={isTracking ? COLORS.primary : COLORS.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: isTracking ? COLORS.textInverse : COLORS.textSecondary }}>
          {isTracking ? (speedKmh != null ? `Live · ${speedKmh} km/h` : 'Live-Tracking aktiv') : 'Live-Tracking'}
        </Text>
        <Text style={{ fontSize: FONTS.sizes.xs, color: COLORS.textTertiary }}>
          {error ? error : isTracking ? 'Admin sieht deinen Standort' : 'Tippen zum Aktivieren'}
        </Text>
      </View>
      <Switch
        value={isTracking}
        trackColor={{ false: '#6b7280', true: '#22c55e' }}
        thumbColor="#fff" ios_backgroundColor="#6b7280"
      />
    </TouchableOpacity>
  )
}

// ── Routenoptimierung Banner ──────────────────────────────
const RouteBanner = ({ orders }) => {
  const { colors: COLORS } = useTheme()
  if (orders.length < 2) return null

  const handleOptimize = () => {
    // Einfachste Sortierung: alphabetisch nach Straße (ohne Maps API = kostenlos)
    const sorted = [...orders].sort((a, b) =>
      formatAddress(a.delivery_address).localeCompare(formatAddress(b.delivery_address))
    )
    const list = sorted
      .map((o, i) => `${i + 1}. ${o.customer_name}\n    ${formatAddress(o.delivery_address)}`)
      .join('\n\n')
    Alert.alert(`🗺️ Empfohlene Reihenfolge`, list, [{ text: 'OK' }])
  }

  return (
    <TouchableOpacity
      onPress={handleOptimize}
      activeOpacity={0.85}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
        backgroundColor: '#0c1a2e', borderRadius: RADIUS.lg,
        padding: SPACING.md, borderWidth: 1, borderColor: '#1d4ed8',
      }}
    >
      <Ionicons name="git-branch-outline" size={18} color="#60a5fa" />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#60a5fa', fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold }}>
          {orders.length} Lieferungen – Route optimieren
        </Text>
        <Text style={{ color: '#93c5fd', fontSize: FONTS.sizes.xs }}>Tippen für beste Reihenfolge</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color="#60a5fa" />
    </TouchableOpacity>
  )
}

// ── Order Card ────────────────────────────────────────────
const OrderCard = ({ order, onPress, showTip }) => {
  const { colors: COLORS } = useTheme()
  const status    = STATUS[order.status] || STATUS['AN_FAHRER']
  const orderNum  = order.order_number || order.id?.slice(-8).toUpperCase()
  const address   = formatAddress(order.delivery_address)
  const itemCount = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0
  const timeAgo   = formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: de })

  return (
    <TouchableOpacity
      onPress={onPress} activeOpacity={0.85}
      style={{
        backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
        marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
        borderWidth: 1, borderColor: COLORS.border,
        overflow: 'hidden', ...SHADOWS.medium,
      }}
    >
      <View style={{ height: 3, backgroundColor: status.color }} />
      <View style={{ padding: SPACING.lg }}>
        {/* Kopfzeile */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md }}>
          <View>
            <Text style={{ color: COLORS.textMuted, fontSize: 10, letterSpacing: 0.5 }}>BESTELLUNG</Text>
            <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold }}>
              #{orderNum}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold }}>
              {Number(order.total || 0).toFixed(2)} €
            </Text>
            {/* Trinkgeld-Badge – nur wenn feature aktiv und Betrag > 0 */}
            {showTip && Number(order.tip) > 0 && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: RADIUS.full,
                paddingHorizontal: SPACING.sm, paddingVertical: 2,
                borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)',
              }}>
                <Ionicons name="heart" size={10} color="#d4af37" />
                <Text style={{ color: '#d4af37', fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold }}>
                  +{Number(order.tip).toFixed(2)} € TG
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Infos */}
        <View style={{ gap: SPACING.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
            <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, flex: 1 }} numberOfLines={1}>
              {order.customer_name}
            </Text>
          </View>
          {address ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
              <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, flex: 1 }} numberOfLines={1}>{address}</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs }}>
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>{itemCount} Artikel</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>{timeAgo}</Text>
          </View>
        </View>

        {/* Status */}
        <View style={{ marginTop: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status.color }} />
          <Text style={{ color: status.color, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold }}>{status.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ── Hauptscreen ───────────────────────────────────────────
export default function OrdersScreen({ navigation }) {
  const { colors: COLORS } = useTheme()
  const { activeOrders: ctxActive, deliveredOrders, isLoading, isRefreshing, refresh } = useOrders()
  const orders = [...(ctxActive || []), ...(deliveredOrders || [])]
  const { driver } = useAuth()
  const { features } = useFeatures()

  const activeOrders = orders.filter(o => o.status === 'AN_FAHRER')

  if (isLoading && orders.length === 0) return <LoadingScreen message="Lade Bestellungen..." />

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <FlatList
        data={activeOrders}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={() => (
          <View>
            {/* Titel */}
            <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.lg }}>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold }}>Bestellungen</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 }}>
                {activeOrders.length} aktive Lieferung{activeOrders.length !== 1 ? 'en' : ''}
              </Text>
            </View>

            {/* Wetter */}
            {features.weatherWidget && <WeatherWidget />}

            {/* Tagesstatistiken */}
            {features.dailyStats && <DailyStats orders={orders} />}

            {/* Tracking Bar */}
            <TrackingBar driverId={driver?.id} activeOrderCount={activeOrders.length} />

            {/* Routenoptimierung */}
            {features.routeOptimization && <RouteBanner orders={activeOrders} />}
          </View>
        )}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            showTip={features.showTip}
            onPress={() => navigation.navigate('OrderDetail', { order: item })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="bicycle-outline"
            title="Keine aktiven Lieferungen"
            subtitle="Neue Bestellungen erscheinen hier automatisch."
          />
        }
      />
    </SafeAreaView>
  )
}