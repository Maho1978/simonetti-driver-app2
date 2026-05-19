// ============================================================
// SIMONETTI DRIVER APP - HISTORY SCREEN
// ============================================================

import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useOrders } from '../context/OrdersContext'
import { EmptyState, LoadingScreen, Badge } from '../components'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/constants'

const HistoryCard = ({ order, onPress }) => {
  const orderNumber = order.order_number || order.id?.slice(-8).toUpperCase()
  const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0
  const deliveredAt = order.delivered_at ? new Date(order.delivered_at) : new Date(order.updated_at)

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        ...SHADOWS.small,
      }}
    >
      <View style={{ height: 3, backgroundColor: COLORS.success }} />
      <View
        style={{
          padding: SPACING.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: SPACING.md,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: RADIUS.md,
            backgroundColor: COLORS.successBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text
              style={{
                color: COLORS.textPrimary,
                fontSize: FONTS.sizes.lg,
                fontWeight: FONTS.weights.extrabold,
              }}
            >
              #{orderNumber}
            </Text>
            <Text
              style={{
                color: COLORS.success,
                fontSize: FONTS.sizes.lg,
                fontWeight: FONTS.weights.extrabold,
              }}
            >
              {Number(order.total).toFixed(2)} €
            </Text>
          </View>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: FONTS.sizes.sm,
              marginTop: 2,
            }}
          >
            {order.customer_name}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: SPACING.xs,
            }}
          >
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>
              {itemCount} Artikel
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="checkmark-circle-outline" size={12} color={COLORS.success} />
              <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>
                {format(deliveredAt, 'HH:mm · dd. MMM', { locale: de })}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function HistoryScreen({ navigation }) {
  const { deliveredOrders, isLoading, isRefreshing, refresh } = useOrders()

  // Group by date
  const grouped = deliveredOrders.reduce((acc, order) => {
    const dateKey = format(
      new Date(order.delivered_at || order.updated_at || order.created_at),
      'EEEE, dd. MMMM',
      { locale: de }
    )
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(order)
    return acc
  }, {})

  const sections = Object.entries(grouped)

  if (isLoading && deliveredOrders.length === 0) {
    return <LoadingScreen message="Lade Verlauf..." />
  }

  const renderItem = ({ item }) => {
    if (item.isHeader) {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.lg,
            marginTop: SPACING.lg,
            marginBottom: SPACING.md,
            gap: SPACING.sm,
          }}
        >
          <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: FONTS.sizes.sm,
              fontWeight: FONTS.weights.semibold,
              textTransform: 'capitalize',
            }}
          >
            {item.title}
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border, marginLeft: SPACING.sm }} />
        </View>
      )
    }
    return (
      <HistoryCard
        order={item}
        onPress={() => navigation.navigate('OrderDetail', { order: item })}
      />
    )
  }

  // Flatten to flat list with headers
  const flatData = sections.flatMap(([date, orders]) => [
    { isHeader: true, title: date, id: `header-${date}` },
    ...orders,
  ])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.lg }}>
        <Text
          style={{
            color: COLORS.textPrimary,
            fontSize: FONTS.sizes.xxl,
            fontWeight: FONTS.weights.extrabold,
          }}
        >
          Verlauf
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 }}>
          {deliveredOrders.length} Lieferungen gesamt
        </Text>
      </View>

      <FlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id || item.title}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
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
            icon="time-outline"
            title="Noch keine Lieferungen"
            subtitle="Abgeschlossene Lieferungen werden hier angezeigt."
          />
        }
      />
    </SafeAreaView>
  )
}
