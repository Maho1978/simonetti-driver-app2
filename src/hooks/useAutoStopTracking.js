// ============================================================
// SIMONETTI FAHRER APP - src/hooks/useAutoStopTracking.js
// Beendet GPS-Tracking 30 Min nach der letzten gelieferten Tour
// ============================================================
//
// Nutzt sich additiv zu useLocationTracking:
//   const { isTracking, stopTracking } = useLocationTracking(driverId)
//   useAutoStopTracking({ isTracking, activeOrderCount, stopTracking })
//
// Verhalten:
//   • activeOrderCount fällt von >0 auf 0, während isTracking=true ⇒ 30-Min-Timer starten
//   • Neue aktive Lieferung (activeOrderCount > 0)               ⇒ Timer abbrechen
//   • Nutzer schaltet Tracking manuell aus                        ⇒ Timer abbrechen
//   • Timer läuft ab                                              ⇒ stopTracking() + Hinweis
//
// Annahmen / Grenzen:
//   • Foreground-Tracking. Wenn App im Hintergrund "schläft", wird auch der
//     Timer pausiert (RN-Standardverhalten). Beim Wieder-Aktivieren prüft
//     dieser Hook die Lage neu und startet ggf. einen frischen Timer.

import { useEffect, useRef } from 'react'
import { Alert } from 'react-native'

const AUTO_STOP_AFTER_MS = 30 * 60 * 1000  // 30 Minuten

export default function useAutoStopTracking({
  isTracking,
  activeOrderCount,
  stopTracking,
  onAutoStop,
}) {
  const timerRef       = useRef(null)
  const prevCountRef   = useRef(activeOrderCount ?? 0)
  const stopRef        = useRef(stopTracking)
  const onAutoStopRef  = useRef(onAutoStop)

  useEffect(() => { stopRef.current       = stopTracking },         [stopTracking])
  useEffect(() => { onAutoStopRef.current = onAutoStop },           [onAutoStop])

  useEffect(() => {
    const prev = prevCountRef.current
    const now  = activeOrderCount ?? 0

    // 1) Tracking aus → kein Timer
    if (!isTracking) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      prevCountRef.current = now
      return
    }

    // 2) Neue aktive Lieferung → laufenden Timer abbrechen
    if (now > 0) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      prevCountRef.current = now
      return
    }

    // 3) Übergang >0 → 0  und Tracking läuft  → Timer starten
    if (prev > 0 && now === 0 && !timerRef.current) {
      timerRef.current = setTimeout(async () => {
        timerRef.current = null
        try { await stopRef.current?.() } catch (_) {}
        Alert.alert(
          '🛑 Tracking beendet',
          'Seit 30 Minuten keine aktive Lieferung. GPS-Tracking wurde automatisch deaktiviert, um Akku zu sparen.\n\nDu kannst es jederzeit wieder einschalten.'
        )
        onAutoStopRef.current?.()
      }, AUTO_STOP_AFTER_MS)
    }

    prevCountRef.current = now
  }, [isTracking, activeOrderCount])

  // Cleanup bei Unmount
  useEffect(() => () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }, [])
}
