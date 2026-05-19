// ============================================================
// SIMONETTI DRIVER APP - AUTH CONTEXT
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { loginDriver, logoutDriver, saveDriverData, loadDriverData } from '../services/api'
import api from '../services/api'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

const AuthContext = createContext(null)

const registerForPushNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') return null
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'a10ec612-5b66-45cc-ba3a-bfe7f6039885',
    })
    return token.data
  } catch (e) {
    console.log('Push token error:', e)
    return null
  }
}

const savePushToken = async (driverId, token) => {
  try {
    await api.post('/api/driver/push-token', { driver_id: driverId, push_token: token })
  } catch (e) {
    console.log('Push token save error:', e)
  }
}

export const AuthProvider = ({ children }) => {
  const [driver, setDriver] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const notificationListener = useRef()
  const responseListener = useRef()

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedDriver = await loadDriverData()
        if (savedDriver?.id) {
          setDriver(savedDriver)
          const token = await registerForPushNotifications()
          if (token) await savePushToken(savedDriver.id, token)
        }
      } catch (error) {
        console.error('Session restore failed:', error)
      } finally {
        setIsLoading(false)
      }
    }
    restoreSession()

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response)
    })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current)
      Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setIsLoggingIn(true)
    try {
      const data = await loginDriver(email, password)
      if (data.success && data.driver) {
        await saveDriverData(data.driver)
        setDriver(data.driver)
        const token = await registerForPushNotifications()
        if (token) await savePushToken(data.driver.id, token)
        return { success: true }
      }
      return { success: false, error: 'Login fehlgeschlagen' }
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        (error.code === 'ECONNABORTED' ? 'Verbindungs-Timeout' : 'Server nicht erreichbar')
      return { success: false, error: message }
    } finally {
      setIsLoggingIn(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await logoutDriver()
    setDriver(null)
  }, [])

  return (
    <AuthContext.Provider value={{ driver, isLoading, isLoggingIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}