// ============================================================
// SIMONETTI DRIVER APP - ORDERS LIST SCREEN
// ============================================================

import React, { useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { format, formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { useOrders } from '../context/OrdersContext'
import { useAuth } from '../context/AuthContext'
import { EmptyState, LoadingScreen, Badge } from '../components'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, STATUS } from '../utils/constants'

// ──────────────────────────────────────────────
// ORDER CARD COMPONENT
// ──────────────────────────────────────────────
const OrderCard = ({ order, onPress }) => {
  const scale = new Animated.Value(1)
  const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0
  const createdAt = new Date(order.created_at)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: de })
  const statusInfo = STATUS[order.status] || STATUS.AN_FAHRER

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start()
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start()

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={{
          backgroundColor: COLORS.bgCard,
          borderRadius: RADIUS.xl,
          marginHorizontal: SPACING.lg,
          marginBottom: SPACING.md,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: 'hidden',
          ...SHADOWS.medium,
        }}
      >
        {/* Colored top accent */}
        <View style={{ height: 3, backgroundColor: statusInfo.color }} />

        <View style={{ padding: SPACING.lg }}>
          {/* Header row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md }}>
            <View>
              <Text
                style={{
                  color: COLORS.textMuted,
                  fontSize: FONTS.sizes.xs,
                  fontWeight: FONTS.weights.medium,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                Bestellung
              </Text>
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: FONTS.sizes.xl,
                  fontWeight: FONTS.weights.extrabold,
                  letterSpacing: 0.5,
                }}
              >
                #{order.order_number || order.id?.slice(-8).toUpperCase()}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end', gap: SPACING.xs }}>
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: FONTS.sizes.xxl,
                  fontWeight: FONTS.weights.extrabold,
                  color: COLORS.success,
                }}
              >
                {Number(order.total).toFixed(2)} €
              </Text>
              <Badge label={statusInfo.label} color={statusInfo.color} bg={statusInfo.bg} size="sm" />
            </View>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.md }} />

          {/* Customer info */}
          <View style={{ gap: SPACING.sm }}>
            {/* Name + Phone */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primaryGlow, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person" size={14} color={COLORS.primaryLight} />
              </View>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, flex: 1 }}>
                {order.customer_name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="call-outline" size={13} color={COLORS.textMuted} />
                <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm }}>
                  {order.customer_phone}
                </Text>
              </View>
            </View>

            {/* Address */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primaryGlow, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                <Ionicons name="location" size={14} color={COLORS.primaryLight} />
              </View>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, flex: 1, lineHeight: 20 }}>
                {order.delivery_address}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="cube-outline" size={14} color={COLORS.textMuted} />
              <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
                {itemCount} Artikel
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>{timeAgo}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: COLORS.primaryLight, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold }}>
                Details
              </Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primaryLight} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ──────────────────────────────────────────────
// HEADER STATS
// ──────────────────────────────────────────────
const StatsBar = ({ activeCount, deliveredCount, lastUpdated }) => (
  <View
    style={{
      flexDirection: 'row',
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
      gap: SPACING.md,
    }}
  >
    <View style={{ flex: 1, backgroundColor: COLORS.warningBg, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' }}>
      <Text style={{ color: COLORS.warning, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold }}>{activeCount}</Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, marginTop: 2 }}>Offen</Text>
    </View>
    <View style={{ flex: 1, backgroundColor: COLORS.successBg, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)' }}>
      <Text style={{ color: COLORS.success, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold }}>{deliveredCount}</Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, marginTop: 2 }}>Geliefert</Text>
    </View>
    <View style={{ flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
      <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold }}>
        {lastUpdated ? format(lastUpdated, 'HH:mm') : '--:--'}
      </Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, marginTop: 2 }}>Update</Text>
    </View>
  </View>
)

// ──────────────────────────────────────────────
// MAIN SCREEN
// ──────────────────────────────────────────────
export default function OrdersScreen({ navigation }) {
  const { activeOrders, isLoading, isRefreshing, lastUpdated, error, refresh, totalActive, deliveredOrders } = useOrders()
  const { driver, logout } = useAuth()

  const renderOrder = useCallback(
    ({ item }) => (
      <OrderCard
        order={item}
        onPress={() => navigation.navigate('OrderDetail', { order: item })}
      />
    ),
    [navigation]
  )

  if (isLoading && activeOrders.length === 0) {
    return <LoadingScreen message="Bestellungen werden geladen..." />
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.lg,
          paddingTop: SPACING.md,
          paddingBottom: SPACING.lg,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
            Hallo, {driver?.name?.split(' ')[0]} 👋
          </Text>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: FONTS.sizes.xxl,
              fontWeight: FONTS.weights.extrabold,
              marginTop: 2,
            }}
          >
            Meine Touren
          </Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={logout}
          style={{
            width: 42,
            height: 42,
            borderRadius: RADIUS.lg,
            backgroundColor: COLORS.bgCard,
            borderWidth: 1,
            borderColor: COLORS.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <StatsBar
        activeCount={totalActive}
        deliveredCount={deliveredOrders.length}
        lastUpdated={lastUpdated}
      />

      {/* Error Banner */}
      {error && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.errorBg,
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
            borderRadius: RADIUS.md,
            padding: SPACING.md,
            gap: SPACING.sm,
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <Ionicons name="wifi-outline" size={18} color={COLORS.error} />
          <Text style={{ color: COLORS.error, fontSize: FONTS.sizes.sm, flex: 1 }}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={{ color: COLORS.error, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Section header */}
      {activeOrders.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: COLORS.warning,
              marginRight: SPACING.sm,
            }}
          />
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: FONTS.sizes.sm,
              fontWeight: FONTS.weights.semibold,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            Ausstehend · {totalActive}
          </Text>
        </View>
      )}

      {/* Order List */}
      <FlatList
        data={activeOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title="Alles erledigt!"
            subtitle="Aktuell sind dir keine Bestellungen zugewiesen. Ziehe nach unten zum Aktualisieren."
          />
        }
      />
    </SafeAreaView>
  )
}
