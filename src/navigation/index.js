// ============================================================
// SIMONETTI FAHRER APP - src/navigation/index.js
// Tab Bar mit korrektem Safe Area Abstand
// ============================================================

import React, { useState } from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { OrdersProvider } from '../context/OrdersContext'
import { FeaturesProvider } from '../screens/ProfileScreen'
import { LoadingScreen } from '../components'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/constants'
import LoginScreen from '../screens/LoginScreen'
import OrdersScreen from '../screens/OrdersScreen'
import OrderDetailScreen from '../screens/OrderDetailScreen'
import HistoryScreen from '../screens/HistoryScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Stack = createStackNavigator()

const TABS = [
  {
    name: 'Orders',
    label: 'Touren',
    iconActive: 'car-sport',
    iconInactive: 'car-sport-outline',
    screen: OrdersScreen,
  },
  {
    name: 'History',
    label: 'Verlauf',
    iconActive: 'receipt',
    iconInactive: 'receipt-outline',
    screen: HistoryScreen,
  },
  {
    name: 'Profile',
    label: 'Profil',
    iconActive: 'person-circle',
    iconInactive: 'person-circle-outline',
    screen: ProfileScreen,
  },
]

// ── Custom Tab Bar mit Safe Area ─────────────────────────────
const CustomTabBar = ({ active, setActive }) => {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          height: 64 + Math.max(insets.bottom, 8),
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.name
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => setActive(tab.name)}
            style={styles.tabItem}
            activeOpacity={0.75}
          >
            <View style={[styles.tabIndicator, isActive && styles.tabIndicatorActive]} />
            <Ionicons
              name={isActive ? tab.iconActive : tab.iconInactive}
              size={24}
              color={isActive ? COLORS.tabActive : COLORS.tabInactive}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// ── Haupt-Screen ─────────────────────────────────────────────
const CustomTabs = ({ navigation }) => {
  const [active, setActive] = useState('Orders')
  const ActiveScreen = TABS.find((t) => t.name === active).screen

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ flex: 1 }}>
        <ActiveScreen navigation={navigation} />
      </View>
      <CustomTabBar active={active} setActive={setActive} />
    </View>
  )
}

const AuthenticatedStack = () => (
  <OrdersProvider>
    <FeaturesProvider>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.bg } }}>
        <Stack.Screen name="MainTabs" component={CustomTabs} />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ presentation: 'modal', gestureEnabled: true }}
        />
      </Stack.Navigator>
    </FeaturesProvider>
  </OrdersProvider>
)

export default function RootNavigator() {
  const { driver, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen message="Simonetti Fahrer App..." />

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {driver ? (
          <Stack.Screen name="App" component={AuthenticatedStack} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.tabBar,
    borderTopWidth: 1,
    borderTopColor: COLORS.tabBarBorder,
    paddingTop: 10,
    paddingHorizontal: 8,
    ...SHADOWS.md,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 3,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: -10,
    width: 32,
    height: 2.5,
    borderRadius: RADIUS.full,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: COLORS.tabActive,
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.tabInactive,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: COLORS.tabActive,
    fontWeight: FONTS.weights.semibold,
  },
})