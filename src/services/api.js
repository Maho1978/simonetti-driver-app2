// ============================================================
// SIMONETTI DRIVER APP - API SERVICE
// ============================================================

import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request Interceptor: driver_id automatisch anhängen ──
api.interceptors.request.use(
  async (config) => {
    const driverId = await AsyncStorage.getItem('driver_id')
    if (driverId) {
      config.headers['x-driver-id'] = driverId
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor: globales Error Handling ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['driver_id', 'driver_data'])
    }
    return Promise.reject(error)
  }
)

// ============================================================
// AUTH
// ============================================================

export const loginDriver = async (email, password) => {
  const response = await api.post('/api/driver/login', { email, password })
  return response.data
}

export const logoutDriver = async () => {
  await AsyncStorage.multiRemove(['driver_id', 'driver_data'])
}

// ============================================================
// ORDERS
// ============================================================

export const fetchOrders = async (driverId, status = 'AN_FAHRER') => {
  const response = await api.get('/api/driver/orders', {
    params: { driver_id: driverId, status },
  })
  return response.data
}

export const fetchDeliveredOrders = async (driverId) => {
  const response = await api.get('/api/driver/orders', {
    params: { driver_id: driverId, status: 'GELIEFERT' },
  })
  return response.data
}

export const markAsDelivered = async (orderId, driverId) => {
  const response = await api.post('/api/driver/update-order', {
    order_id: orderId,
    driver_id: driverId,
    status: 'GELIEFERT',
  })
  return response.data
}

// ============================================================
// STORAGE HELPERS
// ============================================================

export const saveDriverData = async (driver) => {
  await AsyncStorage.setItem('driver_id', driver.id)
  await AsyncStorage.setItem('driver_data', JSON.stringify(driver))
}

export const loadDriverData = async () => {
  const driverId = await AsyncStorage.getItem('driver_id')
  const driverDataRaw = await AsyncStorage.getItem('driver_data')
  if (!driverId || !driverDataRaw) return null
  return { id: driverId, ...JSON.parse(driverDataRaw) }
}

export default api
