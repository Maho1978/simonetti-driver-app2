// ============================================================
// SIMONETTI FAHRER APP - src/hooks/useLocationTracking.js
// GPS-Tracking Hook mit Toggle (aktiv/inaktiv)
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import * as Location from 'expo-location'
import { API_BASE_URL } from '../utils/constants'

// Wie oft die Position gesendet wird (in Millisekunden)
const SEND_INTERVAL_MS = 15000  // alle 15 Sekunden

export default function useLocationTracking(driverId) {
  const [isTracking, setIsTracking]       = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState(null)
  const [error, setError]                 = useState(null)

  const locationSubscription = useRef(null)
  const sendIntervalRef      = useRef(null)
  const lastLocationRef      = useRef(null)

  // ── Berechtigung anfragen ─────────────────────────────────
  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    setPermissionStatus(status)
    return status === 'granted'
  }, [])

  // ── Position an Server senden ─────────────────────────────
  const sendLocation = useCallback(async (location) => {
    if (!driverId || !location) return

    try {
      await fetch(`${API_BASE_URL}/api/driver/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-driver-id':  driverId,
        },
        body: JSON.stringify({
          driver_id: driverId,
          latitude:  location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy:  location.coords.accuracy,
          heading:   location.coords.heading,
          speed:     location.coords.speed,
          is_active: true,
        }),
      })
    } catch (err) {
      console.warn('Location send failed:', err.message)
      // Kein harter Fehler – nächster Versuch kommt in 15s
    }
  }, [driverId])

  // ── Tracking starten ──────────────────────────────────────
  const startTracking = useCallback(async () => {
    setError(null)

    const granted = await requestPermission()
    if (!granted) {
      setError('GPS-Berechtigung verweigert. Bitte in den App-Einstellungen aktivieren.')
      return false
    }

    // Aktuelle Position sofort holen
    const initialLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    })
    setCurrentLocation(initialLocation)
    lastLocationRef.current = initialLocation
    await sendLocation(initialLocation)

    // Live-Updates abonnieren
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy:            Location.Accuracy.High,
        timeInterval:        5000,   // alle 5s neue Position intern
        distanceInterval:    10,     // oder wenn >10m bewegt
      },
      (location) => {
        setCurrentLocation(location)
        lastLocationRef.current = location
      }
    )

    // Alle 15s die letzte bekannte Position an den Server schicken
    sendIntervalRef.current = setInterval(() => {
      if (lastLocationRef.current) {
        sendLocation(lastLocationRef.current)
      }
    }, SEND_INTERVAL_MS)

    setIsTracking(true)
    return true
  }, [requestPermission, sendLocation])

  // ── Tracking stoppen ──────────────────────────────────────
  const stopTracking = useCallback(async () => {
    // Subscription beenden
    if (locationSubscription.current) {
      locationSubscription.current.remove()
      locationSubscription.current = null
    }

    // Interval beenden
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current)
      sendIntervalRef.current = null
    }

    // Server informieren: is_active = false
    if (driverId) {
      try {
        await fetch(`${API_BASE_URL}/api/driver/location`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-driver-id':  driverId,
          },
          body: JSON.stringify({ driver_id: driverId }),
        })
      } catch (err) {
        console.warn('Stop tracking notify failed:', err.message)
      }
    }

    setIsTracking(false)
    setCurrentLocation(null)
    lastLocationRef.current = null
  }, [driverId])

  // ── Toggle (Ein/Aus) ───────────────────────────────────────
  const toggleTracking = useCallback(async () => {
    if (isTracking) {
      await stopTracking()
    } else {
      await startTracking()
    }
  }, [isTracking, startTracking, stopTracking])

  // ── Cleanup bei Unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove()
      }
      if (sendIntervalRef.current) {
        clearInterval(sendIntervalRef.current)
      }
    }
  }, [])

  return {
    isTracking,
    currentLocation,
    permissionStatus,
    error,
    toggleTracking,
    startTracking,
    stopTracking,
  }
}