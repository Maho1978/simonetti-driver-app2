// ============================================================
// SIMONETTI DRIVER APP - ORDER DETAIL SCREEN
// ============================================================

import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  StatusBar,
  Modal,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useOrders } from '../context/OrdersContext'
import { Button, Card, Divider, InfoRow } from '../components'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, STATUS } from '../utils/constants'

// ──────────────────────────────────────────────
// ITEM ROW
// ──────────────────────────────────────────────
const ItemRow = ({ item, index }) => (
  <View
    style={{
      backgroundColor: COLORS.bgCardLight,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: COLORS.border,
    }}
  >
    {/* Item header */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: item.flavors?.length || item.extras?.length || item.notes ? SPACING.md : 0 }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold }}>
              {item.quantity}x
            </Text>
          </View>
          <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, flex: 1 }}>
            {item.name}
          </Text>
        </View>
      </View>
      <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold }}>
        {Number(item.price * item.quantity).toFixed(2)} €
      </Text>
    </View>

    {/* Flavors */}
    {item.flavors?.length > 0 && (
      <View style={{ marginTop: SPACING.sm }}>
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Sorten
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
          {item.flavors.map((flavor, i) => (
            <View
              key={i}
              style={{
                backgroundColor: COLORS.primaryGlow,
                borderRadius: RADIUS.full,
                paddingHorizontal: SPACING.md,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: 'rgba(74,93,84,0.3)',
              }}
            >
              <Text style={{ color: COLORS.primaryLight, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium }}>
                {flavor}
              </Text>
            </View>
          ))}
        </View>
      </View>
    )}

    {/* Extras */}
    {item.extras?.length > 0 && (
      <View style={{ marginTop: SPACING.sm }}>
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Extras
        </Text>
        {item.extras.map((extra, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="add-circle-outline" size={14} color={COLORS.success} />
              <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm }}>{extra.name}</Text>
            </View>
            {extra.price > 0 && (
              <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm }}>
                +{Number(extra.price).toFixed(2)} €
              </Text>
            )}
          </View>
        ))}
      </View>
    )}

    {/* Item Notes */}
    {item.notes && (
      <View
        style={{
          marginTop: SPACING.sm,
          backgroundColor: COLORS.warningBg,
          borderRadius: RADIUS.sm,
          padding: SPACING.sm,
          flexDirection: 'row',
          gap: SPACING.xs,
          borderWidth: 1,
          borderColor: 'rgba(245,158,11,0.2)',
        }}
      >
        <Ionicons name="chatbubble-outline" size={13} color={COLORS.warning} style={{ marginTop: 1 }} />
        <Text style={{ color: COLORS.warning, fontSize: FONTS.sizes.sm, flex: 1 }}>{item.notes}</Text>
      </View>
    )}
  </View>
)

// ──────────────────────────────────────────────
// PRICE ROW
// ──────────────────────────────────────────────
const PriceRow = ({ label, value, isTotal = false, color }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: isTotal ? SPACING.md : SPACING.sm,
      borderTopWidth: isTotal ? 1 : 0,
      borderTopColor: COLORS.border,
      marginTop: isTotal ? SPACING.sm : 0,
    }}
  >
    <Text
      style={{
        color: isTotal ? COLORS.textPrimary : COLORS.textSecondary,
        fontSize: isTotal ? FONTS.sizes.lg : FONTS.sizes.md,
        fontWeight: isTotal ? FONTS.weights.bold : FONTS.weights.regular,
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        color: color || (isTotal ? COLORS.success : COLORS.textPrimary),
        fontSize: isTotal ? FONTS.sizes.xl : FONTS.sizes.md,
        fontWeight: isTotal ? FONTS.weights.extrabold : FONTS.weights.medium,
      }}
    >
      {Number(value).toFixed(2)} €
    </Text>
  </View>
)

// ──────────────────────────────────────────────
// CONFIRM MODAL
// ──────────────────────────────────────────────
const ConfirmModal = ({ visible, onConfirm, onCancel, loading, orderNumber }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.overlay,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xxl,
      }}
    >
      <View
        style={{
          backgroundColor: COLORS.bgCard,
          borderRadius: RADIUS.xxl,
          padding: SPACING.xxl,
          width: '100%',
          borderWidth: 1,
          borderColor: COLORS.border,
          ...SHADOWS.large,
        }}
      >
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: COLORS.successBg,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            marginBottom: SPACING.lg,
          }}
        >
          <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
        </View>

        <Text
          style={{
            color: COLORS.textPrimary,
            fontSize: FONTS.sizes.xl,
            fontWeight: FONTS.weights.extrabold,
            textAlign: 'center',
            marginBottom: SPACING.sm,
          }}
        >
          Lieferung bestätigen?
        </Text>
        <Text
          style={{
            color: COLORS.textSecondary,
            fontSize: FONTS.sizes.md,
            textAlign: 'center',
            marginBottom: SPACING.xxl,
            lineHeight: 22,
          }}
        >
          Bestellung #{orderNumber} als{' '}
          <Text style={{ color: COLORS.success, fontWeight: FONTS.weights.bold }}>geliefert</Text>{' '}
          markieren?
        </Text>

        <View style={{ gap: SPACING.md }}>
          <Button
            title="Ja, geliefert!"
            onPress={onConfirm}
            variant="success"
            loading={loading}
            icon="checkmark-circle"
          />
          <Button
            title="Abbrechen"
            onPress={onCancel}
            variant="secondary"
            disabled={loading}
          />
        </View>
      </View>
    </View>
  </Modal>
)

// ──────────────────────────────────────────────
// MAIN SCREEN
// ──────────────────────────────────────────────
export default function OrderDetailScreen({ route, navigation }) {
  const { order } = route.params
  const { deliverOrder } = useOrders()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDelivering, setIsDelivering] = useState(false)
  const [isDelivered, setIsDelivered] = useState(order.status === 'GELIEFERT')

  const statusInfo = STATUS[order.status] || STATUS.AN_FAHRER
  const totalItems = order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0
  const orderNumber = order.order_number || order.id?.slice(-8).toUpperCase()

  const openNavigation = useCallback(async () => {
    if (!order.navigation_url) return
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await Linking.openURL(order.navigation_url)
    } catch {
      Alert.alert('Fehler', 'Google Maps konnte nicht geöffnet werden')
    }
  }, [order.navigation_url])

  const callCustomer = useCallback(async () => {
    if (!order.customer_phone) return
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      await Linking.openURL(`tel:${order.customer_phone.replace(/\s/g, '')}`)
    } catch {
      Alert.alert('Fehler', 'Anruf konnte nicht gestartet werden')
    }
  }, [order.customer_phone])

  const handleDelivered = async () => {
    setIsDelivering(true)
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    const result = await deliverOrder(order.id)
    setIsDelivering(false)
    setShowConfirm(false)
    if (result.success) {
      setIsDelivered(true)
      setTimeout(() => navigation.goBack(), 1500)
    } else {
      Alert.alert('Fehler', result.error || 'Status konnte nicht aktualisiert werden')
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Custom Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: RADIUS.lg,
            backgroundColor: COLORS.bgCard,
            borderWidth: 1,
            borderColor: COLORS.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: SPACING.md,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, letterSpacing: 0.5 }}>
            BESTELLUNG
          </Text>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: FONTS.sizes.xl,
              fontWeight: FONTS.weights.extrabold,
            }}
          >
            #{orderNumber}
          </Text>
        </View>

        {/* Call button */}
        {order.customer_phone && (
          <TouchableOpacity
            onPress={callCustomer}
            style={{
              width: 42,
              height: 42,
              borderRadius: RADIUS.lg,
              backgroundColor: COLORS.successBg,
              borderWidth: 1,
              borderColor: 'rgba(34,197,94,0.3)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="call" size={20} color={COLORS.success} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Success Banner if delivered */}
        {isDelivered && (
          <View
            style={{
              margin: SPACING.lg,
              backgroundColor: COLORS.successBg,
              borderRadius: RADIUS.xl,
              padding: SPACING.lg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(34,197,94,0.3)',
            }}
          >
            <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
            <Text style={{ color: COLORS.success, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold }}>
              Erfolgreich geliefert! ✓
            </Text>
          </View>
        )}

        {/* Customer Section */}
        <View style={{ margin: SPACING.lg, marginBottom: 0 }}>
          <SectionTitle title="Kunde" icon="person-circle-outline" />
          <Card>
            <View style={{ padding: SPACING.lg }}>
              <InfoRow icon="person-outline" label="Name" value={order.customer_name} accent />
              <Divider />
              <InfoRow
                icon="call-outline"
                label="Telefon"
                value={order.customer_phone || '—'}
                onPress={order.customer_phone ? callCustomer : undefined}
                accent
              />
              <Divider />
              <InfoRow icon="mail-outline" label="E-Mail" value={order.customer_email || '—'} />
            </View>
          </Card>
        </View>

        {/* Address Section */}
        <View style={{ margin: SPACING.lg, marginBottom: 0 }}>
          <SectionTitle title="Lieferadresse" icon="location-outline" />
          <Card>
            <View style={{ padding: SPACING.lg }}>
              <InfoRow
                icon="location-outline"
                label="Adresse"
                value={order.delivery_address}
                onPress={openNavigation}
                accent
              />
              {order.notes && (
                <>
                  <Divider />
                  <InfoRow
                    icon="chatbubble-outline"
                    label="Kundennotiz"
                    value={order.notes}
                    valueStyle={{ color: COLORS.warning }}
                  />
                </>
              )}
            </View>
          </Card>

          {/* Navigation Button */}
          <TouchableOpacity
            onPress={openNavigation}
            style={{
              marginTop: SPACING.md,
              backgroundColor: COLORS.info,
              borderRadius: RADIUS.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: SPACING.lg,
              gap: SPACING.sm,
              ...SHADOWS.medium,
            }}
          >
            <Ionicons name="navigate" size={22} color={COLORS.white} />
            <Text style={{ color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold }}>
              Navigation starten
            </Text>
          </TouchableOpacity>
        </View>

        {/* Order Info */}
        <View style={{ margin: SPACING.lg, marginBottom: 0 }}>
          <SectionTitle title="Details" icon="information-circle-outline" />
          <Card>
            <View style={{ padding: SPACING.lg }}>
              <InfoRow
                icon="card-outline"
                label="Zahlung"
                value={order.payment_method || 'Bar'}
                accent
              />
              <Divider />
              <InfoRow
                icon="time-outline"
                label="Bestellt um"
                value={format(new Date(order.created_at), 'HH:mm · dd. MMM', { locale: de })}
              />
              {order.assigned_at && (
                <>
                  <Divider />
                  <InfoRow
                    icon="car-outline"
                    label="Zugewiesen um"
                    value={format(new Date(order.assigned_at), 'HH:mm · dd. MMM', { locale: de })}
                  />
                </>
              )}
            </View>
          </Card>
        </View>

        {/* Items Section */}
        <View style={{ margin: SPACING.lg, marginBottom: 0 }}>
          <SectionTitle
            title={`Artikel (${totalItems})`}
            icon="cube-outline"
          />
          {order.items?.map((item, index) => (
            <ItemRow key={item.id || index} item={item} index={index} />
          ))}
        </View>

        {/* Price Summary */}
        <View style={{ margin: SPACING.lg, marginBottom: 0 }}>
          <Card>
            <View style={{ padding: SPACING.lg }}>
              <PriceRow label="Zwischensumme" value={order.subtotal} />
              <PriceRow label="Liefergebühr" value={order.delivery_fee} />
              {order.tip > 0 && (
                <PriceRow label="Trinkgeld" value={order.tip} color={COLORS.gold} />
              )}
              <PriceRow label="Gesamt" value={order.total} isTotal />
            </View>
          </Card>
        </View>

      </ScrollView>

      {/* Bottom Action Bar */}
      {!isDelivered && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: COLORS.bgCard,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            padding: SPACING.lg,
            paddingBottom: SPACING.xl,
            ...SHADOWS.large,
          }}
        >
          <Button
            title="Als geliefert markieren"
            onPress={() => setShowConfirm(true)}
            variant="success"
            icon="checkmark-circle-outline"
          />
        </View>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleDelivered}
        onCancel={() => setShowConfirm(false)}
        loading={isDelivering}
        orderNumber={orderNumber}
      />
    </SafeAreaView>
  )
}

const SectionTitle = ({ title, icon }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    }}
  >
    <Ionicons name={icon} size={16} color={COLORS.textMuted} />
    <Text
      style={{
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.sm,
        fontWeight: FONTS.weights.semibold,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
      }}
    >
      {title}
    </Text>
  </View>
)
