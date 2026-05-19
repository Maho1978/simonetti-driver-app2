// ============================================================
// SIMONETTI FAHRER APP - ThemeContext
// 3-Modus Theme: 'system' (Default) | 'light' | 'dark'
// Persistiert in AsyncStorage, reagiert auf System-Wechsel
// ============================================================

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { lightPalette, darkPalette } from '../utils/themePalettes'

const STORAGE_KEY = 'simonetti_theme_mode_v1'

const ThemeContext = createContext({
  colors: darkPalette,
  isDark: true,
  themeMode: 'system',
  setThemeMode: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState('system')
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'dark')
  const [hydrated, setHydrated] = useState(false)

  // ── Laden aus Storage ──────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw && (raw === 'light' || raw === 'dark' || raw === 'system')) {
          setThemeModeState(raw)
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true))
  }, [])

  // ── System-Theme-Änderungen abonnieren ─────────────────────
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'dark')
    })
    return () => sub.remove()
  }, [])

  const setThemeMode = useCallback((mode) => {
    if (mode !== 'system' && mode !== 'light' && mode !== 'dark') return
    setThemeModeState(mode)
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {})
  }, [])

  const isDark = themeMode === 'system' ? systemScheme !== 'light' : themeMode === 'dark'
  const colors = isDark ? darkPalette : lightPalette

  const value = useMemo(
    () => ({ colors, isDark, themeMode, setThemeMode, hydrated }),
    [colors, isDark, themeMode, setThemeMode, hydrated]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
