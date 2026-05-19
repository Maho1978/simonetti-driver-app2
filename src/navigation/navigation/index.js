// ============================================================
// SIMONETTI DRIVER APP - NAVIGATION
// ============================================================

import React from 'react'
import { View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import { useAuth } from '../context/AuthContext'
import { OrdersProvider } from '../context/OrdersContext'
import { LoadingScreen } from '../components'
import { COLORS, FONTS, RADIUS, SHADOWS } from '../utils/constants'

import LoginScreen from '../screens/LoginScreen'
import OrdersScreen from '../screens/OrdersScreen'
import OrderDetailScreen from '../screens/OrderDetailScreen'
import HistoryScreen from '../screens/HistoryScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// ──────────────────────────────────────────────
// BOTTOM TAB NAVIGATOR
// ──────────────────────────────────────────────
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
          ...SHADOWS.large,
        },
        tabBarActiveTintColor: COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Touren',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons
                name={focused ? 'car' : 'car-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Verlauf',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

// ──────────────────────────────────────────────
// AUTHENTICATED STACK (with OrderDetail overlay)
// ──────────────────────────────────────────────
const AuthenticatedStack = () => {
  return (
    <OrdersProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.bg },
          presentation: 'card',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{
            presentation: 'modal',
            gestureEnabled: true,
            cardStyle: { backgroundColor: COLORS.bg },
          }}
        />
      </Stack.Navigator>
    </OrdersProvider>
  )
}

// ──────────────────────────────────────────────
// ROOT NAVIGATOR
// ──────────────────────────────────────────────
export default function RootNavigator() {
  const { driver, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen message="Simonetti Fahrer App..." />
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: COLORS.primary,
          background: COLORS.bg,
          card: COLORS.bgCard,
          text: COLORS.textPrimary,
          border: COLORS.border,
          notification: COLORS.error,
        },
      }}
    >
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
