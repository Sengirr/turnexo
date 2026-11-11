export type LandingLanguage = 'es' | 'en';

export interface LandingTranslations {
  nav: {
    includes: string;
    comparison: string;
    pricing: string;
    faq: string;
    contact: string;
    login: string;
    goToDashboard: string;
    freeTrialBtn: string;
    mobileLoginCta: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    subtitle: string;
    check1Title: string;
    check1Desc: string;
    check2Title: string;
    check2Desc: string;
    check3Title: string;
    check3Desc: string;
    ctaBtn: string;
    noCardNote: string;
    metric1Val: string;
    metric1Desc: string;
    metric2Val: string;
    metric2Desc: string;
    metric3Val: string;
    metric3Desc: string;
  };
  modules: {
    badge: string;
    title: string;
    subtitle: string;
    // Motor 1: Huésped
    mod1Num: string;
    mod1Badge: string;
    mod1Title: string;
    mod1Desc: string;
    mod1Card1Title: string;
    mod1Card1Desc: string;
    mod1Card2Title: string;
    mod1Card2Desc: string;
    mod1Card3Title: string;
    mod1Card3Desc: string;
    mod1Card4Title: string;
    mod1Card4Desc: string;
    mod1Cta: string;
    // Motor 2: Limpieza
    mod2Num: string;
    mod2Badge: string;
    mod2Title: string;
    mod2Desc: string;
    mod2Card1Title: string;
    mod2Card1Desc: string;
    mod2Card2Title: string;
    mod2Card2Desc: string;
    mod2Card3Title: string;
    mod2Card3Desc: string;
    mod2Card4Title: string;
    mod2Card4Desc: string;
    mod2Cta: string;
    // Motor 3: Facturación
    mod3Num: string;
    mod3Badge: string;
    mod3Title: string;
    mod3Desc: string;
    mod3Card1Title: string;
    mod3Card1Desc: string;
    mod3Card2Title: string;
    mod3Card2Desc: string;
    mod3Card3Title: string;
    mod3Card3Desc: string;
    mod3SummaryTitle: string;
    mod3SummaryBadge: string;
    mod3SummaryInvoices: string;
    mod3SummaryInvoicesVal: string;
    mod3SummaryBase: string;
    mod3SummaryVat: string;
    mod3File1Name: string;
    mod3File1Sub: string;
    mod3File2Name: string;
    mod3File2Sub: string;
  };
  comparison: {
    badge: string;
    title: string;
    subtitle: string;
    thTask: string;
    thManual: string;
    thPms: string;
    thTurnexo: string;
    rows: Array<{
      task: string;
      manual: string;
      pms: string;
      turnexo: string;
    }>;
  };
  pricing: {
    badge: string;
    title: string;
    subtitle: string;
    mostChosenBadge: string;
    billingMonthly: string;
    billingYearly: string;
    yearlyDiscountBadge: string;
    billedYearlyNote: string;
    plans: Array<{
      planKey: 'plan_starter' | 'plan_pro' | 'plan_manager';
      name: string;
      units: string;
      price: string;
      priceYearly: string;
      note: string;
      noteYearly: string;
      savingsText?: string;
      summary: string;
      highlight: boolean;
      cta: string;
      features: string[];
    }>;
    customBannerBadge: string;
    customBannerTitle: string;
    customBannerDesc: string;
    customBannerCta: string;
  };
  faq: {
    badge: string;
    title: string;
    items: Array<{
      q: string;
      a: string;
    }>;
  };
  bottomCta: {
    badge: string;
    title: string;
    freeWord: string;
    desc: string;
    ctaBtn: string;
  };
  footer: {
    brandDesc: string;
    supportBtn: string;
    col2Title: string;
    linkIncludes: string;
    linkComparison: string;
    linkPricing: string;
    linkFaq: string;
    linkGuestDemo: string;
    linkCleanerDemo: string;
    col3Title: string;
    linkLogin: string;
    linkRegister: string;
    linkContact: string;
    linkPrivacy: string;
    linkTerms: string;
    linkLegal: string;
    copyright: string;
    icalCompat: string;
  };
  contactModal: {
    badge: string;
    title: string;
    successTitle: string;
    successDesc: (units: string, channel: string) => string;
    supportAlternative: string;
    closeBtn: string;
    nameLabel: string;
    namePlaceholder: string;
    channelLabel: string;
    channelPlaceholder: string;
    unitsLabel: string;
    unitsOptions: string[];
    messageLabel: string;
    messagePlaceholder: string;
    submitBtn: string;
    orDirectEmail: string;
  };
  phoneMockup: {
    cleanerViewTab: string;
    guestViewTab: string;
    // Cleaner Screen
    cleanerSubheader: string;
    cleanerTitle: string;
    cleanerProgress: string;
    urgentBadge: string;
    turnaroundTime: string;
    propertyTitle: string;
    checklistHeader: string;
    doneLabel: string;
    tasks: Array<{ id: string; label: string; checked: boolean }>;
    photoBtnDefault: (count: number) => string;
    photoBtnAdded: string;
    cleanerFooterBadge: string;
    // Guest Screen
    guestSubheader: string;
    guestTitle: string;
    languagesBadge: string;
    wifiButtonCopied: string;
    wifiButtonDefault: string;
    wifiSubDefault: string;
    wifiActionCopied: string;
    wifiActionDefault: string;
    shortcutsHeader: string;
    shortcuts: Array<{
      id: string;
      title: string;
      sub: string;
    }>;
    viewingLabel: string;
    viewLabel: string;
    extrasHeader: string;
    extrasKeepAll: string;
    extrasList: string;
    extraBtnRequested: string;
    extraBtnDefault: string;
    // External CTA below phone
    externalCtaCleaner: string;
    externalCtaGuest: string;
    externalDescCleaner: string;
    externalDescGuest: string;
  };
}

export const LANDING_TRANSLATIONS: Record<LandingLanguage, LandingTranslations> = {
  es: {
    nav: {
      includes: 'Qué incluye',
      comparison: 'Comparativa',
      pricing: 'Precios',
      faq: 'FAQ',
      contact: 'Contacto',
      login: 'Iniciar sesión',
      goToDashboard: 'Ir a mi panel →',
      freeTrialBtn: 'Probar 1 Alojamiento Gratis',
      mobileLoginCta: 'Iniciar sesión / Crear cuenta gratis →',
    },
    hero: {
      badge: 'LISTO PARA EL NUEVO MARCO FISCAL: FACTURAS SIMPLIFICADAS Y MODELO 303',
      titleStart: 'El día a día de tus alojamientos.',
      titleHighlight: 'Sin llamadas, sin WhatsApps y sin líos con el IVA.',
      subtitle:
        'Conecta el calendario de tus anuncios en 30 segundos. Turnexo se encarga de coordinar a tu equipo de limpieza, resolver las dudas de tus viajeros y preparar los libros contables para tu gestoría.',
      check1Title: 'Cuadrante de limpieza sin grupos de WhatsApp:',
      check1Desc:
        'Tu limpiadora entra con un enlace móvil sin contraseñas, marca las tareas y sube fotos del alojamiento antes de cada check-in.',
      check2Title: 'Guía digital interactiva para el huésped:',
      check2Desc:
        'Clave WiFi en un toque, vídeos cortos de electrodomésticos para evitar llamadas a deshoras y venta de extras (early check-in, late check-out, cunas o parking).',
      check3Title: 'Facturación e IVA del 10% en un solo clic:',
      check3Desc:
        'Convierte tus reservas de Airbnb y Booking en facturas oficiales y exporta el libro trimestral en Excel listo para el Modelo 303.',
      ctaBtn: 'Probar 1 Alojamiento Gratis →',
      noCardNote: 'Plan Gratuito para 1 alojamiento · Sin tarjeta de crédito ni permanencia',
      metric1Val: '60 seg',
      metric1Desc: 'Sincronización automática iCal',
      metric2Val: '1 clic',
      metric2Desc: 'Exportación oficial para tu gestoría',
      metric3Val: '100 %',
      metric3Desc: 'Guías interactivas para el viajero',
    },
    modules: {
      badge: 'QUÉ HACE TURNEXO POR TI',
      title: 'Las 3 tareas que más tiempo te quitan cada semana, automatizadas en una sola plataforma.',
      subtitle:
        'Sin curva de aprendizaje ni instalaciones para tus huéspedes o tu limpiadora. Todo funciona con enlaces web directos desde el primer minuto.',
      mod1Num: '01 · EXPERIENCIA DEL HUÉSPED',
      mod1Badge: 'Sin apps ni descargas',
      mod1Title: 'Todo tu alojamiento explicado en vídeo antes de que el huésped llegue a la puerta.',
      mod1Desc:
        'Le mandas un enlace por WhatsApp o por el chat de Airbnb en cuanto confirma la reserva. Desde su móvil resuelve el check-in, consulta cómo funcionan los aparatos de la casa y contrata extras sin llamarte.',
      mod1Card1Title: 'Vídeo Home Tour',
      mod1Card1Desc: 'Un recorrido visual por las estancias para que conozca el alojamiento por dentro antes de viajar.',
      mod1Card2Title: 'Llegada y llaves paso a paso',
      mod1Card2Desc: 'Vídeo desde la calle hasta el portal y código de apertura del cajetín o cerradura digital.',
      mod1Card3Title: 'Manual en vídeo de equipamiento',
      mod1Card3Desc: 'Clips de 15 segundos para aire acondicionado, placa, calefacción o cafetera que evitan llamadas nocturnas.',
      mod1Card4Title: 'Venta de Extras Personalizados',
      mod1Card4Desc: 'Ofrece Early Check-in, Late Check-out (si el iCal está libre), cuna de bebé, parking o mascotas. Cobras el 100% sin comisiones.',
      mod1Cta: 'Ver ejemplo real de Guía del Huésped',
      mod2Num: '02 · OPERATIVA DE LIMPIEZA',
      mod2Badge: 'Acceso móvil sin contraseñas',
      mod2Title: 'Tu equipo recibe las limpiezas automáticamente y tú compruebas con fotos que todo está listo.',
      mod2Desc:
        'Cada cambio en tu calendario de Airbnb o Booking actualiza al instante el enlace móvil de tu limpiadora. Ve qué alojamiento toca hoy, si hay entrada esa misma tarde y sube fotos al terminar.',
      mod2Card1Title: 'Agenda conectada por iCal',
      mod2Card1Desc: 'Las nuevas reservas, modificaciones o cancelaciones se reflejan en su teléfono al instante.',
      mod2Card2Title: 'Checklist por habitación',
      mod2Card2Desc: 'Puntos de control claros para dormitorio, baño, cocina y reposición de básicos en cada salida.',
      mod2Card3Title: 'Fotos de comprobación',
      mod2Card3Desc: 'Recibe las fotos del alojamiento recién limpio en tu panel antes de que entre el siguiente huésped.',
      mod2Card4Title: 'Aviso de rotación en el día',
      mod2Card4Desc: 'Marca como prioritarias las salidas de las 11:00h que tienen nueva entrada esa misma tarde.',
      mod2Cta: 'Ver ejemplo real de la App de Limpiadora',
      mod3Num: '03 · FACTURACIÓN Y GESTORÍA',
      mod3Badge: 'IVA 10% · Modelo 303',
      mod3Title: 'De reservas de Airbnb y Booking a facturas oficiales listas para tu gestor en un clic.',
      mod3Desc:
        'Olvídate de perder tardes enteras al final del trimestre haciendo facturas una por una en Word o Excel. Turnexo calcula la base imponible y el 10% de IVA de cada reserva automáticamente.',
      mod3Card1Title: 'Facturas simplificadas y con NIF',
      mod3Card1Desc: 'Numeración correlativa oficial con desglose de IVA al 10% y descarga en PDF.',
      mod3Card2Title: 'Exportación trimestral en Excel',
      mod3Card2Desc: 'Libro Registro estructurado para que tu gestoría liquide el Modelo 303 en minutos.',
      mod3Card3Title: 'Varios propietarios (Multi-NIF)',
      mod3Card3Desc: 'Configura distintos titulares y series si gestionas alojamientos de varios dueños.',
      mod3SummaryTitle: 'RESUMEN TRIMESTRAL · LIBRO IVA',
      mod3SummaryBadge: 'MODELO 303 LISTO',
      mod3SummaryInvoices: 'Facturas emitidas (Airbnb + Booking):',
      mod3SummaryInvoicesVal: '28 facturas',
      mod3SummaryBase: 'Base imponible acumulada:',
      mod3SummaryVat: 'IVA repercutido al 10% (Casilla 07):',
      mod3File1Name: 'Libro_IVA_3T.xlsx',
      mod3File1Sub: 'Excel para gestoría',
      mod3File2Name: '28 Facturas PDF',
      mod3File2Sub: 'Serie F2026 correlativa',
    },
    comparison: {
      badge: 'COMPARATIVA DIRECTA',
      title: 'Por qué los anfitriones dejan atrás el caos de WhatsApp y los programas caros.',
      subtitle:
        'Ni perder horas cada semana coordinando todo a mano, ni pagar cuotas por alojamiento en herramientas pensadas para grandes hoteles.',
      thTask: 'Tarea del día a día',
      thManual: 'A mano (WhatsApp y Excel)',
      thPms: 'Software / PMS tradicional',
      thTurnexo: 'Con Turnexo',
      rows: [
        {
          task: 'Coordinación de limpiezas',
          manual: 'Mensajes y capturas del calendario cada vez que entra o cambia una reserva',
          pms: 'Obliga a tu equipo a instalar apps, recordar claves y usar menús complejos',
          turnexo: '✓ Limpiezas actualizadas al instante en un enlace móvil sin contraseñas',
        },
        {
          task: 'Revisión del alojamiento',
          manual: 'A ciegas: te enteras de un olvido cuando llega el siguiente huésped',
          pms: 'Solo permite marcar «limpio», sin checklist visual por estancia',
          turnexo: '✓ Checklist por habitación y fotos de comprobación antes del check-in',
        },
        {
          task: 'Llegada y dudas del huésped',
          manual: 'PDFs que nadie lee y llamadas a deshoras por las llaves o la calefacción',
          pms: 'Formularios pesados sin vídeos del acceso ni del equipamiento',
          turnexo: '✓ Guía Digital en vídeo enviada por enlace antes de que el viajero salga de casa',
        },
        {
          task: 'Venta de extras (Early/Late, cunas, parking)',
          manual: 'Se regalan por compromiso o se negocian uno por uno por WhatsApp',
          pms: 'Comisiones por venta o sin avisar automáticamente a la limpiadora',
          turnexo: '✓ Catálogo propio (Early/Late según calendario, cunas, parking) 100% íntegro para ti',
        },
        {
          task: 'Facturas al 10% de IVA y gestoría',
          manual: 'Tardes enteras al final del trimestre pasando reservas a Word o Excel',
          pms: 'Módulos de contabilidad aparte con sobrecoste mensual',
          turnexo: '✓ Facturas oficiales en un clic y Libro Registro en Excel listo para el Modelo 303',
        },
        {
          task: 'Precio mensual',
          manual: '0 €, a cambio de tu tiempo libre y estar pendiente del teléfono',
          pms: 'Cuota base más recargo o comisión por cada alojamiento añadido',
          turnexo: 'Plan gratuito (1 alojamiento) · Hasta 5 alojamientos por 19 €/mes (tarifa plana)',
        },
      ],
    },
    pricing: {
      badge: 'PRECIOS · TARIFA PLANA, NO POR ALOJAMIENTO',
      title: 'Empieza gratis. Paga solo cuando crezcas.',
      subtitle:
        'Con un solo extra vendido al mes (Early Check-in, Late Check-out o parking) la suscripción se paga sola.',
      mostChosenBadge: 'Más elegido',
      billingMonthly: 'Pago Mensual',
      billingYearly: 'Pago Anual',
      yearlyDiscountBadge: '🎁 2 meses gratis (-20%)',
      billedYearlyNote: 'facturado en un pago anual',
      plans: [
        {
          planKey: 'plan_starter',
          name: 'Starter',
          units: '1 alojamiento',
          price: '0 €',
          priceYearly: '0 €',
          note: '/ mes',
          noteYearly: '/ mes (0 €/año)',
          savingsText: '100% gratis',
          summary:
            'Plan gratuito para probar Turnexo con 1 alojamiento real. Incluye la App de Limpiadora y la Guía Digital para tus viajeros.',
          highlight: false,
          cta: 'Empezar gratis (Sin tarjeta)',
          features: [
            'App de Limpiadora con checklist por habitación y fotos',
            'Guía Digital del Huésped con vídeos del alojamiento y check-in',
            'Catálogo de extras a tu medida (Early/Late Check-out, cuna, parking...)',
            'Sincronización iCal automática con Airbnb y Booking',
            'Fotos de comprobación guardadas 7 días',
            'Sello discreto "Creado con Turnexo" en la Guía',
          ],
        },
        {
          planKey: 'plan_pro',
          name: 'Pro Fiscal',
          units: 'Hasta 5 alojamientos',
          price: '19 €',
          priceYearly: '15 €',
          note: '/ mes (tarifa plana)',
          noteYearly: '/ mes (180 € al año)',
          savingsText: 'Ahorras 48 € al año (2,5 meses gratis)',
          summary:
            'Todo el control operativo más facturación oficial al 10% de IVA y exportación trimestral en 1 clic para tu gestoría.',
          highlight: true,
          cta: 'Activar Plan Pro Fiscal',
          features: [
            'Todo lo incluido en Starter para hasta 5 alojamientos',
            'Facturas simplificadas y con NIF al 10% de IVA en 1 clic',
            'Libro Registro trimestral en Excel listo para el Modelo 303',
            'Soporte para varios propietarios (Multi-NIF)',
            'Historial fotográfico ilimitado ante reclamaciones',
            'Guía Digital 100% marca blanca (sin sello de Turnexo)',
          ],
        },
        {
          planKey: 'plan_manager',
          name: 'Microgestora',
          units: 'Hasta 10 alojamientos',
          price: '39 €',
          priceYearly: '31 €',
          note: '/ mes (tarifa plana)',
          noteYearly: '/ mes (372 € al año)',
          savingsText: 'Ahorras 96 € al año (2,5 meses gratis)',
          summary:
            'Para gestores con varias limpiadoras y múltiples propietarios que necesitan coordinar todas las salidas sin líos.',
          highlight: false,
          cta: 'Activar Plan Microgestora',
          features: [
            'Todo lo incluido en Pro Fiscal para hasta 10 alojamientos',
            'Múltiples limpiadoras con asignación por alojamiento',
            'Control y resumen mensual de limpiezas por persona',
            'Soporte prioritario directo',
          ],
        },
      ],
      customBannerBadge: 'CARTERAS DE +10 ALOJAMIENTOS',
      customBannerTitle: '¿Gestionas más de 10 alojamientos?',
      customBannerDesc:
        'Contamos con planes de tarifa plana para gestoras de 15, 30 o más alojamientos e importación inicial asistida sin coste.',
      customBannerCta: 'Consultar tarifa a medida',
    },
    faq: {
      badge: 'PREGUNTAS FRECUENTES',
      title: 'Todo lo que necesitas saber antes de empezar.',
      items: [
        {
          q: '¿Cómo se conecta con mis anuncios de Airbnb y Booking?',
          a: 'Sin dar las contraseñas de tus cuentas. Solo copias el enlace de calendario iCal (.ics) que te dan Airbnb, Booking o Vrbo y lo pegas en Turnexo. En 30 segundos todas tus reservas y cambios quedan sincronizados automáticamente.',
        },
        {
          q: '¿Mis limpiadoras necesitan descargarse una app o crearse cuenta?',
          a: 'No. Cada limpiadora recibe un enlace privado y directo por WhatsApp. Al abrirlo en el navegador de su móvil ve qué alojamientos tienen salida hoy, si entra otro huésped esa misma tarde, marca el checklist por habitación y sube fotos con su cámara al terminar para que compruebes que todo está listo.',
        },
        {
          q: '¿Cómo recibe el huésped la Guía Digital del alojamiento? ¿Tiene que descargar algo?',
          a: 'Funciona directamente en el navegador de su móvil sin instalar nada. Le envías el enlace por WhatsApp o por el chat de Airbnb cuando confirma la reserva: así ve el alojamiento en vídeo antes de viajar, sigue el check-in paso a paso al llegar a la puerta y consulta vídeos cortos de la placa, calefacción o cafetera sin llamarte a deshoras.',
        },
        {
          q: '¿Cómo funciona la venta de extras (Early Check-in, Late Check-out, cuna o parking)?',
          a: 'Tú configuras qué extras ofrecer en cada alojamiento y el precio de cada uno. Para las entradas antes de hora o salidas tarde, Turnexo revisa tu calendario iCal y solo las ofrece si ese día está libre. Cuando apruebas un extra, el horario de tu limpiadora se actualiza solo y tú cobras el 100% del importe sin comisiones.',
        },
        {
          q: '¿Cómo funcionan las facturas con el 10% de IVA para mi gestoría?',
          a: 'Desde cada reserva generas la factura simplificada o con NIF con el 10% de IVA desglosado en un clic. Si gestionas alojamientos de varios propietarios, puedes configurar distintos titulares y series (Multi-NIF). Al acabar el trimestre, descargas el Libro Registro en Excel listo para que tu gestoría presente el Modelo 303 en minutos.',
        },
        {
          q: '¿Tengo permanencia o tengo que poner mi tarjeta de crédito para probar?',
          a: 'Cero permanencia y sin tarjeta de crédito para empezar. El plan Starter para 1 alojamiento es gratuito, y puedes cambiar de plan o cancelar en cualquier momento con un clic desde tu panel.',
        },
      ],
    },
    bottomCta: {
      badge: 'EMPIEZA EN MENOS DE 5 MINUTOS · SIN TARJETA',
      title: 'Pon tu primer alojamiento en piloto automático hoy mismo.',
      freeWord: 'Gratis.',
      desc: 'Conecta tu calendario iCal de Airbnb o Booking, comparte el enlace móvil con tu limpiadora y envía la Guía Digital en vídeo a tu próximo huésped antes de que viaje.',
      ctaBtn: 'Probar 1 Alojamiento Gratis →',
    },
    footer: {
      brandDesc:
        'Coordinación de limpiezas por iCal, Guía Digital del Huésped en vídeo y facturación oficial al 10% de IVA lista para el Modelo 303 de tu gestoría.',
      supportBtn: 'Escribir a soporte / Contacto',
      col2Title: 'Producto y Ejemplos Reales',
      linkIncludes: 'Qué incluye Turnexo',
      linkComparison: 'Comparativa con WhatsApp y PMS',
      linkPricing: 'Precios y Plan Gratuito (1 alojamiento)',
      linkFaq: 'Preguntas frecuentes (FAQ)',
      linkGuestDemo: 'Ver ejemplo de Guía del Huésped',
      linkCleanerDemo: 'Ver ejemplo de App de Limpiadora',
      col3Title: 'Cuenta y Legal',
      linkLogin: 'Iniciar sesión en mi cuenta',
      linkRegister: 'Crear cuenta gratis (1 alojamiento) →',
      linkContact: 'Contacto y atención a gestoras',
      linkPrivacy: 'Política de Privacidad',
      linkTerms: 'Términos de Servicio',
      linkLegal: 'Aviso Legal y Cookies',
      copyright: 'Turnexo. Todos los derechos reservados.',
      icalCompat: 'Compatible con calendarios iCal de Airbnb, Booking y Vrbo.',
    },
    contactModal: {
      badge: 'CONTACTO DIRECTO · TURNEXO',
      title: '¿En qué podemos ayudarte?',
      successTitle: '¡Mensaje recibido correctamente!',
      successDesc: (units, channel) =>
        `Hemos registrado tu consulta para ${units} y te responderemos en menos de 24 horas a ${channel}.`,
      supportAlternative: 'También puedes escribirnos directamente cuando quieras a',
      closeBtn: 'Cerrar ventana',
      nameLabel: 'TU NOMBRE',
      namePlaceholder: 'Ej. Laura Gómez',
      channelLabel: 'TU EMAIL O WHATSAPP',
      channelPlaceholder: 'tu@email.com o +34 600...',
      unitsLabel: 'ALOJAMIENTOS QUE GESTIONAS',
      unitsOptions: ['1 alojamiento', '2 a 5 alojamientos', '6 a 10 alojamientos', 'Más de 10 alojamientos'],
      messageLabel: '¿QUÉ NECESITAS?',
      messagePlaceholder:
        'Cuéntanos cuántos alojamientos tienes o cualquier duda sobre limpiezas, guías o facturación...',
      submitBtn: 'Enviar consulta',
      orDirectEmail: 'O escríbenos directamente a',
    },
    phoneMockup: {
      cleanerViewTab: '📱 Vista Limpiadora',
      guestViewTab: '✨ Vista Huésped',
      cleanerSubheader: 'Parte de hoy · Sin contraseñas',
      cleanerTitle: 'Limpiezas de María Carmen',
      cleanerProgress: '2 de 3 completadas',
      urgentBadge: 'Rotación urgente',
      turnaroundTime: '11:00 → 15:00',
      propertyTitle: 'Loft Centro Catedral',
      checklistHeader: 'Checklist obligatorio (haz clic):',
      doneLabel: 'Hecho',
      tasks: [
        { id: 'sabanas', label: 'Sábanas cambiadas', checked: true },
        { id: 'bano', label: 'Baño desinfectado', checked: true },
        { id: 'amenities', label: 'Reposición amenities', checked: false },
        { id: 'llaves', label: 'Llaves en cajetín', checked: true },
      ],
      photoBtnDefault: (count) => `📸 Subir fotos de comprobación (${count} subidas)`,
      photoBtnAdded: '✓ Foto añadida a la revisión',
      cleanerFooterBadge: '0 audios de WhatsApp · Todo sincronizado por iCal',
      guestSubheader: 'Guía Digital del Huésped',
      guestTitle: 'Guía de Bienvenida · Loft Centro',
      languagesBadge: 'ES · EN · FR',
      wifiButtonCopied: '✓ Clave WiFi copiada al portapapeles',
      wifiButtonDefault: '🔑 Copiar clave WiFi',
      wifiSubDefault: 'Red: LoftCentro_5G · Toque rápido',
      wifiActionCopied: 'Copiado',
      wifiActionDefault: 'Copiar',
      shortcutsHeader: 'Accesos directos en vídeo (1 toque):',
      shortcuts: [
        {
          id: 'checkin',
          title: 'Vídeo Check-in en portal',
          sub: 'Código entrada 4829# y cajetín paso a paso (0:45s)',
        },
        {
          id: 'vitro',
          title: 'Cómo usar la vitrocerámica',
          sub: 'Desbloqueo táctil y encendido rápido (0:20s)',
        },
        {
          id: 'normas',
          title: 'Normas de la casa',
          sub: 'Silencio 23:00h, reciclaje y recogida de llaves',
        },
      ],
      viewingLabel: 'Viendo',
      viewLabel: 'Ver →',
      extrasHeader: 'Extras disponibles (0% comisión)',
      extrasKeepAll: '100% para ti',
      extrasList: 'Early Check-in · Late Check-out · Cuna bebé · Parking',
      extraBtnRequested: '✓ Extra solicitado al anfitrión',
      extraBtnDefault: 'Solicitar extra para mi estancia',
      externalCtaCleaner: 'Abrir enlace real de la Limpiadora',
      externalCtaGuest: 'Abrir Guía Digital real del Huésped',
      externalDescCleaner: 'Así lo ve tu limpiadora en su móvil sin instalar nada',
      externalDescGuest: 'Así recibe tu huésped el enlace del alojamiento antes de llegar',
    },
  },
  en: {
    nav: {
      includes: 'Features',
      comparison: 'Comparison',
      pricing: 'Pricing',
      faq: 'FAQ',
      contact: 'Contact',
      login: 'Log in',
      goToDashboard: 'Go to Dashboard →',
      freeTrialBtn: 'Try 1 Property Free',
      mobileLoginCta: 'Log in / Create free account →',
    },
    hero: {
      badge: 'READY FOR TAX COMPLIANCE: SIMPLIFIED INVOICES & AUTOMATED VAT BOOKS',
      titleStart: 'Effortless vacation rental operations.',
      titleHighlight: 'Zero calls, zero WhatsApp chaos, hassle-free taxes.',
      subtitle:
        'Sync your listing calendars in 30 seconds. Turnexo coordinates your cleaning crew, answers guest inquiries with video guides, and generates accounting books for your tax advisor.',
      check1Title: 'Cleaning schedules without WhatsApp groups:',
      check1Desc:
        'Your cleaner opens a passwordless mobile link, checks off room tasks, and uploads inspection photos before every check-in.',
      check2Title: 'Interactive Digital Guest Guide:',
      check2Desc:
        'One-tap WiFi access, short appliance walkthrough videos to avoid late-night calls, and built-in upsells (early check-in, late check-out, cribs, parking).',
      check3Title: '1-Click Invoicing & 10% VAT reporting:',
      check3Desc:
        'Turn Airbnb and Booking reservations into compliant invoices and export quarterly Excel registries ready for tax filing.',
      ctaBtn: 'Try 1 Property Free →',
      noCardNote: 'Free Plan for 1 property · No credit card required · Cancel anytime',
      metric1Val: '60 sec',
      metric1Desc: 'Automatic iCal calendar sync',
      metric2Val: '1 click',
      metric2Desc: 'Official export for your accountant',
      metric3Val: '100%',
      metric3Desc: 'Interactive guest video guides',
    },
    modules: {
      badge: 'WHAT TURNEXO DOES FOR YOU',
      title: 'The 3 most time-consuming weekly tasks, automated in a single platform.',
      subtitle:
        'Zero learning curve, no apps for guests or cleaners to install. Everything runs seamlessly via instant web links from day one.',
      mod1Num: '01 · GUEST EXPERIENCE',
      mod1Badge: 'No app download needed',
      mod1Title: 'Your entire home explained in short videos before guests even reach the doorstep.',
      mod1Desc:
        'Send a link via WhatsApp or the Airbnb chat as soon as a booking is confirmed. On their phone, guests handle check-in, learn how appliances work, and purchase extras without bothering you.',
      mod1Card1Title: 'Video Home Tour',
      mod1Card1Desc: 'A visual walkthrough so guests can explore each room before arriving.',
      mod1Card2Title: 'Step-by-step Arrival & Keys',
      mod1Card2Desc: 'Street-to-door video plus lockbox codes or digital smart lock instructions.',
      mod1Card3Title: 'Appliance Video Manuals',
      mod1Card3Desc: '15-second clips for AC, stovetop, heating, or coffee maker that stop midnight support calls.',
      mod1Card4Title: 'Custom Extra Upsells',
      mod1Card4Desc: 'Offer Early Check-in, Late Check-out (only when iCal is free), baby cribs, or parking. Keep 100% of revenue with 0% commissions.',
      mod1Cta: 'View live Guest Guide example',
      mod2Num: '02 · CLEANING OPERATIONS',
      mod2Badge: 'Passwordless mobile link',
      mod2Title: 'Your crew gets cleanings automatically, and you verify everything with real photos.',
      mod2Desc:
        'Any booking update on Airbnb or Booking instantly updates your cleaner’s mobile link. They see today’s turnovers, same-day arrivals, and upload completion photos.',
      mod2Card1Title: 'iCal Connected Schedule',
      mod2Card1Desc: 'New reservations, date changes, or cancellations reflect on their phone in real time.',
      mod2Card2Title: 'Room-by-Room Checklist',
      mod2Card2Desc: 'Clear inspection checkpoints for bedroom, bathroom, kitchen, and amenity restock.',
      mod2Card3Title: 'Photo Verification Audit',
      mod2Card3Desc: 'Receive photos of the freshly cleaned home in your host dashboard before the next guest arrives.',
      mod2Card4Title: 'Same-day Turnover Alerts',
      mod2Card4Desc: 'Highlights 11:00 AM departures with a new arrival scheduled for the same afternoon.',
      mod2Cta: 'View live Cleaner App example',
      mod3Num: '03 · INVOICING & ACCOUNTING',
      mod3Badge: '10% VAT · Official Bookkeeping',
      mod3Title: 'Convert Airbnb & Booking reservations into official invoices in 1 click.',
      mod3Desc:
        'Stop wasting entire weekends at the end of every quarter drafting invoices one-by-one in Excel or Word. Turnexo automatically calculates tax base and VAT for each booking.',
      mod3Card1Title: 'Simplified & Tax ID Invoices',
      mod3Card1Desc: 'Sequential official numbering, itemized 10% VAT breakdown, and instant PDF downloads.',
      mod3Card2Title: 'Quarterly Excel Export',
      mod3Card2Desc: 'Structured revenue & VAT registry ready for your tax advisor to file official forms in minutes.',
      mod3Card3Title: 'Multiple Owners (Multi-Tax ID)',
      mod3Card3Desc: 'Configure different legal entities and invoice series if you manage properties for multiple owners.',
      mod3SummaryTitle: 'QUARTERLY SUMMARY · VAT REGISTRY',
      mod3SummaryBadge: 'TAX FILING READY',
      mod3SummaryInvoices: 'Issued invoices (Airbnb + Booking):',
      mod3SummaryInvoicesVal: '28 invoices',
      mod3SummaryBase: 'Cumulative taxable base:',
      mod3SummaryVat: 'Collected VAT at 10%:',
      mod3File1Name: 'VAT_Registry_Q3.xlsx',
      mod3File1Sub: 'Excel for accountant',
      mod3File2Name: '28 Invoices PDF',
      mod3File2Sub: 'Sequential F2026 series',
    },
    comparison: {
      badge: 'DIRECT COMPARISON',
      title: 'Why property hosts leave behind WhatsApp chaos and overpriced software.',
      subtitle:
        'Stop losing hours every week coordinating manually, without paying expensive per-unit fees designed for large hotel chains.',
      thTask: 'Daily Workflow',
      thManual: 'Manual (WhatsApp & Excel)',
      thPms: 'Traditional PMS / Software',
      thTurnexo: 'With Turnexo',
      rows: [
        {
          task: 'Cleaning coordination',
          manual: 'Screenshots and messaging back and forth every time a booking changes',
          pms: 'Forces cleaners to install apps, remember passwords, and navigate complex menus',
          turnexo: '✓ Cleanings updated instantly via a passwordless mobile link',
        },
        {
          task: 'Property inspection',
          manual: 'Blind trust: you only find out about an issue when the guest complains',
          pms: 'Only allows marking "clean", without visual room-by-room checklist',
          turnexo: '✓ Room-by-room checklist and photo verification before check-in',
        },
        {
          task: 'Guest arrival & questions',
          manual: 'Clunky PDFs nobody reads and late-night calls about keys or heat',
          pms: 'Lengthy forms with no video walkthroughs of entry or appliances',
          turnexo: '✓ Video Digital Guide sent by link before travelers leave home',
        },
        {
          task: 'Extra upsells (Early/Late, cribs, parking)',
          manual: 'Given away for free out of politeness or negotiated one by one',
          pms: 'Platform cuts/commissions or fails to notify cleaners automatically',
          turnexo: '✓ Custom catalog (Early/Late based on iCal, cribs, parking) 100% kept by you',
        },
        {
          task: 'Invoices & tax bookkeeping',
          manual: 'Wasting entire weekends typing reservations into Word or Excel',
          pms: 'Accounting features sold as expensive separate add-ons',
          turnexo: '✓ 1-click official invoices and Excel ledger ready for your tax advisor',
        },
        {
          task: 'Monthly cost',
          manual: '€0, at the expense of your personal time and 24/7 phone stress',
          pms: 'Base fee plus per-listing charge or commission on every booking',
          turnexo: 'Free Plan (1 property) · Up to 5 properties for €19/mo (flat rate)',
        },
      ],
    },
    pricing: {
      badge: 'PRICING · FLAT RATE, NOT PER PROPERTY',
      title: 'Start free. Only pay as you grow.',
      subtitle: 'With just one extra sold per month (Early Check-in, Late Check-out, or parking), the plan pays for itself.',
      mostChosenBadge: 'Most Popular',
      billingMonthly: 'Monthly',
      billingYearly: 'Yearly',
      yearlyDiscountBadge: '🎁 2 months free (-20%)',
      billedYearlyNote: 'billed annually',
      plans: [
        {
          planKey: 'plan_starter',
          name: 'Starter',
          units: '1 property',
          price: '€0',
          priceYearly: '€0',
          note: '/ month',
          noteYearly: '/ month (€0/yr)',
          savingsText: '100% free',
          summary:
            'Free forever plan to test Turnexo on 1 live property. Includes the Cleaner App and the Digital Guest Guide.',
          highlight: false,
          cta: 'Start Free (No Credit Card)',
          features: [
            'Cleaner App with room-by-room checklist & photos',
            'Digital Guest Guide with entry walkthroughs & video manuals',
            'Custom extras catalog (Early/Late check-out, cribs, parking...)',
            'Automatic iCal sync with Airbnb, Booking & Vrbo',
            'Inspection photo history kept for 7 days',
            'Discreet "Powered by Turnexo" badge on guide',
          ],
        },
        {
          planKey: 'plan_pro',
          name: 'Pro Tax',
          units: 'Up to 5 properties',
          price: '€19',
          priceYearly: '€15',
          note: '/ month (flat rate)',
          noteYearly: '/ month (€180 / year)',
          savingsText: 'Save €48/year (2.5 months free)',
          summary:
            'Full operational control plus official invoicing with 10% VAT and 1-click quarterly Excel export for your accountant.',
          highlight: true,
          cta: 'Activate Pro Tax Plan',
          features: [
            'Everything in Starter for up to 5 properties',
            '1-click simplified and Tax ID invoices with 10% VAT',
            'Quarterly Excel ledger ready for official tax filing',
            'Support for multiple property owners (Multi-Tax ID)',
            'Unlimited photo audit history for protection against claims',
            '100% white-label Digital Guide (no Turnexo branding)',
          ],
        },
        {
          planKey: 'plan_manager',
          name: 'Manager',
          units: 'Up to 10 properties',
          price: '€39',
          priceYearly: '€31',
          note: '/ month (flat rate)',
          noteYearly: '/ month (€372 / year)',
          savingsText: 'Save €96/year (2.5 months free)',
          summary:
            'For property managers with multiple cleaners and owners needing smooth turnover coordination without headaches.',
          highlight: false,
          cta: 'Activate Manager Plan',
          features: [
            'Everything in Pro Tax for up to 10 properties',
            'Multiple cleaners with property-level assignment',
            'Monthly cleaning overview and tracking per person',
            'Priority direct customer support',
          ],
        },
      ],
      customBannerBadge: 'PORTFOLIOS OF 10+ PROPERTIES',
      customBannerTitle: 'Managing more than 10 properties?',
      customBannerDesc:
        'We offer flat-rate packages for portfolios of 15, 30, or more properties with free white-glove onboarding and data import.',
      customBannerCta: 'Request custom quote',
    },
    faq: {
      badge: 'FREQUENTLY ASKED QUESTIONS',
      title: 'Everything you need to know before getting started.',
      items: [
        {
          q: 'How does it connect to my Airbnb and Booking listings?',
          a: 'Without sharing your account passwords. Simply copy the public iCal (.ics) calendar link provided by Airbnb, Booking, or Vrbo and paste it into Turnexo. Within 30 seconds, all current reservations and upcoming changes sync automatically.',
        },
        {
          q: 'Do my cleaners need to download an app or create an account?',
          a: 'No. Each cleaner receives a private, direct link via WhatsApp or SMS. Opening it in their mobile browser shows which apartments check out today, same-day arrivals, room checklists, and allows snap-and-upload photos so you know it’s ready.',
        },
        {
          q: 'How do guests receive the Digital Guide? Do they need to install anything?',
          a: 'It works straight inside their mobile browser with zero installation. You share the link via WhatsApp or Airbnb message once their booking is confirmed. They can watch video arrival tours, follow step-by-step key pickup, and view appliance guides without calling you late at night.',
        },
        {
          q: 'How does selling extras (Early Check-in, Late Check-out, cribs, parking) work?',
          a: 'You choose which extras to offer per property and set your own prices. For early arrivals or late departures, Turnexo checks your live iCal calendar and only offers them if the date is open. When you approve an extra, your cleaner’s schedule automatically shifts and you keep 100% of the payment with zero commissions.',
        },
        {
          q: 'How do official invoices and VAT reporting work for my accountant?',
          a: 'From any booking, generate a compliant invoice with itemized 10% VAT in one click. If you manage units for several owners, you can set distinct tax details and series (Multi-Tax ID). At quarter-end, export an Excel registry ready for your tax advisor to submit in minutes.',
        },
        {
          q: 'Is there any commitment or credit card required to try Turnexo?',
          a: 'Zero commitments and no credit card required to start. The Starter plan for 1 property is 100% free forever, and you can upgrade, downgrade, or cancel anytime with one click in your dashboard.',
        },
      ],
    },
    bottomCta: {
      badge: 'GET STARTED IN UNDER 5 MINUTES · NO CREDIT CARD',
      title: 'Put your first vacation rental on autopilot today.',
      freeWord: 'Free.',
      desc: 'Connect your Airbnb or Booking iCal calendar, share the mobile link with your cleaner, and send the video Digital Guide to your next guest before they travel.',
      ctaBtn: 'Try 1 Property Free →',
    },
    footer: {
      brandDesc:
        'iCal cleaning schedule coordination, video Digital Guest Guide, and official 10% VAT invoicing ready for your accountant.',
      supportBtn: 'Message Support / Contact',
      col2Title: 'Product & Real Examples',
      linkIncludes: 'Turnexo Features',
      linkComparison: 'Comparison vs WhatsApp & PMS',
      linkPricing: 'Pricing & Free Plan (1 property)',
      linkFaq: 'Frequently Asked Questions (FAQ)',
      linkGuestDemo: 'View Guest Guide Example',
      linkCleanerDemo: 'View Cleaner App Example',
      col3Title: 'Account & Legal',
      linkLogin: 'Log in to account',
      linkRegister: 'Create free account (1 property) →',
      linkContact: 'Contact & Property Managers',
      linkPrivacy: 'Privacy Policy',
      linkTerms: 'Terms of Service',
      linkLegal: 'Legal Notice & Cookies',
      copyright: 'Turnexo. All rights reserved.',
      icalCompat: 'Compatible with iCal calendars from Airbnb, Booking, and Vrbo.',
    },
    contactModal: {
      badge: 'DIRECT CONTACT · TURNEXO',
      title: 'How can we help you?',
      successTitle: 'Message received successfully!',
      successDesc: (units, channel) =>
        `We have registered your inquiry for ${units} and will get back to you within 24 hours at ${channel}.`,
      supportAlternative: 'You can also reach us directly anytime at',
      closeBtn: 'Close window',
      nameLabel: 'YOUR NAME',
      namePlaceholder: 'e.g. Sarah Jenkins',
      channelLabel: 'YOUR EMAIL OR WHATSAPP',
      channelPlaceholder: 'sarah@email.com or +1 555...',
      unitsLabel: 'PROPERTIES YOU MANAGE',
      unitsOptions: ['1 property', '2 to 5 properties', '6 to 10 properties', 'More than 10 properties'],
      messageLabel: 'HOW CAN WE HELP?',
      messagePlaceholder:
        'Tell us how many properties you operate or ask any questions about cleanings, guest guides, or invoicing...',
      submitBtn: 'Send inquiry',
      orDirectEmail: 'Or email us directly at',
    },
    phoneMockup: {
      cleanerViewTab: '📱 Cleaner View',
      guestViewTab: '✨ Guest View',
      cleanerSubheader: 'Today’s Tasks · Passwordless',
      cleanerTitle: 'Carmen’s Cleaning Schedule',
      cleanerProgress: '2 of 3 completed',
      urgentBadge: 'Same-day turnaround',
      turnaroundTime: '11:00 AM → 3:00 PM',
      propertyTitle: 'Cathedral Center Loft',
      checklistHeader: 'Mandatory checklist (tap to check):',
      doneLabel: 'Done',
      tasks: [
        { id: 'sabanas', label: 'Fresh bed linens replaced', checked: true },
        { id: 'bano', label: 'Bathroom fully sanitized', checked: true },
        { id: 'amenities', label: 'Toiletries & amenities restocked', checked: false },
        { id: 'llaves', label: 'Keys stored in lockbox', checked: true },
      ],
      photoBtnDefault: (count) => `📸 Upload verification photos (${count} uploaded)`,
      photoBtnAdded: '✓ Photo added to host review',
      cleanerFooterBadge: '0 WhatsApp audio messages · Synced by iCal',
      guestSubheader: 'Digital Guest Guide',
      guestTitle: 'Welcome Guide · City Loft',
      languagesBadge: 'ES · EN · FR',
      wifiButtonCopied: '✓ WiFi password copied to clipboard',
      wifiButtonDefault: '🔑 Copy WiFi password',
      wifiSubDefault: 'Network: LoftCentro_5G · Tap to copy',
      wifiActionCopied: 'Copied',
      wifiActionDefault: 'Copy',
      shortcutsHeader: '1-tap video quick links:',
      shortcuts: [
        {
          id: 'checkin',
          title: 'Building Entrance Video',
          sub: 'Access code 4829# & lockbox walkthrough (0:45s)',
        },
        {
          id: 'vitro',
          title: 'How to use the induction cooktop',
          sub: 'Child-lock unlock & quick start (0:20s)',
        },
        {
          id: 'normas',
          title: 'House rules & quiet hours',
          sub: 'Quiet hours 11:00 PM, trash disposal & key drop',
        },
      ],
      viewingLabel: 'Viewing',
      viewLabel: 'Watch →',
      extrasHeader: 'Available extras (0% commission)',
      extrasKeepAll: '100% kept by you',
      extrasList: 'Early Check-in · Late Check-out · Baby Crib · Parking',
      extraBtnRequested: '✓ Extra requested from host',
      extraBtnDefault: 'Request extra for my stay',
      externalCtaCleaner: 'Open live Cleaner App link',
      externalCtaGuest: 'Open live Guest Digital Guide',
      externalDescCleaner: 'How your cleaner sees it on mobile without installing anything',
      externalDescGuest: 'How your guest receives the property link before arrival',
    },
  },
};
