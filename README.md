# Turnexo (`turnexo.com`)

**Hospitality Operations & Digital Guestbooks** — Plataforma SaaS self-service para anfitriones y gestores de alquiler vacacional.

## Módulos Comercializables (por separado o en Pack)
- **Módulo 1 · Operativa de Limpiezas por iCal (`/c/:token`)**: Sincronización bajo demanda (caché 30 min · 0 € en Cron) con Airbnb y Booking, detección de rotaciones en el mismo día, checklist personalizable por piso en español y auditoría fotográfica con compresión automática WebP (`< 60 KB`).
- **Módulo 2 · Guía Digital del Huésped + Venta de Extras (`/g/:slug`)**: Portal interactivo para el huésped (ES / EN / FR) con vídeos paso a paso de entrada, desbloqueo de código de portero y buzón, Home Tour, WiFi, horarios de llegada/salida, checklist de salida y solicitud de Late Check-out / Extras.

## Rutas de la Aplicación
- `/` — Web comercial pública (`LandingPageView.tsx`)
- `/app` — Panel de gestión del anfitrión y onboarding self-service (`AuthOnboardingView.tsx` + `HostDashboardView.tsx`)
- `/g/:slug` — Portal interactivo del huésped (`GuestGuidePortalView.tsx`)
- `/c/:token` — App móvil sin contraseñas para personal de limpieza (`CleanerMagicView.tsx`)
