# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---

# 🚧 Rebuild-Spezifikation – Simonetti Fahrer-App v2

> **Stand:** 2026-05-19 · Diese Spezifikation beschreibt das gewünschte Verhalten
> der **nächsten Fahrer-App-Generation**. Sie löst die aktuelle Codebasis (`src/`)
> beim Neubau ab.

## 1. Tracking-Architektur: zwei unabhängige Toggles

Die neue App muss GPS-Tracking in **zwei getrennt schaltbare Kanäle** aufteilen:

| Toggle | Default | Zweck | Sichtbarkeit |
|---|---|---|---|
| **Admin-Tracking** | `on` | Betreiber sieht Fahrerposition im Kanban-Board (Karten + Tracking-Übersicht) | nur Admin-Backend |
| **Kunden-Tracking** | `off` | Kunde sieht "Fahrer ist 5 Min entfernt"-Anzeige im Bestellstatus | öffentliche Bestell-Trackingseite |

**Wichtige Regeln:**
- Beide Toggles sind **unabhängig** ein-/ausschaltbar. Admin-Tracking kann
  laufen, ohne dass Kunden je etwas sehen.
- Die Schalter liegen in der Fahrer-App (ProfileScreen + Kurz-Toggle in der
  TrackingBar des OrdersScreen).
- Server-seitig sollte jeder Positionsdatensatz markieren, **für welchen
  Kanal** er freigegeben ist (z. B. `share_with_admin BOOL`, `share_with_customer BOOL`).
  Customer-API-Endpoints filtern strikt: `WHERE share_with_customer = true`.
- Aktuelle App-Version (v1) sendet Tracking ausschließlich Admin-seitig — der
  Kunden-Toggle ist noch nicht implementiert.

## 2. Auto-Stop-Logik (bereits in v1 vorhanden, übernehmen)

- Sobald die Anzahl aktiver Lieferungen (`status = AN_FAHRER`) **von >0 auf 0**
  fällt **und** Tracking aktiv ist, läuft ein **30-Minuten-Timer**.
- Bei neuer aktiver Lieferung wird der Timer abgebrochen.
- Nach Ablauf wird das Tracking automatisch beendet, der Fahrer per Alert
  informiert (Akkuschonung).
- Manuelles Tracking-Off bricht den Timer ebenfalls ab.
- Referenz-Implementierung: `src/hooks/useAutoStopTracking.js`.

**Erweiterung im Rebuild:** Auto-Stop greift auf **beide Kanäle** gleichzeitig
(Admin- und Kunden-Tracking werden beide deaktiviert).

## 3. Datenschutz / Privacy

- **Niemals Fahrer-Positionen ohne expliziten Kunden-Toggle an Kunden ausliefern.**
- Die öffentliche Tracking-Seite (falls implementiert) darf nur eine grobe
  ETA / Distanz anzeigen, **keine** exakten Koordinaten.
- Der Admin-API-Endpoint `/api/driver/location` darf nur über authentifizierte
  Admin-Sessions erreichbar sein (aktuell offen — bei Rebuild absichern).
- Tracking-Daten älter als 24h sollten serverseitig per Cron gelöscht werden.

## 4. Background-Tracking (offen)

Aktuelle v1 nutzt nur Foreground-Permissions (`expo-location`). Im Neubau
prüfen, ob `expo-task-manager` + `Location.startLocationUpdatesAsync` für
Background-Tracking nötig sind. Trade-off: Akkuverbrauch vs. zuverlässige
Position bei abgeschaltetem Display.

## 5. Toggle-State – Persistenz

Beide Toggle-Zustände in `AsyncStorage` persistieren, damit sie App-Neustarts
überleben. Beim App-Launch automatisch wiederherstellen (aber **nie** Tracking
ohne sichtbaren Hinweis im UI starten).
