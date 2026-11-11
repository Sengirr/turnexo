export type DashboardLanguage = 'es' | 'en';

export interface DashboardTranslations {
  nav: {
    overview: string;
    schedule: string;
    guests: string;
    invoices: string;
    billing: string;
    controlPanel: string;
    activeSubscription: string;
    freePlan: string;
    logout: string;
    menu: string;
    close: string;
  };
  overview: {
    badge: string;
    title: string;
    subtitle: string;
    newPropertyBtn: string;
    upgradeNotice: string;
    upgradeBtn: string;
    baseSchedule: string;
    cleaningStaff: string;
    noCleaner: string;
    guestGuide: string;
    videosCount: string;
    extrasCount: string;
    guideUrlLabel: string;
    copyUrl: string;
    copied: string;
    whatsappTemplate: string;
    customizeBtn: string;
    viewGuideBtn: string;
    qrPosterBtn: string;
    nextCleaning: string;
    noPendingCleanings: string;
    noPropertiesYet: string;
    createFirstProperty: string;
    statusCompleted: string;
    statusPending: string;
    statusInProgress: string;
  };
  schedule: {
    badge: string;
    title: string;
    subtitle: string;
    tabSchedule: string;
    tabTeam: string;
    addManualCleaning: string;
    newCleaner: string;
    allProperties: string;
    allCleaners: string;
    allStatuses: string;
    checkoutHour: string;
    checkinHour: string;
    assignedTo: string;
    cost: string;
    viewPhotos: string;
    sendMagicLink: string;
    magicLinkCopied: string;
    cleanerApp: string;
  };
  guests: {
    badge: string;
    title: string;
    subtitle: string;
    selectProperty: string;
    openInNewTab: string;
    printQrPoster: string;
    multilingualNotice: string;
  };
  invoices: {
    badge: string;
    title: string;
    subtitle: string;
    newInvoiceBtn: string;
    exportExcelBtn: string;
    fiscalProfileBtn: string;
    totalBilled: string;
    taxBase: string;
    vatAccrued: string;
    invoicesCount: string;
    quarter: string;
    client: string;
    date: string;
    amount: string;
    proPaywallTitle: string;
    proPaywallDesc: string;
    upgradeToPro: string;
  };
  billing: {
    badge: string;
    title: string;
    monthly: string;
    annual: string;
    annualDiscount: string;
    currentPlanBadge: string;
    manageStripe: string;
    subscribeBtn: string;
    planStarterTitle: string;
    planStarterDesc: string;
    planProTitle: string;
    planProDesc: string;
    planManagerTitle: string;
    planManagerDesc: string;
  };
}

export const DASHBOARD_TRANSLATIONS: Record<DashboardLanguage, DashboardTranslations> = {
  es: {
    nav: {
      overview: 'Mis Alojamientos',
      schedule: 'Limpiezas & Equipo',
      guests: 'Guía del Huésped',
      invoices: 'Facturas & Fiscal',
      billing: 'Suscripción',
      controlPanel: 'Panel de Control',
      activeSubscription: 'Suscripción Activa',
      freePlan: 'Plan Gratuito',
      logout: 'Cerrar sesión',
      menu: 'Menú ☰',
      close: 'Cerrar ✕',
    },
    overview: {
      badge: 'Gestión de Alojamientos',
      title: 'Alojamientos',
      subtitle: 'Gestiona la sincronización iCal, guías del viajero y cuadrantes de limpieza.',
      newPropertyBtn: '+ Nuevo Alojamiento',
      upgradeNotice: 'Has alcanzado el límite de alojamientos de tu plan.',
      upgradeBtn: 'Mejorar Plan',
      baseSchedule: 'HORARIO BASE',
      cleaningStaff: 'LIMPIEZA & PERSONAL',
      noCleaner: 'Sin limpiadora asignada',
      guestGuide: 'GUÍA DEL HUÉSPED',
      videosCount: 'vídeos',
      extrasCount: 'extras',
      guideUrlLabel: 'URL DE LA GUÍA (QR Y BIENVENIDA)',
      copyUrl: 'Copiar URL',
      copied: '¡Copiado!',
      whatsappTemplate: 'Plantilla WhatsApp',
      customizeBtn: 'Personalizar',
      viewGuideBtn: 'Ver Guía',
      qrPosterBtn: 'Cartel QR',
      nextCleaning: 'PRÓXIMA LIMPIEZA',
      noPendingCleanings: 'Sin limpiezas pendientes',
      noPropertiesYet: 'Aún no tienes ningún alojamiento registrado.',
      createFirstProperty: 'Añadir mi primer alojamiento',
      statusCompleted: 'Completada',
      statusPending: 'Pendiente',
      statusInProgress: 'En curso',
    },
    schedule: {
      badge: 'Cuadrante Automatizado',
      title: 'Limpiezas & Equipo',
      subtitle: 'Cuadrante generado automáticamente a partir de tus calendarios iCal de Airbnb y Booking.',
      tabSchedule: 'Cuadrante de Limpiezas',
      tabTeam: 'Equipo de Limpiadoras',
      addManualCleaning: '+ Nueva Limpieza Manual',
      newCleaner: '+ Nueva Limpiadora',
      allProperties: 'Todos los alojamientos',
      allCleaners: 'Todo el personal',
      allStatuses: 'Todos los estados',
      checkoutHour: 'Salida huésped',
      checkinHour: 'Llegada nuevo huésped',
      assignedTo: 'Asignada a',
      cost: 'Pago por limpieza',
      viewPhotos: 'Ver fotos verificación',
      sendMagicLink: 'Enviar enlace WhatsApp',
      magicLinkCopied: 'Enlace copiado',
      cleanerApp: 'Ver app móvil',
    },
    guests: {
      badge: 'Experiencia del Huésped',
      title: 'Guía Digital del Huésped',
      subtitle: 'El portal interactivo que reciben tus viajeros con WiFi, vídeos, late check-out y normas de la casa.',
      selectProperty: 'Selecciona un alojamiento para previsualizar:',
      openInNewTab: 'Abrir Guía en Vivo ↗',
      printQrPoster: 'Imprimir Cartel QR para la casa',
      multilingualNotice: 'La guía para el viajero incluye selector de idioma en Español, Inglés, Francés y Alemán.',
    },
    invoices: {
      badge: 'Gestión Fiscal y Modelo 303',
      title: 'Facturas a Huéspedes & Libro de IVA',
      subtitle: 'Emisión legal de Facturas Simplificadas (< 3.000 € sin DNI obligatorio) y resumen para el Modelo 303 de Hacienda.',
      newInvoiceBtn: '+ Emitir Factura',
      exportExcelBtn: 'Descargar Libro en Excel (Gestoría)',
      fiscalProfileBtn: 'Perfil Fiscal Emisor',
      totalBilled: 'Total Facturado',
      taxBase: 'Base Imponible',
      vatAccrued: 'IVA 10% Devengado',
      invoicesCount: 'Facturas Emitidas',
      quarter: 'Trimestre',
      client: 'Huésped / Plataforma',
      date: 'Fecha',
      amount: 'Importe Total',
      proPaywallTitle: 'Módulo Fiscal exclusivo para Plan Pro y Microgestora',
      proPaywallDesc: 'Automatiza la emisión de Facturas Simplificadas y descarga el Libro Registro en Excel para tu gestoría listo para el Modelo 303.',
      upgradeToPro: 'Activar Plan Pro Fiscal (Prueba 14 días gratis)',
    },
    billing: {
      badge: 'Planes transparentes sin permanencia',
      title: 'Tu Suscripción',
      monthly: 'Pago Mensual',
      annual: 'Pago Anual',
      annualDiscount: '-20%',
      currentPlanBadge: 'PLAN ACTUAL',
      manageStripe: 'Gestionar en Stripe',
      subscribeBtn: 'Suscribirme',
      planStarterTitle: 'Starter',
      planStarterDesc: 'Ideal para anfitriones con 1 alojamiento que quieren automatizar limpiezas y guía digital sin coste.',
      planProTitle: 'Pro Fiscal',
      planProDesc: 'Para propietarios exigentes: hasta 5 alojamientos, 2 limpiadoras y Módulo Fiscal de Facturas e IVA 10%.',
      planManagerTitle: 'Microgestora',
      planManagerDesc: 'Para gestores profesionales: hasta 10 alojamientos, limpiadoras ilimitadas y marca blanca.',
    },
  },
  en: {
    nav: {
      overview: 'My Properties',
      schedule: 'Cleanings & Team',
      guests: 'Guest Guide',
      invoices: 'Invoices & Tax',
      billing: 'Subscription',
      controlPanel: 'Host Dashboard',
      activeSubscription: 'Active Subscription',
      freePlan: 'Free Plan',
      logout: 'Sign Out',
      menu: 'Menu ☰',
      close: 'Close ✕',
    },
    overview: {
      badge: 'Property Management',
      title: 'Properties',
      subtitle: 'Manage iCal calendar syncing, digital guest guides and automated cleaning turns.',
      newPropertyBtn: '+ New Property',
      upgradeNotice: 'You have reached your plan property limit.',
      upgradeBtn: 'Upgrade Plan',
      baseSchedule: 'BASE SCHEDULE',
      cleaningStaff: 'CLEANING & STAFF',
      noCleaner: 'No cleaner assigned',
      guestGuide: 'GUEST GUIDE',
      videosCount: 'videos',
      extrasCount: 'extras',
      guideUrlLabel: 'GUEST GUIDE LINK (QR & WELCOME)',
      copyUrl: 'Copy Link',
      copied: 'Copied!',
      whatsappTemplate: 'WhatsApp Template',
      customizeBtn: 'Customize',
      viewGuideBtn: 'View Guide',
      qrPosterBtn: 'QR Poster',
      nextCleaning: 'NEXT CLEANING',
      noPendingCleanings: 'No upcoming cleanings',
      noPropertiesYet: 'You have not added any properties yet.',
      createFirstProperty: 'Add my first property',
      statusCompleted: 'Completed',
      statusPending: 'Pending',
      statusInProgress: 'In Progress',
    },
    schedule: {
      badge: 'Automated Schedule',
      title: 'Cleanings & Team',
      subtitle: 'Automatically coordinated from your Airbnb and Booking iCal calendars.',
      tabSchedule: 'Cleaning Schedule',
      tabTeam: 'Cleaning Staff',
      addManualCleaning: '+ New Manual Cleaning',
      newCleaner: '+ New Cleaner',
      allProperties: 'All properties',
      allCleaners: 'All staff',
      allStatuses: 'All statuses',
      checkoutHour: 'Guest check-out',
      checkinHour: 'Next check-in',
      assignedTo: 'Assigned to',
      cost: 'Pay per clean',
      viewPhotos: 'View checklist photos',
      sendMagicLink: 'Send WhatsApp invite',
      magicLinkCopied: 'Link copied',
      cleanerApp: 'Open cleaner app',
    },
    guests: {
      badge: 'Guest Experience',
      title: 'Digital Guest Guide',
      subtitle: 'The interactive mobile guide your guests receive with WiFi, videos, late check-out and house rules.',
      selectProperty: 'Select a property to preview:',
      openInNewTab: 'Open Live Guide ↗',
      printQrPoster: 'Print Frame QR Poster',
      multilingualNotice: 'The guest guide includes a real-time language switcher with Spanish, English, French and German.',
    },
    invoices: {
      badge: 'Tax Compliance & VAT Ledger',
      title: 'Guest Invoices & VAT Ledger',
      subtitle: 'Compliant Simplified Invoices (< €3,000 without mandatory Tax ID) and summary for tax reporting.',
      newInvoiceBtn: '+ Create Invoice',
      exportExcelBtn: 'Export Excel Ledger (Tax Advisor)',
      fiscalProfileBtn: 'Fiscal Profile',
      totalBilled: 'Total Billed',
      taxBase: 'Tax Base',
      vatAccrued: '10% VAT Output',
      invoicesCount: 'Issued Invoices',
      quarter: 'Quarter',
      client: 'Guest / Platform',
      date: 'Date',
      amount: 'Total Amount',
      proPaywallTitle: 'Tax Module available on Pro Fiscal and Microgestora plans',
      proPaywallDesc: 'Automatically generate compliant simplified invoices and download quarterly Excel ledgers ready for your tax advisor.',
      upgradeToPro: 'Activate Pro Fiscal Plan (14-day free trial)',
    },
    billing: {
      badge: 'Transparent plans without contracts',
      title: 'Your Subscription',
      monthly: 'Monthly Billing',
      annual: 'Annual Billing',
      annualDiscount: '-20%',
      currentPlanBadge: 'CURRENT PLAN',
      manageStripe: 'Manage in Stripe',
      subscribeBtn: 'Subscribe',
      planStarterTitle: 'Starter',
      planStarterDesc: 'Ideal for hosts with 1 property looking to automate cleanings and digital guide at no cost.',
      planProTitle: 'Pro Fiscal',
      planProDesc: 'For serious hosts: up to 5 properties, 2 cleaners and Tax Module with 10% VAT invoices.',
      planManagerTitle: 'Microgestora',
      planManagerDesc: 'For property managers: up to 10 properties, unlimited cleaners and white-label branding.',
    },
  },
};
