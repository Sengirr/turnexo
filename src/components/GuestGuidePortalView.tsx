import React, { useEffect, useState } from 'react';
import {
  Wifi,
  Video,
  Home,
  MapPin,
  LogOut,
  Clock,
  AlertCircle,
  Copy,
  Play,
  CheckCircle2,
  Headset,
  Compass,
  ShoppingBag,
  ArrowRight,
  Key,
  UserCheck,
  HelpCircle,
  Phone,
  Info,
  PlusCircle,
  CheckCircle,
  Gift,
  Package,
  Car,
  Baby,
  Dog,
  Sparkles,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Property, PropertyExtra, Reservation } from '../lib/icalParser';

type Language = 'es' | 'en' | 'fr';

const GUEST_TRANSLATIONS: Record<Language, Record<string, any>> = {
  es: {
    welcome: '¡Hola, {name}!',
    subtitle: 'Tu estancia en {property}',
    google_maps: 'VER EN GOOGLE MAPS',
    step_by_step_cta: 'VER PASO A PASO PARA ENTRAR',
    tabs: {
      home: 'Inicio',
      arrival: 'Llegada',
      guide: 'Guía',
      departure: 'Salida',
      extras: 'Extras',
      support: 'Ayuda',
    },
    wifi: {
      title: 'Conexión WiFi',
      network: 'Red',
      password: 'Contraseña',
      copied: '¡Copiado!',
    },
    video: {
      title: 'Explora tu Hogar',
      subtitle: 'Echa un vistazo rápido para conocer cada rincón.',
      tour: 'Home Tour',
      instructions: 'Video Instrucciones',
      tap_to_play: 'Toca para reproducir',
    },
    info: {
      address: 'Dirección',
      checkin: 'Entrada (a partir de las {time})',
      checkout: 'Salida (antes de las {time})',
    },
    arrival: {
      title: 'Tu Llegada',
      time_label: '¿A qué hora tienes previsto llegar?',
      time_confirm: 'Confirma tu hora prevista',
      early_warning:
        'La entrada oficial es a partir de las {time}h. Si llegas antes, avísanos por WhatsApp y te avisaremos en cuanto el alojamiento esté listo.',
      welcome_header: 'Bienvenido a {property}',
      instructions_confirm_btn: 'Confirmo que entiendo las instrucciones de llegada',
      instructions_confirm_thanks:
        '¡Gracias por confirmar! 🎉 Nuestro equipo ya sabe que has leído las instrucciones. ¡Te esperamos!',
      additional_guides: 'Guías adicionales',
      intercom_code: 'Código Portero',
      door_code: 'Código Buzón',
      video_unlock: 'Mira el vídeo de la guía para ver el código',
      unlock_manual: 'Mostrar código ahora',
      arrival_confirm_desc: 'Avisar al equipo de mi llegada',
      arrival_confirm_btn: '¡He llegado!',
      arrival_confirm_success: '¡Ya has llegado!',
      confirmed_at: 'Confirmado a las {time}',
    },
    departure: {
      title: 'Tu Salida',
      subtitle: 'La salida máximo es a las {time}h',
      time_label: '¿A qué hora piensas marcharte?',
      instructions: 'Instrucciones de salida',
      checklist_title: 'Antes de marcharte...',
    },
    guide: {
      title: 'Guía de la Casa',
      subtitle: 'Clips rápidos para ayudarte con los electrodomésticos.',
      no_clips: 'No hay clips disponibles todavía',
      appliances_title: 'Funcionamiento de Electrodomésticos',
      rules_title: 'Normas de la Casa',
      neighborhood_title: 'Recomendaciones de la Zona',
    },
    extras: {
      title: 'Mejora tu Estancia',
      subtitle: 'Solicita servicios adicionales para disfrutar al máximo de tu alojamiento.',
      request_btn: 'Solicitar',
      requested_badge: 'Solicitado · Pendiente de confirmación',
      approved_badge: 'Confirmado hasta las {time}h',
      whatsapp_confirm: 'Confirmar por WhatsApp',
    },
    support: {
      title: 'Soporte y Ayuda',
      incident: 'Reportar Incidencia',
      incident_desc: '¿Algo no funciona bien en el apartamento? Avísanos aquí',
      whatsapp_direct: 'Atención Directa por WhatsApp',
      whatsapp_desc: 'Respuesta rápida de tu anfitrión',
    },
    incident_modal: {
      title: 'Reportar Incidencia',
      subtitle: 'Aviso directo a soporte',
      what_happening: '¿Qué sucede?',
      placeholder_title: 'Ej: La cafetera no funciona o falta una toalla',
      details: 'Más detalles (opcional)',
      placeholder_details: 'Cuéntanos un poco más para solucionarlo cuanto antes...',
      submit: 'Enviar Reporte',
      success_title: '¡Recibido!',
      success_desc: 'Hemos avisado a nuestro equipo. Nos pondremos en contacto contigo lo antes posible.',
    },
  },
  en: {
    welcome: 'Hello, {name}!',
    subtitle: 'Your stay at {property}',
    google_maps: 'VIEW ON GOOGLE MAPS',
    step_by_step_cta: 'VIEW STEP-BY-STEP TO ENTER',
    tabs: {
      home: 'Home',
      arrival: 'Arrival',
      guide: 'Guide',
      departure: 'Departure',
      extras: 'Extras',
      support: 'Support',
    },
    wifi: {
      title: 'WiFi Connection',
      network: 'Network',
      password: 'Password',
      copied: 'Copied!',
    },
    video: {
      title: 'Explore your Home',
      subtitle: 'Take a quick look around every corner.',
      tour: 'Home Tour',
      instructions: 'Video Instructions',
      tap_to_play: 'Tap to play',
    },
    info: {
      address: 'Address',
      checkin: 'Check-in (from {time})',
      checkout: 'Check-out (before {time})',
    },
    arrival: {
      title: 'Your Arrival',
      time_label: 'What time do you plan to arrive?',
      time_confirm: 'Confirm your estimated arrival time',
      early_warning:
        'Official check-in starts at {time}. If you arrive earlier, message us on WhatsApp and we will let you know as soon as the apartment is ready.',
      welcome_header: 'Welcome to {property}',
      instructions_confirm_btn: 'I confirm I understand the arrival instructions',
      instructions_confirm_thanks:
        'Thanks for confirming! 🎉 Our team knows you have read the arrival instructions. See you soon!',
      additional_guides: 'Additional guides',
      intercom_code: 'Intercom Code',
      door_code: 'Lockbox / Door Code',
      video_unlock: 'Watch the guide video above to unlock the code',
      unlock_manual: 'Show code now',
      arrival_confirm_desc: 'Notify the team that I have arrived',
      arrival_confirm_btn: 'I have arrived!',
      arrival_confirm_success: 'Checked in!',
      confirmed_at: 'Confirmed at {time}',
    },
    departure: {
      title: 'Your Departure',
      subtitle: 'Latest check-out is at {time}',
      time_label: 'What time do you plan to leave?',
      instructions: 'Check-out instructions',
      checklist_title: 'Before you leave...',
    },
    guide: {
      title: 'House Guide',
      subtitle: 'Quick video clips to help you with the appliances.',
      no_clips: 'No video clips available yet',
      appliances_title: 'Appliances & Equipment Guide',
      rules_title: 'House Rules',
      neighborhood_title: 'Local Recommendations',
    },
    extras: {
      title: 'Enhance your Stay',
      subtitle: 'Request additional services to make the most of your stay.',
      request_btn: 'Request',
      requested_badge: 'Requested · Pending host confirmation',
      approved_badge: 'Confirmed until {time}',
      whatsapp_confirm: 'Confirm via WhatsApp',
    },
    support: {
      title: 'Help & Support',
      incident: 'Report an Issue',
      incident_desc: 'Something not working properly? Let us know here',
      whatsapp_direct: 'Direct WhatsApp Support',
      whatsapp_desc: 'Fast reply from your host',
    },
    incident_modal: {
      title: 'Report an Issue',
      subtitle: 'Direct alert to support team',
      what_happening: 'What is happening?',
      placeholder_title: 'E.g. The coffee machine is not working',
      details: 'More details (optional)',
      placeholder_details: 'Tell us a bit more so we can fix it right away...',
      submit: 'Send Report',
      success_title: 'Received!',
      success_desc: 'We have notified our team and will get back to you shortly.',
    },
  },
  fr: {
    welcome: 'Bonjour, {name} !',
    subtitle: 'Votre séjour à {property}',
    google_maps: 'VOIR SUR GOOGLE MAPS',
    step_by_step_cta: 'VOIR LES ÉTAPES POUR ENTRER',
    tabs: {
      home: 'Accueil',
      arrival: 'Arrivée',
      guide: 'Guide',
      departure: 'Départ',
      extras: 'Extras',
      support: 'Aide',
    },
    wifi: {
      title: 'Connexion WiFi',
      network: 'Réseau',
      password: 'Mot de passe',
      copied: 'Copié !',
    },
    video: {
      title: 'Explorez votre Logement',
      subtitle: 'Un aperçu rapide pour découvrir chaque recoin.',
      tour: 'Home Tour',
      instructions: 'Vidéo Instructions',
      tap_to_play: 'Appuyez pour lire',
    },
    info: {
      address: 'Adresse',
      checkin: 'Arrivée (à partir de {time})',
      checkout: 'Départ (avant {time})',
    },
    arrival: {
      title: 'Votre Arrivée',
      time_label: 'À quelle heure prévoyez-vous d’arriver ?',
      time_confirm: 'Confirmez votre heure d’arrivée',
      early_warning:
        'L’entrée officielle est à partir de {time}h. Prévenez-nous sur WhatsApp si vous arrivez plus tôt.',
      welcome_header: 'Bienvenue à {property}',
      instructions_confirm_btn: 'Je confirme avoir compris les instructions d’arrivée',
      instructions_confirm_thanks:
        'Merci d’avoir confirmé ! 🎉 Notre équipe sait que vous avez lu les instructions.',
      additional_guides: 'Guides supplémentaires',
      intercom_code: 'Code Interphone',
      door_code: 'Code Boîte à Clés',
      video_unlock: 'Regardez la vidéo du guide pour voir le code',
      unlock_manual: 'Afficher le code',
      arrival_confirm_desc: 'Prévenir l’équipe de mon arrivée',
      arrival_confirm_btn: 'Je suis arrivé(e) !',
      arrival_confirm_success: 'Arrivée confirmée !',
      confirmed_at: 'Confirmé à {time}',
    },
    departure: {
      title: 'Votre Départ',
      subtitle: 'Le départ est au plus tard à {time}h',
      time_label: 'À quelle heure pensez-vous partir ?',
      instructions: 'Instructions de départ',
      checklist_title: 'Avant de partir...',
    },
    guide: {
      title: 'Guide de la Maison',
      subtitle: 'Courtes vidéos pour utiliser les équipements.',
      no_clips: 'Aucune vidéo disponible',
      appliances_title: 'Équipements et Appareils',
      rules_title: 'Règlement Intérieur',
      neighborhood_title: 'Bonnes Adresses du Quartier',
    },
    extras: {
      title: 'Améliorez votre Séjour',
      subtitle: 'Demandez des services supplémentaires pour profiter au maximum.',
      request_btn: 'Demander',
      requested_badge: 'Demandé · En attente de confirmation',
      approved_badge: 'Confirmé jusqu’à {time}h',
      whatsapp_confirm: 'Confirmer sur WhatsApp',
    },
    support: {
      title: 'Assistance & Aide',
      incident: 'Signaler un Problème',
      incident_desc: 'Quelque chose ne fonctionne pas ? Prévenez-nous ici',
      whatsapp_direct: 'Contact Direct WhatsApp',
      whatsapp_desc: 'Réponse rapide de votre hôte',
    },
    incident_modal: {
      title: 'Signaler un Problème',
      subtitle: 'Alerte directe au support',
      what_happening: 'Que se passe-t-il ?',
      placeholder_title: 'Ex : La machine à café ne fonctionne pas',
      details: 'Plus de détails (optionnel)',
      placeholder_details: 'Donnez-nous plus de détails...',
      submit: 'Envoyer le Signalement',
      success_title: 'Reçu !',
      success_desc: 'Notre équipe a été prévenue et vous répondra très vite.',
    },
  },
};

function useGuestTranslation(language: Language) {
  const t = (keyPath: string, vars?: Record<string, string | number>): string => {
    const parts = keyPath.split('.');
    let cur: any = GUEST_TRANSLATIONS[language] || GUEST_TRANSLATIONS.es;
    for (const p of parts) {
      cur = cur?.[p];
    }
    if (typeof cur !== 'string') return keyPath;
    if (!vars) return cur;
    return Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
      cur
    );
  };
  return { t };
}

// --- STYLED COMPONENTS FROM IVI ERP GUEST PORTAL ---

const Card = ({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/50 border border-white transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const SectionTitle = ({
  icon: Icon,
  title,
  iconClass = 'bg-primary-ivi-light text-primary-ivi',
}: {
  icon: any;
  title: string;
  iconClass?: string;
}) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconClass}`}>
      <Icon size={20} />
    </div>
    <h2 className="text-lg font-black text-gray-900 tracking-tight">{title}</h2>
  </div>
);

const Button = ({
  className = '',
  variant = 'primary',
  size = 'default',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'outline' | 'ghost' | 'primary' | 'black';
  size?: 'icon' | 'default' | 'sm';
}) => {
  const variants: Record<string, string> = {
    outline: 'border-2 border-gray-100 bg-white hover:bg-gray-50 text-gray-900',
    ghost: 'hover:bg-white/10 text-white',
    primary: 'bg-primary-ivi text-white shadow-lg shadow-primary-ivi/30 hover:bg-primary-ivi-deep',
    black: 'bg-gray-900 text-white shadow-lg hover:bg-black',
  };
  const sizes: Record<string, string> = {
    icon: 'h-10 w-10 p-0 flex items-center justify-center',
    default: 'h-14 px-8 py-2',
    sm: 'h-10 px-4',
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-2xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- IVI ERP VIDEO PLAYER ---

interface VideoPlayerProps {
  url: string;
  title?: string;
  subtitle?: string;
  thumbnail?: string;
  isVertical?: boolean;
  language: Language;
  className?: string;
  variant?: 'default' | 'hero';
  aspectRatio?: 'video' | 'portrait' | 'square';
  onPlay?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title,
  subtitle,
  thumbnail,
  isVertical = false,
  language,
  className = '',
  variant = 'default',
  aspectRatio,
  onPlay,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useGuestTranslation(language);

  useEffect(() => {
    setIsPlaying(false);
  }, [url]);

  const getVideoData = (videoUrl: string) => {
    if (!videoUrl) return null;
    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    const isDrive = videoUrl.includes('drive.google.com');

    if (isYoutube) {
      let id = '';
      if (videoUrl.includes('shorts/')) {
        id = videoUrl.split('shorts/')[1]?.split('?')[0] || '';
      } else if (videoUrl.includes('watch?v=')) {
        id = videoUrl.split('watch?v=')[1]?.split('&')[0] || '';
      } else if (videoUrl.includes('embed/')) {
        id = videoUrl.split('embed/')[1]?.split('?')[0] || '';
      } else {
        id = videoUrl.split('/').pop() || '';
      }

      const params =
        'rel=0&modestbranding=1&controls=1&iv_load_policy=3&playsinline=1&autoplay=1&showinfo=0';
      return {
        thumbnail: thumbnail || `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?${params}`,
        isYoutube: true,
        isVertical: isVertical || videoUrl.includes('shorts/'),
      };
    }

    if (isDrive) {
      const id = videoUrl.match(/\/d\/(.+?)\//)?.[1] || videoUrl.split('id=')[1]?.split('&')[0];
      return {
        thumbnail:
          thumbnail ||
          'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800',
        embedUrl: `https://drive.google.com/file/d/${id}/preview`,
        isYoutube: false,
        isVertical,
      };
    }

    return {
      thumbnail:
        thumbnail ||
        'https://images.unsplash.com/photo-1513584684374-8bdb74838a0f?q=80&w=800',
      embedUrl: videoUrl,
      isYoutube: false,
      isVertical,
    };
  };

  const videoData = getVideoData(url);
  if (!videoData) return null;

  const finalAspectRatio = aspectRatio
    ? aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'portrait'
      ? 'aspect-[9/16]'
      : 'aspect-square'
    : videoData.isVertical
    ? 'aspect-[9/16]'
    : 'aspect-video';

  return (
    <div
      className={`relative overflow-hidden group bg-gray-900 rounded-[2rem] shadow-xl border border-white/10 ${finalAspectRatio} ${className}`}
    >
      {!isPlaying ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => {
            setIsPlaying(true);
            onPlay?.();
          }}
        >
          <div
            className={`absolute inset-0 ${
              variant === 'hero'
                ? 'bg-black/40'
                : 'bg-gradient-to-b from-black/60 via-transparent to-black/80'
            } pointer-events-none transition-opacity duration-500 group-hover:opacity-70`}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20">
            {variant !== 'hero' && (
              <div className="absolute top-6 left-6 right-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shrink-0">
                  <Video size={20} />
                </div>
                <div className="text-left">
                  {title && (
                    <h3 className="text-white font-black text-sm tracking-tight italic drop-shadow-md">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest leading-none drop-shadow-sm mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}

            {variant === 'hero' ? (
              <div className="w-20 h-20 bg-white/95 text-primary-ivi rounded-full flex items-center justify-center shadow-2xl animate-pulse-play">
                <Play size={32} fill="currentColor" className="ml-1.5" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-white/95 text-gray-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl hover:bg-primary-ivi hover:text-white transition-all duration-500 group/btn">
                <Play
                  size={40}
                  fill="currentColor"
                  className="ml-1.5 group-hover/btn:scale-110 transition-transform"
                />
              </div>
            )}

            {variant !== 'hero' && (
              <p className="mt-4 text-white/60 text-[10px] font-black uppercase tracking-widest animate-pulse">
                {t('video.tap_to_play')}
              </p>
            )}
          </div>

          <img
            src={videoData.thumbnail}
            alt={title || 'Video thumbnail'}
            className="w-full h-full object-cover grayscale-[0.25] group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
          <iframe
            src={videoData.embedUrl}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            title={title || 'Video Player'}
          />
        </div>
      )}
    </div>
  );
};

// --- MAIN GUEST GUIDE COMPONENT (IDENTICAL TO IVI ERP GUEST PORTAL) ---

interface Props {
  activePropertySlug?: string;
  properties: Property[];
  reservations: Reservation[];
  selectedReservationId: string;
  isWhiteLabel?: boolean;
  onSelectReservation: (id: string) => void;
  onRequestExtra: (reservationId: string, extra: PropertyExtra) => void;
  onUpdateReservation?: (updated: Reservation, toast?: string) => void;
  onReportGuestIncident?: (propertyId: string, reservationId: string, text: string) => void;
  onBackToApp?: () => void;
}

export default function GuestGuidePortalView({
  activePropertySlug,
  properties,
  reservations,
  selectedReservationId,
  isWhiteLabel = false,
  onSelectReservation,
  onRequestExtra,
  onUpdateReservation,
  onReportGuestIncident,
  onBackToApp,
}: Props) {
  const slugMatchedProperty = activePropertySlug
    ? properties.find((p) => p.slug === activePropertySlug)
    : undefined;

  const matchedReservation = slugMatchedProperty
    ? reservations.find((r) => r.propertyId === slugMatchedProperty.id)
    : reservations.find((r) => r.id === selectedReservationId) || reservations[0];

  const property =
    slugMatchedProperty ||
    properties.find((p) => p.id === matchedReservation?.propertyId) ||
    properties[0];

  const reservation: Reservation = matchedReservation || {
    id: `preview-${property?.id || 'res'}`,
    propertyId: property?.id || '',
    guestName: 'Huésped',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    source: 'Directo',
    requestedExtras: [],
  };

  const [language, setLanguage] = useState<Language>('es');
  const { t } = useGuestTranslation(language);

  const [activeTab, setActiveTab] = useState<
    'guide' | 'arrival' | 'extras' | 'house' | 'departure'
  >('guide');

  const [copiedField, setCopiedField] = useState<'wifi' | 'pass' | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [isVideoWatched, setIsVideoWatched] = useState(false);

  // Modal interactivo de Incidencias (igual que IVI ERP)
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDetails, setIncidentDetails] = useState('');
  const [incidentSent, setIncidentSent] = useState(false);

  // Vídeos por categoría
  const checkinClips = (property.videos || []).filter((v) => v.category === 'checkin');
  const homeTourClip = (property.videos || []).find((v) => v.category === 'hometour');
  const houseClips = (property.videos || []).filter(
    (v) => v.category === 'appliance' || v.category === 'other'
  );

  // ¿Entra otro huésped el mismo día de salida en este alojamiento?
  const hasSameDayCheckIn = reservations.some(
    (other) =>
      other.id !== reservation.id &&
      other.propertyId === property.id &&
      other.checkIn === reservation.checkOut
  );

  // Lista base de extras del alojamiento (garantizando Late Check-out si está configurado en el alojamiento)
  const baseExtras: PropertyExtra[] = [...(property.extras || [])];
  const hasLateInExtras = baseExtras.some(
    (e) => e.onlyWhenFreeNextDay || e.id === 'ext-late' || /late/i.test(e.title)
  );

  if (!hasLateInExtras && property.lateCheckoutPrice !== 0) {
    baseExtras.unshift({
      id: `ext-late-${property.id}`,
      title: `Late Check-out hasta las ${property.lateCheckoutUntil || '17:00'}h`,
      description:
        language === 'en'
          ? 'Afternoon departure on request. Subject to host confirmation.'
          : language === 'fr'
          ? 'Départ l’après-midi sur demande. Sous réserve de confirmation par l’hôte.'
          : 'Salida por la tarde bajo petición. Sujeto a confirmación del anfitrión.',
      price: property.lateCheckoutPrice || 35,
      priceUnit: 'reserva',
      icon: 'clock',
      onlyWhenFreeNextDay: true,
      active: true,
    });
  }

  const availableExtras = baseExtras.filter((ext) => ext.active);

  // Opciones de hora de llegada (10:00 a 02:00) y salida (06:00 a hora máxima)
  const arrivalTimeOptions: string[] = [];
  for (let i = 10; i < 24; i++) {
    const h = i.toString().padStart(2, '0');
    arrivalTimeOptions.push(`${h}:00`, `${h}:30`);
  }
  arrivalTimeOptions.push('00:00', '00:30', '01:00', '01:30', '02:00');

  const maxCheckoutHour = reservation.lateCheckoutApproved
    ? parseInt(property.lateCheckoutUntil.split(':')[0] || '17', 10)
    : parseInt(property.checkOutTime.split(':')[0] || '11', 10);

  const departureTimeOptions: string[] = [];
  for (let i = 6; i <= maxCheckoutHour; i++) {
    const h = i.toString().padStart(2, '0');
    departureTimeOptions.push(`${h}:00`);
    if (i < maxCheckoutHour) departureTimeOptions.push(`${h}:30`);
  }

  const currentArrivalTime = reservation.estimatedArrivalTime || property.checkInTime || '15:00';
  const effectiveMaxCheckout = reservation.lateCheckoutApproved
    ? property.lateCheckoutUntil
    : property.checkOutTime;
  const currentDepartureTime = reservation.estimatedDepartureTime || effectiveMaxCheckout || '11:00';

  const codesUnlocked =
    property.requireVideoToUnlockCodes === false ||
    isVideoWatched ||
    checkinClips.length === 0;

  const copyToClipboard = (text: string, field: 'wifi' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleChecklistItem = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const renderExtraIcon = (icon: PropertyExtra['icon']) => {
    switch (icon) {
      case 'car':
        return <Car size={24} />;
      case 'baby':
        return <Baby size={24} />;
      case 'dog':
        return <Dog size={24} />;
      case 'sparkles':
        return <ShoppingBag size={24} />;
      default:
        return <Clock size={24} />;
    }
  };

  const departureChecklistItems =
    property.departureChecklist && property.departureChecklist.length > 0
      ? property.departureChecklist
      : [
          'Apagar las luces',
          'Apagar AC',
          'Dejar las llaves encima de la mesa',
          'Tirar la basura',
        ];

  const cleanWhatsappPhone = property.hostWhatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-gray-50/50 selection:bg-emerald-100 selection:text-emerald-900 font-sans text-gray-900">
      {/* Barra superior discreta sólo cuando el anfitrión está previsualizando desde /app */}
      {onBackToApp && (
        <div className="bg-gray-900 text-white px-4 py-2 text-xs z-[60] relative">
          <div className="max-w-md mx-auto flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBackToApp}
              className="inline-flex items-center gap-1.5 font-black uppercase tracking-wider text-primary-ivi hover:underline"
            >
              <ArrowLeft size={14} />
              Volver a Turnexo
            </button>

            <select
              value={reservation.id}
              onChange={(e) => onSelectReservation(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg text-white px-2.5 py-1 text-[11px] font-bold outline-none"
            >
              {reservations.map((r) => {
                const p = properties.find((item) => item.id === r.propertyId);
                return (
                  <option key={r.id} value={r.id} className="text-gray-900">
                    {r.guestName.split(' ')[0]} · {p?.name.split('·')[0]}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* Elegant Sticky Header (Identical to IVI ERP) */}
      <header className="p-4 py-3 sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-ivi text-white flex items-center justify-center font-black text-sm shadow-sm shadow-primary-ivi/30">
              {property.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-black text-xs tracking-tight text-gray-900 block leading-none">
                {property.name.split('·')[0].trim()}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-primary-ivi">
                GUEST PORTAL
              </span>
            </div>
          </div>

          <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
            {(['es', 'en', 'fr'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                  language === lang
                    ? 'bg-white text-primary-ivi shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Persistent Floating WhatsApp Button (Identical to IVI ERP) */}
      <button
        type="button"
        onClick={() => window.open(`https://wa.me/${cleanWhatsappPhone}`, '_blank')}
        className="fixed bottom-28 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl z-[95] border-4 border-white hover:scale-110 active:scale-95 transition-transform"
        title="WhatsApp"
      >
        <Phone size={24} fill="currentColor" />
      </button>

      {/* Main Content Container */}
      <main className="max-w-md mx-auto p-6 pb-36 space-y-8">
        {/* TAB 1: INICIO (guide) */}
        {activeTab === 'guide' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic">
                  {t('welcome', {
                    name: (reservation.guestName || 'Huésped').split(' ')[0],
                  })}
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">
                  {t('subtitle', { property: property.name })}
                </p>
              </div>

              {/* Hero Action Card: Arrival Shortcut - Impossible to ignore */}
              <div
                onClick={() => {
                  setActiveTab('arrival');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="relative overflow-hidden p-6 rounded-[2.5rem] bg-gradient-to-br from-primary-ivi via-primary-ivi to-primary-ivi-deep text-white shadow-2xl shadow-primary-ivi/20 cursor-pointer group active:scale-[0.98] transition-all"
              >
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
                <div className="relative flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0">
                    <Key size={32} className="text-white drop-shadow-md" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black italic tracking-tighter leading-none mb-1 uppercase">
                      {t('tabs.arrival')}
                    </h3>
                    <p className="text-[10px] font-bold text-white/80 leading-snug uppercase tracking-widest">
                      {t('step_by_step_cta')}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center animate-pulse shrink-0">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>

              {/* Address & Stay Dates Card */}
              <Card className="border-primary-ivi-light bg-primary-ivi-light/30">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-primary-ivi mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {t('info.address')}
                      </p>
                      <p className="text-sm font-black text-gray-900 italic leading-tight mb-2">
                        {property.address}
                      </p>
                      {property.googleMapsUrl && (
                        <a
                          href={property.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-primary-ivi hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          <MapPin size={10} fill="currentColor" />
                          {t('google_maps')}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-primary-ivi/10">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary-ivi shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {t('info.checkin', { time: property.checkInTime })}
                        </p>
                        <p className="text-xs font-black text-gray-900">{reservation.checkIn}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <LogOut size={14} className="text-primary-ivi shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {t('info.checkout', { time: effectiveMaxCheckout })}
                        </p>
                        <p className="text-xs font-black text-gray-900">{reservation.checkOut}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Arrival Time Selector Card */}
              <Card className="border-primary-ivi-light">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-gray-900 italic mb-1">
                      {t('arrival.time_label')}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                      {t('arrival.time_confirm')}
                    </p>
                  </div>
                  <select
                    value={currentArrivalTime}
                    onChange={(e) =>
                      onUpdateReservation?.(
                        { ...reservation, estimatedArrivalTime: e.target.value },
                        `Hora de llegada actualizada a las ${e.target.value}h`
                      )
                    }
                    className="w-28 h-10 bg-gray-50 rounded-xl px-3 font-black text-gray-900 border-2 border-gray-100 focus:border-primary-ivi outline-none transition-all text-xs cursor-pointer"
                  >
                    {arrivalTimeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {currentArrivalTime < property.checkInTime && currentArrivalTime >= '10:00' && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-2">
                    <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-700 leading-tight">
                      {t('arrival.early_warning', { time: property.checkInTime })}
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Home Tour Video Card */}
            {homeTourClip && (
              <Card className="p-0 overflow-hidden border-0 shadow-2xl">
                <VideoPlayer
                  url={homeTourClip.url}
                  title={t('video.tour')}
                  subtitle={t('video.subtitle')}
                  language={language}
                  onPlay={() => setIsVideoWatched(true)}
                />
              </Card>
            )}

            {/* WiFi Connection Card */}
            {property.wifiSsid && (
              <Card className="border-primary-ivi-light">
                <SectionTitle
                  icon={Wifi}
                  title={t('wifi.title')}
                  iconClass="bg-primary-ivi-light text-primary-ivi"
                />
                <div className="space-y-4 pt-2">
                  <div
                    onClick={() => copyToClipboard(property.wifiSsid, 'wifi')}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100/70 transition"
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">
                        {t('wifi.network')}
                      </p>
                      <p className="font-black text-sm text-gray-900 italic">{property.wifiSsid}</p>
                    </div>
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg">
                      {copiedField === 'wifi' ? (
                        <CheckCircle2 size={14} className="text-primary-ivi" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                  </div>

                  <div
                    onClick={() => copyToClipboard(property.wifiPassword, 'pass')}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100/70 transition"
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">
                        {t('wifi.password')}
                      </p>
                      <p className="font-black text-sm text-gray-900 italic">
                        {copiedField === 'pass' ? t('wifi.copied') : property.wifiPassword}
                      </p>
                    </div>
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg">
                      {copiedField === 'pass' ? (
                        <CheckCircle2 size={14} className="text-primary-ivi" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Recomendaciones Destacadas de la Zona */}
            {property.localRecommendations && property.localRecommendations.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <SectionTitle
                    icon={Compass}
                    title={t('guide.neighborhood_title')}
                    iconClass="bg-blue-50 text-blue-500"
                  />
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                    {property.localRecommendations.length} {property.localRecommendations.length === 1 ? 'sitio' : 'sitios'}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {property.localRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-xs font-bold text-gray-700 leading-snug">{rec}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: LLEGADA (arrival) */}
        {activeTab === 'arrival' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <SectionTitle
              icon={MapPin}
              title={t('arrival.welcome_header', { property: property.name })}
              iconClass="bg-primary-ivi-light text-primary-ivi"
            />

            {/* Dynamic Check-in Instructions & Step-by-Step Video(s) */}
            <div className="space-y-4 mb-8">
              {property.checkInInstructions && (
                <div className="px-2">
                  <h2 className="text-xl font-black italic text-gray-900 leading-tight uppercase tracking-tight">
                    {property.checkInInstructions}
                  </h2>
                </div>
              )}

              {/* Confirmation Button / Thank you message */}
              {!reservation.arrivalInstructionsConfirmed ? (
                <Button
                  variant="primary"
                  className="w-full shadow-xl shadow-primary-ivi/20"
                  onClick={() =>
                    onUpdateReservation?.(
                      { ...reservation, arrivalInstructionsConfirmed: true },
                      'Instrucciones de llegada confirmadas por el huésped.'
                    )
                  }
                >
                  <CheckCircle2 className="mr-2 shrink-0" size={18} />
                  <span>{t('arrival.instructions_confirm_btn')}</span>
                </Button>
              ) : (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-lg shadow-emerald-100/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
                      <CheckCircle2 size={20} className="text-white" />
                    </div>
                    <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                      {t('arrival.instructions_confirm_thanks')}
                    </p>
                  </div>
                </div>
              )}

              {/* Main Hero Check-in Video (First Clip) */}
              {checkinClips.length > 0 && (
                <>
                  <VideoPlayer
                    url={checkinClips[0].url}
                    title={checkinClips[0].title}
                    variant="hero"
                    className="w-full h-full border-0 !rounded-[2.5rem]"
                    language={language}
                    onPlay={() => setIsVideoWatched(true)}
                  />

                  {/* Additional Check-in Videos Carousel if > 1 */}
                  {checkinClips.length > 1 && (
                    <div className="pt-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2 flex items-center gap-2">
                        <Video size={14} />
                        {t('arrival.additional_guides')}
                      </h3>
                      <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth">
                        {checkinClips.slice(1).map((clip) => (
                          <div key={clip.id} className="min-w-[280px] shrink-0">
                            <div className="mb-2">
                              <span className="text-xs font-bold text-gray-600 ml-1">
                                {clip.title}
                              </span>
                            </div>
                            <VideoPlayer
                              url={clip.url}
                              variant="hero"
                              className="w-full aspect-video border-0 !rounded-3xl"
                              language={language}
                              onPlay={() => setIsVideoWatched(true)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Google Maps Navigation Button */}
            {(property.googleMapsUrl || property.address) && (
              <Button
                variant="outline"
                className="w-full h-14 rounded-3xl border-2 border-blue-100 bg-blue-50/20 text-blue-600 shadow-sm hover:bg-blue-50/50 transition-all group"
                onClick={() => {
                  const url =
                    property.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      property.address
                    )}`;
                  window.open(url, '_blank');
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <MapPin size={18} />
                  </div>
                  <span className="text-sm font-black uppercase tracking-wider">
                    {t('google_maps')}
                  </span>
                </div>
              </Button>
            )}

            {/* Intercom Code Card (Reveal after video, identical to IVI ERP) */}
            {property.intercomCode && (
              <Card
                onClick={() => setIsVideoWatched(true)}
                className={`border-2 transition-all duration-500 cursor-pointer ${
                  codesUnlocked
                    ? 'bg-blue-50 border-blue-100'
                    : 'bg-orange-50/50 border-orange-100/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 ${
                      codesUnlocked
                        ? 'bg-blue-500 text-white'
                        : 'bg-orange-500/10 text-orange-500'
                    }`}
                  >
                    <Phone size={24} strokeWidth={codesUnlocked ? 2.5 : 2} />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                        codesUnlocked ? 'text-blue-600' : 'text-orange-600'
                      }`}
                    >
                      {t('arrival.intercom_code')}
                    </h4>
                    {codesUnlocked ? (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-3xl font-black text-gray-900 tracking-tighter italic leading-none">
                          {property.intercomCode}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-400 italic leading-none blur-[4px] select-none">
                          XXXXX
                        </p>
                        <p className="text-[10px] font-black text-orange-600/80 uppercase tracking-tight animate-pulse">
                          {t('arrival.video_unlock')} · ({t('arrival.unlock_manual')})
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Door / Lockbox Code Card (Reveal after video, identical to IVI ERP) */}
            {property.doorCode && (
              <Card
                onClick={() => setIsVideoWatched(true)}
                className={`border-2 transition-all duration-500 cursor-pointer ${
                  codesUnlocked
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-orange-50/50 border-orange-100/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 ${
                      codesUnlocked
                        ? 'bg-emerald-500 text-white'
                        : 'bg-orange-500/10 text-orange-500'
                    }`}
                  >
                    <Key size={24} strokeWidth={codesUnlocked ? 2.5 : 2} />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                        codesUnlocked ? 'text-emerald-600' : 'text-orange-600'
                      }`}
                    >
                      {t('arrival.door_code')}
                    </h4>
                    {codesUnlocked ? (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-3xl font-black text-gray-900 tracking-tighter italic leading-none">
                          {property.doorCode}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-400 italic leading-none blur-[4px] select-none">
                          XXXXX
                        </p>
                        <p className="text-[10px] font-black text-orange-600/80 uppercase tracking-tight animate-pulse">
                          {t('arrival.video_unlock')} · ({t('arrival.unlock_manual')})
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* "¡He llegado!" Confirmation Card */}
            <Card
              className={
                reservation.guestArrivedAt
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'border-primary-ivi-light bg-primary-ivi/5'
              }
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${
                    reservation.guestArrivedAt
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-primary-ivi'
                  } rounded-2xl flex items-center justify-center shadow-sm shrink-0`}
                >
                  <CheckCircle size={24} />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      reservation.guestArrivedAt ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    {reservation.guestArrivedAt
                      ? t('arrival.confirmed_at', { time: reservation.guestArrivedAt })
                      : t('arrival.arrival_confirm_desc')}
                  </p>
                </div>
                <Button
                  variant={reservation.guestArrivedAt ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => {
                    const nowStr = new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    onUpdateReservation?.(
                      {
                        ...reservation,
                        guestArrivedAt: reservation.guestArrivedAt ? undefined : nowStr,
                      },
                      reservation.guestArrivedAt
                        ? undefined
                        : '¡Aviso de llegada enviado al anfitrión!'
                    );
                  }}
                  className={
                    reservation.guestArrivedAt
                      ? 'border-emerald-100 text-emerald-600 bg-white'
                      : ''
                  }
                >
                  {reservation.guestArrivedAt
                    ? t('arrival.arrival_confirm_success')
                    : t('arrival.arrival_confirm_btn')}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: EXTRAS (extras) */}
        {activeTab === 'extras' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <SectionTitle
              icon={PlusCircle}
              title={t('extras.title')}
              iconClass="bg-primary-ivi-light text-primary-ivi"
            />
            <p className="text-xs font-bold text-gray-500 -mt-2 mb-4">{t('extras.subtitle')}</p>

            <div className="space-y-4">
              {availableExtras.map((extra) => {
                const isLateCheckout = Boolean(extra.onlyWhenFreeNextDay);
                const alreadyRequested =
                  (isLateCheckout && reservation.lateCheckoutRequested) ||
                  reservation.requestedExtras?.includes(extra.id);
                const isApproved =
                  (isLateCheckout && reservation.lateCheckoutApproved) ||
                  reservation.approvedExtras?.includes(extra.id);

                const whatsappLink = isLateCheckout
                  ? `https://wa.me/${cleanWhatsappPhone}?text=${encodeURIComponent(
                      `Hola, estoy en ${property.name} (${reservation.guestName}) y me gustaría solicitar el Late Check-out (salida hasta las ${property.lateCheckoutUntil || '17:00'}h por ${extra.price}€). ¿Sería posible confirmarlo? Muchas gracias.`
                    )}`
                  : `https://wa.me/${cleanWhatsappPhone}?text=${encodeURIComponent(
                      `Hola, estoy en ${property.name} (${reservation.guestName}) y he solicitado desde la guía el extra: "${extra.title}" (${extra.price}€ / ${extra.priceUnit}).`
                    )}`;

                return (
                  <Card
                    key={extra.id}
                    className="border-primary-ivi-light hover:border-primary-ivi transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary-ivi group-hover:bg-primary-ivi-light transition-colors shrink-0">
                        {renderExtraIcon(extra.icon)}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-black text-gray-900 italic">{extra.title}</h3>
                              {isLateCheckout && (
                                <span className="text-[9px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <span>{language === 'en' ? 'On Request' : language === 'fr' ? 'Sur Demande' : 'Bajo Petición'}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-pre-line leading-relaxed mt-0.5">
                              {extra.description}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-primary-ivi-light text-primary-ivi font-black text-xs shrink-0">
                            {extra.price} € / {extra.priceUnit}
                          </span>
                        </div>

                        {isApproved ? (
                          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                            <ShieldCheck size={16} />
                            {isLateCheckout
                              ? (language === 'en'
                                  ? `Confirmed by host ✓ Departure extended until ${property.lateCheckoutUntil || '17:00'}h`
                                  : language === 'fr'
                                  ? `Confirmé par l'hôte ✓ Départ repoussé à ${property.lateCheckoutUntil || '17:00'}h`
                                  : `Confirmado por el anfitrión ✓ Salida permitida hasta las ${property.lateCheckoutUntil || '17:00'}h`)
                              : language === 'en'
                              ? 'Confirmed by host ✓'
                              : language === 'fr'
                              ? 'Confirmé par votre hôte ✓'
                              : 'Confirmado por el anfitrión ✓'}
                          </div>
                        ) : alreadyRequested ? (
                          <div className="space-y-2">
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-widest text-center">
                              {isLateCheckout
                                ? (language === 'en'
                                    ? 'Late Check-out requested · Pending host confirmation'
                                    : language === 'fr'
                                    ? 'Départ tardif demandé · En attente de confirmation de l’hôte'
                                    : 'Solicitud enviada · Pendiente de confirmación del anfitrión')
                                : t('extras.requested_badge')}
                            </div>
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-full h-10 items-center justify-center rounded-2xl bg-[#25D366] text-white text-xs font-black uppercase tracking-widest hover:opacity-95 transition-all shadow-md"
                            >
                              {isLateCheckout
                                ? (language === 'en'
                                    ? 'Ask host on WhatsApp'
                                    : language === 'fr'
                                    ? 'Consulter l’hôte sur WhatsApp'
                                    : 'Avisar al anfitrión por WhatsApp')
                                : t('extras.whatsapp_confirm')}
                            </a>
                          </div>
                        ) : (
                          <Button
                            variant="black"
                            size="sm"
                            className="w-full"
                            onClick={() => onRequestExtra(reservation.id, extra)}
                          >
                            {isLateCheckout
                              ? (language === 'en'
                                  ? `Request Late Check-out · ${extra.price} €`
                                  : language === 'fr'
                                  ? `Demander un départ tardif · ${extra.price} €`
                                  : `Solicitar Late Check-out · ${extra.price} €`)
                              : `${t('extras.request_btn')} · ${extra.price} €`}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: GUÍA DE LA CASA (house) */}
        {activeTab === 'house' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <SectionTitle
              icon={Home}
              title={t('guide.title')}
              iconClass="bg-purple-50 text-purple-500"
            />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">
              {t('guide.subtitle')}
            </p>

            <div className="grid grid-cols-1 gap-4">
              {houseClips.map((clip) => (
                <Card key={clip.id} className="p-0 overflow-hidden border-0 shadow-lg">
                  <VideoPlayer
                    url={clip.url}
                    title={clip.title}
                    language={language}
                    onPlay={() => setIsVideoWatched(true)}
                  />
                </Card>
              ))}
              {houseClips.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                  <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    {t('guide.no_clips')}
                  </p>
                </div>
              )}
            </div>

            {/* Guía escrita de electrodomésticos */}
            {property.appliancesGuide && (
              <Card>
                <SectionTitle
                  icon={BookOpen}
                  title={t('guide.appliances_title')}
                  iconClass="bg-purple-50 text-purple-500"
                />
                <p className="text-xs font-bold text-gray-600 leading-relaxed whitespace-pre-line">
                  {property.appliancesGuide}
                </p>
              </Card>
            )}

            {/* Normas de la Casa */}
            {property.houseRules && property.houseRules.length > 0 && (
              <Card>
                <SectionTitle
                  icon={ShieldCheck}
                  title={t('guide.rules_title')}
                  iconClass="bg-primary-ivi-light text-primary-ivi"
                />
                <div className="space-y-2.5">
                  {property.houseRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <span className="w-6 h-6 rounded-lg bg-primary-ivi-light text-primary-ivi font-black text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-gray-700 leading-snug">{rule}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recomendaciones Locales */}
            {property.localRecommendations && property.localRecommendations.length > 0 && (
              <Card>
                <SectionTitle
                  icon={Compass}
                  title={t('guide.neighborhood_title')}
                  iconClass="bg-blue-50 text-blue-500"
                />
                <div className="space-y-2.5">
                  {property.localRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-xs font-bold text-gray-700 leading-snug">{rec}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 5: SALIDA (departure) */}
        {activeTab === 'departure' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Cabecera directa con hora de salida */}
            <div className="bg-orange-50/80 border border-orange-200/80 rounded-[2rem] p-5 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-orange-200 shrink-0">
                  <LogOut size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-800">
                    {language === 'en' ? 'Check-out time' : language === 'fr' ? 'Heure de départ' : 'Hora límite de salida'}
                  </p>
                  <p className="text-xl font-black text-gray-900 tracking-tight mt-0.5">
                    {effectiveMaxCheckout}h
                  </p>
                </div>
              </div>
              {reservation.lateCheckoutApproved && (
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                  ✓ {language === 'en' ? 'Late checkout active' : 'Late checkout'}
                </span>
              )}
            </div>

            {/* Instrucción breve de llaves/salida si el anfitrión la indicó */}
            {property.checkOutInstructions && (
              <div className="bg-white border border-orange-200/70 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Key size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-orange-700">
                    {language === 'en' ? 'Key & Departure Note' : 'Instrucciones para las llaves'}
                  </p>
                  <p className="text-xs font-semibold text-gray-800 leading-snug mt-0.5 whitespace-pre-line">
                    {property.checkOutInstructions}
                  </p>
                </div>
              </div>
            )}

            {/* Checklist directo: Antes de marcharte... */}
            <Card className="border-orange-100">
              <SectionTitle
                icon={CheckCircle2}
                title={t('departure.checklist_title')}
                iconClass="bg-orange-50 text-orange-500"
              />
              <p className="text-xs font-bold text-gray-400 -mt-2 mb-4">
                {language === 'en'
                  ? 'Please check off these items before leaving the accommodation:'
                  : language === 'fr'
                  ? 'Veuillez cocher ces points avant de quitter le logement :'
                  : 'Por favor, marca estas comprobaciones antes de abandonar el alojamiento:'}
              </p>
              <div className="space-y-2.5">
                {departureChecklistItems.map((item) => {
                  const isChecked = checkedItems.includes(item);
                  return (
                    <div
                      key={item}
                      onClick={() => toggleChecklistItem(item)}
                      className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all ${
                        isChecked
                          ? 'bg-orange-50/60 border-orange-200 text-orange-950'
                          : 'bg-gray-50 border-gray-100 text-gray-800 hover:bg-gray-100/80'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 ${
                          isChecked
                            ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && <CheckCircle size={14} />}
                      </div>
                      <span
                        className={`text-sm font-bold transition-all ${
                          isChecked ? 'text-gray-400 line-through' : 'text-gray-800'
                        }`}
                      >
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        <footer className="pt-8 pb-14 text-center space-y-3">
          <div>
            <button
              type="button"
              onClick={() => {
                setIncidentSent(false);
                setIsIncidentModalOpen(true);
              }}
              className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100"
            >
              <AlertCircle size={13} className="text-gray-400" />
              <span>
                {language === 'en'
                  ? 'Report an incident or issue'
                  : language === 'fr'
                  ? 'Signaler un problème'
                  : '¿Algún problema? Reportar incidencia'}
              </span>
            </button>
          </div>

          <div className="w-12 h-1 bg-gray-200 mx-auto rounded-full" />
          {!isWhiteLabel && (
            <div>
              <a
                href="https://turnexo.app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 hover:text-gray-900 text-[11px] font-bold transition shadow-sm"
              >
                <span>Guía creada con <strong>Turnexo</strong></span>
                <span>·</span>
                <span className="text-emerald-700">Crea la tuya 100% gratis</span>
              </a>
            </div>
          )}
          <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            {property.name}
          </p>
        </footer>
      </main>

      {/* Premium Bottom Nav Glass V3 - Identical to IVI ERP */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 z-[90] pointer-events-none">
        <nav className="max-w-md mx-auto h-[5.5rem] bg-white/95 backdrop-blur-3xl rounded-[2.5rem] border-2 border-white shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_10px_rgba(0,0,0,0.05)] flex items-center justify-around px-3 pointer-events-auto overflow-hidden">
          {(
            [
              { id: 'guide', icon: Home, label: t('tabs.home') },
              { id: 'arrival', icon: MapPin, label: t('tabs.arrival') },
              { id: 'extras', icon: PlusCircle, label: t('tabs.extras') },
              { id: 'house', icon: Video, label: t('tabs.guide') },
              { id: 'departure', icon: LogOut, label: t('tabs.departure') },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center gap-1.5 transition-all relative flex-1 py-2 ${
                  isActive ? 'text-primary-ivi' : 'text-gray-500'
                }`}
              >
                {isActive && (
                  <>
                    <div className="absolute -top-6 w-16 h-16 bg-primary-ivi/20 rounded-full blur-2xl" />
                    <div className="absolute inset-x-1 inset-y-[-4px] bg-primary-ivi-light/80 rounded-2xl -z-10" />
                  </>
                )}
                <Icon
                  size={isActive ? 22 : 20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-all duration-300"
                />
                <span
                  className={`text-[10px] font-black uppercase tracking-tight text-center truncate w-full px-0.5 leading-none transition-all duration-300 ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Incident Report Modal (Identical to IVI ERP) */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 italic leading-none">
                    {t('incident_modal.title')}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {t('incident_modal.subtitle')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIncidentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            {incidentSent ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-black italic text-gray-900">
                  {t('incident_modal.success_title')}
                </h4>
                <p className="text-xs font-bold text-gray-500">
                  {t('incident_modal.success_desc')}
                </p>
                <Button
                  variant="primary"
                  className="w-full mt-2"
                  onClick={() => setIsIncidentModalOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                    {t('incident_modal.what_happening')}
                  </label>
                  <input
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    placeholder={t('incident_modal.placeholder_title')}
                    className="w-full h-12 rounded-2xl bg-gray-50 border-2 border-gray-100 px-4 font-bold text-xs focus:border-primary-ivi outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                    {t('incident_modal.details')}
                  </label>
                  <textarea
                    rows={3}
                    value={incidentDetails}
                    onChange={(e) => setIncidentDetails(e.target.value)}
                    placeholder={t('incident_modal.placeholder_details')}
                    className="w-full rounded-2xl bg-gray-50 border-2 border-gray-100 p-4 font-bold text-xs focus:border-primary-ivi outline-none"
                  />
                </div>
                <Button
                  variant="black"
                  className="w-full"
                  disabled={!incidentTitle.trim()}
                  onClick={() => {
                    const summary = incidentDetails.trim()
                      ? `${incidentTitle.trim()} — ${incidentDetails.trim()}`
                      : incidentTitle.trim();
                    onReportGuestIncident?.(property.id, reservation.id, summary);
                    setIncidentTitle('');
                    setIncidentDetails('');
                    setIncidentSent(true);
                  }}
                >
                  {t('incident_modal.submit')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
