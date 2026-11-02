# SilentSnap

Foto → evento en el Calendario. 100 % on-device (Vision + NSDataDetector + EventKit), sin backend.

```
Silentsnap/
├── project.yml                         # XcodeGen → genera SilentSnap.xcodeproj
├── Shared/                             # Compilado en la app y (próximamente) en la ShareExtension
│   ├── Models/DetectedEvent.swift
│   ├── Services/VisionParserService.swift   # OCR + extracción de fecha/hora/título/lugar
│   ├── Services/CalendarManager.swift       # EventKit (acceso de solo escritura) + alarma 24 h
│   ├── Support/AppGroup.swift               # App Group + cuota de escaneos (ScanQuota / ScanQuotaStore)
│   ├── Support/KeychainStore.swift          # Persistencia en Keychain (sobrevive a reinstalar)
│   └── Views/EventCardView.swift
├── SilentSnap/                         # Target app
│   ├── App/SilentSnapApp.swift
│   ├── Store/PurchaseManager.swift          # StoreKit 2, com.silentsnap.unlimited
│   ├── Support/SamplePosters.swift          # Carteles sintéticos para probar OCR en el Simulador
│   ├── Views/ContentView.swift
│   ├── Views/PaywallView.swift
│   ├── Views/DocumentCameraView.swift       # VisionKit VNDocumentCameraViewController
│   └── Resources/SilentSnap.storekit        # Configuración StoreKit local (14,99 €)
├── .github/workflows/ios-simulator.yml # Compila SilentSnap.app gratis en GitHub Actions (macOS)
└── ShareExtension/                     # Siguiente paso
```

## Cómo probar desde Windows (sin Mac ni iPhone)

1. **Sube este repositorio a GitHub** (en un repo público los minutos de macOS son 100 % gratuitos e ilimitados).
2. Ve a la pestaña **Actions** en tu repositorio de GitHub → verás el flujo **iOS Simulator Build** ejecutándose en un Mac con Xcode.
3. Cuando termine en verde (tarda ~2 minutos), baja hasta **Artifacts** y descarga **`SilentSnap-iOS-Simulator-App`**.
4. Descomprímelo en tu PC para obtener `SilentSnap.app` y vuelve a comprimir la carpeta `SilentSnap.app` en `.zip` (o súbela directamente en **[Appetize.io](https://appetize.io/upload)**).
5. Al abrir el iPhone virtual en tu navegador, verás en la pantalla principal la tarjeta **"Modo Simulador · Carteles de prueba"** (exclusiva del simulador, no aparece en dispositivos reales ni en la App Store) con 3 carteles/tickets que se dibujan como imagen y pasan por el motor real de `Vision` + `NSDataDetector` + `EventKit`.

## Puesta en marcha (macOS)

1. `brew install xcodegen && xcodegen generate`
2. Abre `SilentSnap.xcodeproj`, pon tu Team y registra el App Group `group.com.silentsnap.shared`.
3. En App Store Connect crea el producto no consumible `com.silentsnap.unlimited` (Tier 14,99 €).
4. Ejecuta: el esquema ya usa `SilentSnap.storekit` para probar compras en el simulador.
