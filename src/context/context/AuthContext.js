// ============================================================
// SIMONETTI DRIVER APP - AUTH CONTEXT
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginDriver, logoutDriver, saveDriverData, loadDriverData } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [driver, setDriver] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // ── Auto-Login beim App-Start ──
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedDriver = await loadDriverData()
        if (savedDriver?.id) {
          setDriver(savedDriver)
        }
      } catch (error) {
        console.error('Session restore failed:', error)
      } finally {
        setIsLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = useCallback(async (email, password) => {
    setIsLoggingIn(true)
    try {
      const data = await loginDriver(email, password)
      if (data.success && data.driver) {
        await saveDriverData(data.driver)
        setDriver(data.driver)
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
