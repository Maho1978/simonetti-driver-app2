// ============================================================
// SIMONETTI DRIVER APP - OrderDetailScreen.js  v3.0
// + "Ich bin da" WhatsApp Button
// + Foto bei Zustellung (Expo ImagePicker)
// + Liefercode (4-stellig)
// alle Features via useFeatures() togglebar
// ============================================================

import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  Linking, StatusBar, Modal, TextInput, Alert,
  Image, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import * as ImagePicker from 'expo-image-picker'
import { useOrders } from '../context/OrdersContext'
import { useTheme } from '../context/ThemeContext'
import { Button, Card, Divider, InfoRow } from '../components'
import { COLORS as DARK_COLORS, FONTS, SPACING, RADIUS, SHADOWS, STATUS } from '../utils/constants'
import { useFeatures } from './ProfileScreen'

// Sub-components (ItemRow, PriceRow, ConfirmModal, CodeModal) sind als const () => ()
// arrow functions definiert, also referenzieren sie COLORS aus dem Module-Scope. Wir
// haben hier den Modul-Import beibehalten, aber unter neuem Alias DARK_COLORS — diese
// Sub-Components bleiben damit visuell im dark-theme. Der HauptScreen unten nutzt
// useTheme() und wird voll themable.
const COLORS = DARK_COLORS

// ── Helfer ────────────────────────────────────────────────
const formatAddress = (address) => {
  if (!address) return ''
  if (typeof address === 'object') return `${address.street}, ${address.zip} ${address.city}`
  return address
}

// ── Zahlung Label ─────────────────────────────────────────
const getPaymentLabel = (order) => {
  if (order.payment_method === 'cash' || order.payment_intent_id?.startsWith('cash-')) return '💵 Barzahlung'
  if (order.payment_method === 'paypal') return '🅿️ PayPal'
  return '💳 Kreditkarte'
}

// ── Item Row ──────────────────────────────────────────────
const ItemRow = ({ item }) => (
  <View style={{ backgroundColor: COLORS.bgCardLight, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: item.flavors?.length || item.extras?.length ? SPACING.md : 0 }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
          <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold }}>{item.quantity}x</Text>
          </View>
          <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, flex: 1 }}>{item.name}</Text>
        </View>
      </View>
      <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold }}>
        {Number(item.price * item.quantity).toFixed(2)} €
      </Text>
    </View>
    {item.flavors?.length > 0 && (
      <View style={{ marginTop: SPACING.sm }}>
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sorten</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
          {item.flavors.map((f, i) => (
            <View key={i} style={{ backgroundColor: COLORS.primaryGlow, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(74,93,84,0.3)' }}>
              <Text style={{ color: COLORS.primaryLight, fontSize: FONTS.sizes.sm }}>{f}</Text>
            </View>
          ))}
        </View>
      </View>
    )}
    {item.extras?.length > 0 && (
      <View style={{ marginTop: SPACING.sm }}>
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 }}>Extras</Text>
        {item.extras.map((e, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="add-circle-outline" size={14} color={COLORS.success} />
              <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm }}>{e.name}</Text>
            </View>
            {e.price > 0 && <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm }}>+{Number(e.price).toFixed(2)} €</Text>}
          </View>
        ))}
      </View>
    )}
    {item.notes && (
      <View style={{ marginTop: SPACING.sm, backgroundColor: COLORS.warningBg, borderRadius: RADIUS.sm, padding: SPACING.sm, flexDirection: 'row', gap: SPACING.xs, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' }}>
        <Ionicons name="chatbubble-outline" size={13} color={COLORS.warning} style={{ marginTop: 1 }} />
        <Text style={{ color: COLORS.warning, fontSize: FONTS.sizes.sm, flex: 1 }}>{item.notes}</Text>
      </View>
    )}
  </View>
)

// ── Price Row ─────────────────────────────────────────────
const PriceRow = ({ label, value, isTotal, color }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: isTotal ? SPACING.md : SPACING.sm, borderTopWidth: isTotal ? 1 : 0, borderTopColor: COLORS.border, marginTop: isTotal ? SPACING.sm : 0 }}>
    <Text style={{ color: isTotal ? COLORS.textPrimary : COLORS.textSecondary, fontSize: isTotal ? FONTS.sizes.lg : FONTS.sizes.md, fontWeight: isTotal ? FONTS.weights.bold : FONTS.weights.regular }}>{label}</Text>
    <Text style={{ color: color || (isTotal ? COLORS.success : COLORS.textPrimary), fontSize: isTotal ? FONTS.sizes.xl : FONTS.sizes.md, fontWeight: isTotal ? FONTS.weights.extrabold : FONTS.weights.medium }}>
      {Number(value || 0).toFixed(2)} €
    </Text>
  </View>
)

// ── Section Title ─────────────────────────────────────────
const SectionTitle = ({ title, icon }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md }}>
    <Ionicons name={icon} size={16} color={COLORS.textMuted} />
    <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</Text>
  </View>
)

// ── Bestätigungs-Modal ────────────────────────────────────
const ConfirmModal = ({ visible, onConfirm, onCancel, loading, orderNumber }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={{ flex: 1, backgroundColor: COLORS.overlay, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl }}>
      <View style={{ backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xxl, padding: SPACING.xxl, width: '100%', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.large }}>
        <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.successBg, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: SPACING.lg }}>
          <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
        </View>
        <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold, textAlign: 'center', marginBottom: SPACING.sm }}>Lieferung bestätigen?</Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.md, textAlign: 'center', marginBottom: SPACING.xxl, lineHeight: 22 }}>
          Bestellung #{orderNumber} als <Text style={{ color: COLORS.success, fontWeight: FONTS.weights.bold }}>geliefert</Text> markieren?
        </Text>
        <View style={{ gap: SPACING.md }}>
          <Button title="Ja, geliefert!" onPress={onConfirm} variant="success" loading={loading} icon="checkmark-circle" />
          <Button title="Abbrechen" onPress={onCancel} variant="ghost" />
        </View>
      </View>
    </View>
  </Modal>
)

// ── Liefercode Modal ──────────────────────────────────────
const CodeModal = ({ visible, onConfirm, onCancel, expectedCode }) => {
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)

  const check = () => {
    if (input === String(expectedCode)) {
      setInput('')
      setWrong(false)
      onConfirm()
    } else {
      setWrong(true)
      setInput('')
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: COLORS.overlay, alignItems: 'center', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xxl, width: '100%', borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold, textAlign: 'center', marginBottom: 8 }}>Liefercode</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.md, textAlign: 'center', marginBottom: SPACING.xl }}>
            Bitte den 4-stelligen Code vom Kunden eingeben
          </Text>
          <TextInput
            style={{
              backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.md,
              padding: SPACING.lg, fontSize: 32, textAlign: 'center',
              color: wrong ? COLORS.error : COLORS.textPrimary,
              letterSpacing: 12, borderWidth: 1,
              borderColor: wrong ? COLORS.error : COLORS.border,
              marginBottom: wrong ? SPACING.sm : SPACING.xl,
              fontWeight: FONTS.weights.extrabold,
            }}
            value={input}
            onChangeText={t => { setInput(t.replace(/\D/g, '').slice(0, 4)); setWrong(false) }}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
          />
          {wrong && (
            <Text style={{ color: COLORS.error, textAlign: 'center', marginBottom: SPACING.xl, fontSize: FONTS.sizes.sm }}>
              ❌ Falscher Code – bitte nochmal
            </Text>
          )}
          <View style={{ gap: SPACING.md }}>
            <Button title="Bestätigen" onPress={check} variant="success" icon="checkmark-circle" />
            <Button title="Abbrechen" onPress={() => { setInput(''); setWrong(false); onCancel() }} variant="ghost" />
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ── Hauptscreen ───────────────────────────────────────────
export default function OrderDetailScreen({ navigation, route }) {
  const { colors: COLORS } = useTheme()
  const { order: initialOrder }       = route.params
  const { deliverOrder }              = useOrders()
  const { features }                  = useFeatures()
  const [order, setOrder]             = useState(initialOrder)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showCode, setShowCode]       = useState(false)
  const [isDelivering, setIsDelivering] = useState(false)
  const [photo, setPhoto]             = useState(null)

  const isDelivered  = order.status === 'GELIEFERT'
  const orderNumber  = order.order_number || order.id?.slice(-8).toUpperCase()
  const totalItems   = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0
  const addressString = formatAddress(order.delivery_address)

  // Zufälliger 4-stelliger Code (bleibt stabil pro Bestellung via order.id)
  const deliveryCode = String(1000 + (parseInt(order.id?.slice(-4), 16) % 9000)).slice(0, 4)

  const openNavigation = () =>
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressString)}`)

  const callCustomer = () => {
    if (order.customer_phone) Linking.openURL(`tel:${order.customer_phone}`)
  }

  // "Ich bin da" – öffnet WhatsApp mit Vortext (kostenlos, kein API nötig)
  const sendImHere = () => {
    const phone = order.customer_phone?.replace(/\D/g, '')
    if (!phone) {
      Alert.alert('Keine Telefonnummer', 'Für diesen Kunden ist keine Nummer hinterlegt.')
      return
    }
    const text = encodeURIComponent(`Hallo ${order.customer_name}, ich bin jetzt bei Ihnen! 🛵🍦`)
    Linking.openURL(`https://wa.me/49${phone.replace(/^0/, '')}?text=${text}`)
  }

  // Foto aufnehmen
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Kein Zugriff', 'Kamerazugriff wurde verweigert.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: false,
    })
    if (!result.canceled) setPhoto(result.assets[0].uri)
  }

  // Lieferung abschließen – mit oder ohne Extras
  const handleDeliverPress = () => {
    if (features.deliveryCode) {
      setShowCode(true)
    } else if (features.deliveryPhoto && !photo) {
      Alert.alert('Foto fehlt', 'Bitte erst ein Foto aufnehmen.', [
        { text: 'Foto aufnehmen', onPress: takePhoto },
        { text: 'Trotzdem weiter', onPress: () => setShowConfirm(true) },
        { text: 'Abbrechen', style: 'cancel' },
      ])
    } else {
      setShowConfirm(true)
    }
  }

  const handleDelivered = async () => {
    setIsDelivering(true)
    try {
      const result = await deliverOrder(order.id)
      if (result?.success) setOrder({ ...order, status: 'GELIEFERT' })
      setShowConfirm(false)
      setShowCode(false)
    } catch (e) {
      setShowConfirm(false)
      setShowCode(false)
    }
    setIsDelivering(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.md }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.textMuted, fontSize: 10, letterSpacing: 0.5 }}>BESTELLUNG</Text>
          <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold }}>#{orderNumber}</Text>
        </View>
        {order.customer_phone && (
          <TouchableOpacity onPress={callCustomer} style={[s.iconBtn, { backgroundColor: COLORS.successBg, borderColor: 'rgba(34,197,94,0.3)' }]}>
            <Ionicons name="call" size={20} color={COLORS.success} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* Geliefert Banner */}
        {isDelivered && (
          <View style={{ margin: SPACING.lg, backgroundColor: COLORS.successBg, borderRadius: RADIUS.xl, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' }}>
            <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
            <Text style={{ color: COLORS.success, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold }}>Erfolgreich geliefert! ✓</Text>
          </View>
        )}

        {/* "Ich bin da" Button – wenn feature aktiv + Telefon vorhanden */}
        {!isDelivered && features.imHereButton && order.customer_phone && (
          <TouchableOpacity
            onPress={sendImHere}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: SPACING.sm, marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
              backgroundColor: '#064e3b', borderRadius: RADIUS.lg, padding: SPACING.lg,
              borderWidth: 1, borderColor: '#25D366' + '50',
            }}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            <Text style={{ color: '#25D366', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold }}>
              Ich bin da! – WhatsApp an {order.customer_name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        )}

        {/* Foto-Nachweis */}
        {!isDelivered && features.deliveryPhoto && (
          <TouchableOpacity
            onPress={takePhoto}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: SPACING.sm, marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
              backgroundColor: photo ? '#1a0c00' : COLORS.bgCard,
              borderRadius: RADIUS.lg, padding: SPACING.lg,
              borderWidth: 1, borderColor: photo ? '#f97316' : COLORS.border,
            }}
          >
            <Ionicons name={photo ? 'checkmark-circle' : 'camera-outline'} size={20} color={photo ? '#f97316' : COLORS.textSecondary} />
            <Text style={{ color: photo ? '#f97316' : COLORS.textSecondary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold }}>
              {photo ? 'Foto aufgenommen ✓' : 'Liefernachweis-Foto aufnehmen'}
            </Text>
          </TouchableOpacity>
        )}
        {photo && (
          <Image source={{ uri: photo }} style={{ height: 160, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, borderRadius: RADIUS.lg }} resizeMode="cover" />
        )}

        {/* Liefercode anzeigen (für den Kunden) */}
        {!isDelivered && features.deliveryCode && (
          <View style={{
            marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
            backgroundColor: '#0e0e2a', borderRadius: RADIUS.lg, padding: SPACING.lg,
            borderWidth: 1, borderColor: '#6366f150', alignItems: 'center',
          }}>
            <Text style={{ color: '#818cf8', fontSize: FONTS.sizes.xs, letterSpacing: 1, marginBottom: 6 }}>LIEFERCODE FÜR KUNDEN</Text>
            <Text style={{ color: '#c7d2fe', fontSize: 40, fontWeight: FONTS.weights.extrabold, letterSpacing: 16 }}>{deliveryCode}</Text>
            <Text style={{ color: '#6366f1', fontSize: FONTS.sizes.xs, marginTop: 6 }}>Kunden nennen diesen Code zur Bestätigung</Text>
          </View>
        )}

        {/* Kunde */}
        <View style={{ margin: SPACING.lg, marginBottom: 0 }}>
          <SectionTitle title="Kunde" icon="person-circle-outline" />
          <Card>
            <View style={{ padding: SPACING.lg }}>
              <InfoRow icon="person-outline" label="Name" value={order.customer_name} accent />
              <Divider />
              <InfoRow icon="call-outline" label="Telefon" value={order.customer_phone || '—'} onPress={order.customer_phone ? callCustomer : undefined} accent />
              <Divider />
              <InfoRow icon="mail-outline" label="E-Mail" value={order.customer_email || '—'} />
            </View>
          </Card>
        </View>

        {/* Adresse + Navigation */}
        <View style={{ margin: SPACING.lg, marginBottom: 0 }}>
          <SectionTitle title="Lieferadresse" icon="location-outline" />
          <Card>
            <View style={{ padding: SPACING.lg }}>
              <InfoRow icon="location-outline" label="Adresse" value={addressString} onPress={openNavigation} accent />
              {order.notes && (
                <>
                  <Divider />
                  <InfoRow icon="chatbubble-outline" label="Kundennotiz" value={order.notes.split(' | ').filter(n => !n.includes('Wechselgeld')).join(' | ')} valueStyle={{ color: COLORS.warning }} />
                </>
              )}
              {(order.payment_method === 'cash' || order.payment_intent_id?.startsWith('cash-')) && order.notes?.includes('Wechselgeld') && (
                <>
                  <Divider />
                  <InfoRow
                    icon="cash-outline"
                    label="Wechselgeld"
                    value={order.notes.split(' | ').find(n => n.includes('Wechselgeld'))?.replace('Wechselgeld für: ', '') || ''}
                    valueStyle={{ color: '#16a34a', fontWeight: 'bold', fontSize: 18 }}
                    accent
                  />
                </>
              )}
            </View>
          </Card>
          <TouchableOpacity
            onPress={openNavigation}
            style={{ marginTop: SPACING.md, backgroundColor: COLORS.info, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SPACING.lg, gap: SPACING.sm, ...SHADOWS.medium }}
          >
            <Ionicons name="navigate" size={22} color={COLORS.white} />
            <Text style={{ color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold }}>Navigation starten</Text>
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={{ margin: SPACING.lg, marginBottom: 0 }}>
          <SectionTitle title="Details" icon="information-circle-outline" />
          <Card>
            <View style={{ padding: SPACING.lg }}>
              <InfoRow icon="card-outline" label="Zahlung" value={getPaymentLabel(order)} accent />
              <Divider />
              <InfoRow icon="time-outline" label="Bestellt um" value={format(new Date(order.created_at), 'HH:mm · dd. MMM', { locale: de })} />
            </View>
          </Card>
        </View>

        {/* Artikel */}
        <View style={{ margin: SPACING.lg, marginBottom: 0 }}>
          <SectionTitle title={`Artikel (${totalItems})`} icon="cube-outline" />
          {order.items?.map((item, index) => (
            <ItemRow key={item.id || index} item={item} />
          ))}
        </View>

        {/* Preise */}
        <View style={{ margin: SPACING.lg }}>
          <Card>
            <View style={{ padding: SPACING.lg }}>
              <PriceRow label="Zwischensumme" value={order.subtotal} />
              <PriceRow label="Liefergebühr"  value={order.delivery_fee} />
              {order.tip > 0 && <PriceRow label="Trinkgeld 🧡" value={order.tip} color="#d4af37" />}
              <PriceRow label="Gesamt" value={order.total} isTotal />
            </View>
          </Card>
        </View>

      </ScrollView>

      {/* Footer Button */}
      {!isDelivered && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.bgCard, borderTopWidth: 1, borderTopColor: COLORS.border, padding: SPACING.lg, paddingBottom: SPACING.xl, ...SHADOWS.large }}>
          <Button title="Als geliefert markieren" onPress={handleDeliverPress} variant="success" icon="checkmark-circle-outline" />
        </View>
      )}

      {/* Modals */}
      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleDelivered}
        onCancel={() => setShowConfirm(false)}
        loading={isDelivering}
        orderNumber={orderNumber}
      />
      <CodeModal
        visible={showCode}
        onConfirm={handleDelivered}
        onCancel={() => setShowCode(false)}
        expectedCode={deliveryCode}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  iconBtn: {
    width: 42, height: 42, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
})