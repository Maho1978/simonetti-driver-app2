// ============================================================
// SIMONETTI DRIVER APP - ORDERS CONTEXT
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { AppState } from 'react-native'
import { fetchOrders, fetchDeliveredOrders, markAsDelivered } from '../services/api'
import { useAuth } from './AuthContext'
import { REFRESH_INTERVAL } from '../utils/constants'

const OrdersContext = createContext(null)

export const OrdersProvider = ({ children }) => {
  const { driver } = useAuth()
  const [activeOrders, setActiveOrders] = useState([])
  const [deliveredOrders, setDeliveredOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const appStateRef = useRef(AppState.currentState)

  const loadOrders = useCallback(
    async (silent = false) => {
      if (!driver?.id) return
      if (!silent) setIsLoading(true)
      setError(null)

      try {
        const [activeData, deliveredData] = await Promise.all([
          fetchOrders(driver.id),
          fetchDeliveredOrders(driver.id),
        ])

        if (activeData.success) setActiveOrders(activeData.orders || [])
        if (deliveredData.success) setDeliveredOrders(deliveredData.orders || [])
        setLastUpdated(new Date())
      } catch (err) {
        setError('Bestellungen konnten nicht geladen werden')
        console.error('fetchOrders error:', err)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [driver?.id]
  )

  const refresh = useCallback(() => {
    setIsRefreshing(true)
    loadOrders(true)
  }, [loadOrders])

  // ── Initial load ──
  useEffect(() => {
    if (driver?.id) {
      loadOrders()
    } else {
      setActiveOrders([])
      setDeliveredOrders([])
    }
  }, [driver?.id])

  // ── Auto-Refresh Timer ──
  useEffect(() => {
    if (!driver?.id) return

    intervalRef.current = setInterval(() => {
      if (appStateRef.current === 'active') {
        loadOrders(true)
      }
    }, REFRESH_INTERVAL)

    return () => clearInterval(intervalRef.current)
  }, [driver?.id, loadOrders])

  // ── Pause refresh when app is in background ──
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current !== 'active' && nextState === 'active') {
        loadOrders(true) // Reload when coming back to foreground
      }
      appStateRef.current = nextState
    })
    return () => subscription?.remove()
  }, [loadOrders])

  const deliverOrder = useCallback(
    async (orderId) => {
      if (!driver?.id) return { success: false }
      try {
        const data = await markAsDelivered(orderId, driver.id)
        if (data.success) {
          // Optimistic update
          const delivered = activeOrders.find((o) => o.id === orderId)
          if (delivered) {
            setActiveOrders((prev) => prev.filter((o) => o.id !== orderId))
            setDeliveredOrders((prev) => [
              { ...delivered, status: 'GELIEFERT', delivered_at: new Date().toISOString() },
              ...prev,
            ])
          }
          return { success: true }
        }
        return { success: false, error: 'Update fehlgeschlagen' }
      } catch (err) {
        return { success: false, error: 'Verbindungsfehler' }
      }
    },
    [driver?.id, activeOrders]
  )

  return (
    <OrdersContext.Provider
      value={{
        activeOrders,
        deliveredOrders,
        isLoading,
        isRefreshing,
        lastUpdated,
        error,
        refresh,
        deliverOrder,
        totalActive: activeOrders.length,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export const useOrders = () => {
  const context = useContext(OrdersContext)
  if (!context) throw new Error('useOrders must be used within OrdersProvider')
  return context
}
