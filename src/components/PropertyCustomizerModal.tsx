import React, { useState } from 'react';
import {
  Clock,
  Video,
  Sparkles,
  BookOpen,
  CheckSquare,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  Home,
  ShieldCheck,
  MapPin,
  Wifi,
  Key,
  DollarSign,
  Camera,
  RotateCcw,
  Check,
  Compass,
} from 'lucide-react';
import {
  Cleaner,
  Property,
  PropertyExtra,
  PropertyVideo,
  PropertyCleaningItem,
  DEFAULT_IVI_CHECKLIST,
  normalizeCleaningChecklist,
} from '../lib/icalParser';

const DEFAULT_DEPARTURE_CHECKLIST = [
  'Apagar luces y climatización',
  'Tirar la basura en los contenedores',
  'Dejar las llaves en el cajetín o sobre la mesa',
  'Cerrar bien las ventanas y la puerta principal',
];

interface Props {
  property: Property;
  cleaners?: Cleaner[];
  language?: 'es' | 'en';
  onSave: (updated: Property) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

type EditorTab = 'general' | 'guide' | 'services';

const CLEANING_CATEGORIES = ['Cocina', 'Salón', 'Dormitorio', 'Baño', 'Extras', 'General'];

const CHECKOUT_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'
];

const CHECKIN_HOURS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '19:00', '20:00'
];

const LATE_CHECKOUT_HOURS = [
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function PropertyCustomizerModal({
  property,
  cleaners = [],
  language = 'es',
  onSave,
  onDelete,
  onClose,
}: Props) {
  const isEn = language === 'en';
  const [draft, setDraft] = useState<Property>(() => {
    const p: Property = JSON.parse(JSON.stringify(property));
    const extras: PropertyExtra[] = p.extras || [];
    const lateExtIdx = extras.findIndex(
      (e) => e.onlyWhenFreeNextDay || e.id === 'ext-late' || /late/i.test(e.title)
    );
    if (lateExtIdx >= 0) {
      extras[lateExtIdx] = {
        ...extras[lateExtIdx],
        onlyWhenFreeNextDay: true,
        price: extras[lateExtIdx].price || p.lateCheckoutPrice || 35,
        title: extras[lateExtIdx].title || `Late Check-out hasta las ${p.lateCheckoutUntil || '17:00'}h`,
        description: isEn
          ? 'Requested by guest from guide, subject to host confirmation in dashboard.'
          : 'El huésped lo solicita desde la guía y tú decides si confirmarlo en tu panel.',
      };
      // Eliminar duplicados si hubiera más de un extra de late checkout
      p.extras = extras.filter(
        (e, idx) => idx === lateExtIdx || (!e.onlyWhenFreeNextDay && !/late\s*check/i.test(e.title))
      );
    } else if (p.lateCheckoutPrice !== 0) {
      extras.unshift({
        id: `ext-late-${p.id}`,
        title: `Late Check-out hasta las ${p.lateCheckoutUntil || '17:00'}h`,
        description: isEn
          ? 'Requested by guest from guide, subject to host confirmation in dashboard.'
          : 'El huésped lo solicita desde la guía y tú decides si confirmarlo en tu panel.',
        price: p.lateCheckoutPrice || 35,
        priceUnit: 'reserva',
        icon: 'clock',
        onlyWhenFreeNextDay: true,
        active: true,
      });
      p.extras = extras;
    } else {
      p.extras = extras;
    }
    p.customChecklist = normalizeCleaningChecklist(p.customChecklist);
    p.departureChecklist =
      p.departureChecklist && p.departureChecklist.length > 0
        ? p.departureChecklist
        : [...DEFAULT_DEPARTURE_CHECKLIST];
    return p;
  });
  const [tab, setTab] = useState<EditorTab>('general');

  // Campos temporales para añadir vídeos, extras, normas, recomendaciones y checklist
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState<PropertyVideo['category']>('checkin');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const [newDepartureItem, setNewDepartureItem] = useState('');
  const [newExtraTitle, setNewExtraTitle] = useState('');
  const [newExtraDesc, setNewExtraDesc] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState(25);
  const [newExtraUnit, setNewExtraUnit] = useState<PropertyExtra['priceUnit']>('reserva');

  const [newRule, setNewRule] = useState('');
  const [newRec, setNewRec] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [newCheckCategory, setNewCheckCategory] = useState('Cocina');
  const [newCheckPhotoRequired, setNewCheckPhotoRequired] = useState(false);
  const [checklistCategoryFilter, setChecklistCategoryFilter] = useState<string>('all');

  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const newItem: PropertyCleaningItem = {
      id: `chk-${Date.now()}`,
      category: newCheckCategory || 'General',
      item: newCheckItem.trim(),
      photoRequired: newCheckPhotoRequired,
    };
    setDraft({
      ...draft,
      customChecklist: [...(draft.customChecklist || []), newItem],
    });
    setNewCheckItem('');
    setNewCheckPhotoRequired(false);
  };

  const toggleCheckPhotoRequired = (itemId: string) => {
    setDraft({
      ...draft,
      customChecklist: (draft.customChecklist || []).map((it) =>
        it.id === itemId ? { ...it, photoRequired: !it.photoRequired } : it
      ),
    });
  };

  const resetToIviChecklist = () => {
    if (
      window.confirm(
        isEn
          ? 'Reset all cleaning tasks to official IVI ERP standard (36 tasks with required photos)?'
          : '¿Restablecer todo el checklist a las 36 tareas estándar de la ERP de IVI con sus fotos obligatorias?'
      )
    ) {
      setDraft({
        ...draft,
        customChecklist: JSON.parse(JSON.stringify(DEFAULT_IVI_CHECKLIST)),
      });
    }
  };

  const addVideo = () => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;
    setDraft({
      ...draft,
      videos: [
        ...(draft.videos || []),
        {
          id: `vid-${Date.now()}`,
          title: newVideoTitle.trim(),
          category: newVideoCategory,
          url: newVideoUrl.trim(),
        },
      ],
    });
    setNewVideoTitle('');
    setNewVideoUrl('');
  };

  const addExtra = () => {
    if (!newExtraTitle.trim()) return;
    const isLate = /late|salida\s*tarde/i.test(newExtraTitle);
    const newExt: PropertyExtra = {
      id: `ext-${Date.now()}`,
      title: newExtraTitle.trim(),
      description:
        newExtraDesc.trim() ||
        (isLate
          ? (isEn
              ? 'Requested by guest from guide, subject to host confirmation in dashboard.'
              : 'El huésped lo solicita desde la guía y tú decides si confirmarlo en tu panel.')
          : (isEn ? 'Requested via digital guide' : 'Solicitado desde la guía')),
      price: newExtraPrice,
      priceUnit: newExtraUnit,
      icon: isLate ? 'clock' : 'sparkles',
      onlyWhenFreeNextDay: isLate,
      active: true,
    };
    setDraft({
      ...draft,
      ...(isLate ? { lateCheckoutPrice: newExtraPrice } : {}),
      extras: [...(draft.extras || []), newExt],
    });
    setNewExtraTitle('');
    setNewExtraDesc('');
  };

  const addDepartureItem = () => {
    if (!newDepartureItem.trim()) return;
    setDraft({
      ...draft,
      departureChecklist: [...(draft.departureChecklist || []), newDepartureItem.trim()],
    });
    setNewDepartureItem('');
  };

  const removeDepartureItem = (index: number) => {
    setDraft({
      ...draft,
      departureChecklist: (draft.departureChecklist || []).filter((_, idx) => idx !== index),
    });
  };

  const resetDepartureChecklist = () => {
    setDraft({
      ...draft,
      departureChecklist: [...DEFAULT_DEPARTURE_CHECKLIST],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-5 my-6 max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 shrink-0">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-orange-600">
              {isEn ? 'Property Settings' : 'Personalizar Alojamiento'}
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">{draft.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2.5 py-1"
          >
            ✕
          </button>
        </div>

        {/* 3 Pestañas Claras y Unificadas (Cero desorden) */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          {[
            { id: 'general' as const, label: isEn ? '1. Access & Setup' : '1. Datos y Acceso', icon: Home },
            { id: 'guide' as const, label: isEn ? `2. Guest Guide (${draft.videos?.length || 0})` : `2. Guía Huésped (${draft.videos?.length || 0})`, icon: BookOpen },
            { id: 'services' as const, label: isEn ? '3. Extras & Cleaning' : '3. Extras y Limpieza', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon size={14} className={active ? 'text-orange-400' : 'text-slate-500'} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-5 text-xs">
          {/* PESTAÑA 1: DATOS CLAVE, HORARIOS, ICAL Y ACCESO */}
          {tab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Property Name' : 'Nombre del Alojamiento'}</label>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Host WhatsApp (Direct Contact)' : 'WhatsApp Anfitrión (Contacto directo)'}</label>
                  <input
                    value={draft.hostWhatsapp}
                    onChange={(e) => setDraft({ ...draft, hostWhatsapp: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Address' : 'Dirección Completa'}</label>
                  <input
                    value={draft.address}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Google Maps Link' : 'URL Google Maps'}</label>
                  <input
                    value={draft.googleMapsUrl}
                    onChange={(e) => setDraft({ ...draft, googleMapsUrl: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* ENLACE PRIVADO Y SEGURIDAD ANTI-COLISIÓN */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    {isEn ? 'Private Guide URL & Anti-Collision Security' : 'Enlace Privado de la Guía y Seguridad Anti-Colisión'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const randSuffix = Math.random().toString(36).substring(2, 7);
                      const baseName = (draft.name || 'alojamiento')
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                      setDraft({ ...draft, slug: `${baseName}-${randSuffix}` });
                    }}
                    className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition shadow-2xs"
                    title={isEn ? 'Generate new secure unique token' : 'Regenerar enlace único seguro'}
                  >
                    <RotateCcw size={11} />
                    {isEn ? 'Regenerate secure link' : 'Regenerar enlace seguro'}
                  </button>
                </div>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                  <span className="text-slate-400 font-mono text-xs select-none">https://turnexo.app/g/</span>
                  <input
                    value={draft.slug}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''),
                      })
                    }
                    className="flex-1 font-mono font-bold text-slate-900 text-xs focus:outline-none px-1"
                    placeholder="vistamarina-7k4e"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {isEn
                    ? 'Unique identifier so nobody on the internet can guess your apartment access codes or collide with properties of the same name.'
                    : 'Identificador único seguro para evitar que nadie en internet pueda adivinar tus códigos de acceso ni colisionar con alojamientos que tengan el mismo nombre.'}
                </p>
              </div>

              {/* Horarios y Personal */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  {isEn ? 'Schedule & Staff' : 'Horarios y Personal'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Check-in Hour' : 'Hora Check-in'}</label>
                    <select
                      value={draft.checkInTime || '15:00'}
                      onChange={(e) => setDraft({ ...draft, checkInTime: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-bold text-slate-800"
                    >
                      {CHECKIN_HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Check-out Hour' : 'Hora Check-out'}</label>
                    <select
                      value={draft.checkOutTime || '11:00'}
                      onChange={(e) => setDraft({ ...draft, checkOutTime: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-bold text-slate-800"
                    >
                      {CHECKOUT_HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Assigned Cleaner' : 'Limpiadora Asignada'}</label>
                    <select
                      value={draft.defaultCleanerId}
                      onChange={(e) => setDraft({ ...draft, defaultCleanerId: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-bold text-slate-800"
                    >
                      {cleaners.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isEn ? 'Pay per turn (€)' : 'Pago limpieza (€)'} <span className="font-normal text-[10px] text-slate-400">({isEn ? 'Optional' : 'Opcional'})</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={draft.cleaningFee === 0 ? '' : draft.cleaningFee}
                      onChange={(e) => setDraft({ ...draft, cleaningFee: e.target.value === '' ? 0 : Number(e.target.value) })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Calendarios iCal */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                    {isEn ? 'Calendar Sync (iCal)' : 'Sincronización de Calendarios (iCal)'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isEn ? 'Optional · Fill only the platforms you use' : 'Opcional · Rellena solo las que uses'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      {isEn ? 'Airbnb iCal URL (.ics)' : 'URL iCal Airbnb (.ics)'} <span className="font-normal text-[10px] text-slate-400">({isEn ? 'Optional' : 'Opcional'})</span>
                    </label>
                    <input
                      value={draft.airbnbIcalUrl || ''}
                      onChange={(e) => setDraft({ ...draft, airbnbIcalUrl: e.target.value })}
                      placeholder="https://www.airbnb.es/calendar/ical/..."
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      {isEn ? 'Booking iCal URL (.ics)' : 'URL iCal Booking (.ics)'} <span className="font-normal text-[10px] text-slate-400">({isEn ? 'Optional' : 'Opcional'})</span>
                    </label>
                    <input
                      value={draft.bookingIcalUrl || ''}
                      onChange={(e) => setDraft({ ...draft, bookingIcalUrl: e.target.value })}
                      placeholder="https://ical.booking.com/v1/export..."
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Acceso: WiFi y Códigos */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  {isEn ? 'Access Codes & WiFi (Guest View)' : 'Códigos de Acceso y WiFi del Alojamiento'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isEn ? 'WiFi Name (SSID)' : 'Nombre WiFi (SSID)'}</label>
                    <input
                      value={draft.wifiSsid}
                      onChange={(e) => setDraft({ ...draft, wifiSsid: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isEn ? 'WiFi Password' : 'Clave WiFi'}</label>
                    <input
                      value={draft.wifiPassword}
                      onChange={(e) => setDraft({ ...draft, wifiPassword: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Door / Keybox Code' : 'Código Buzón / Puerta'}</label>
                    <input
                      value={draft.doorCode}
                      onChange={(e) => setDraft({ ...draft, doorCode: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Intercom Code' : 'Código Portero'}</label>
                    <input
                      value={draft.intercomCode || ''}
                      placeholder={isEn ? 'e.g. 4B + Bell' : 'Ej. 4ºA + Campana'}
                      onChange={(e) => setDraft({ ...draft, intercomCode: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: GUÍA DIGITAL COMPLETA DEL HUÉSPED (TODO EN UNO) */}
          {tab === 'guide' && (
            <div className="space-y-4">
              {/* Instrucciones de Entrada y Salida */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  {isEn ? 'Arrival & Departure Instructions' : 'Instrucciones de Llegada y Salida'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isEn ? 'Check-in Instructions (Arrival Tab)' : 'Instrucciones de Entrada (Pestaña Llegada)'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={isEn ? 'e.g. The keybox is on the right side of the main door...' : 'Ej. El cajetín de llaves está junto a la puerta principal...'}
                      value={draft.checkInInstructions}
                      onChange={(e) => setDraft({ ...draft, checkInInstructions: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isEn ? 'Check-out Instructions (Departure Tab)' : 'Instrucciones de Salida (Pestaña Salida)'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={isEn ? 'e.g. Leave keys on table, turn off AC and close windows...' : 'Ej. Dejar llaves sobre la mesa, apagar el aire y tirar la basura...'}
                      value={draft.checkOutInstructions || ''}
                      onChange={(e) => setDraft({ ...draft, checkOutInstructions: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                  <input
                    type="checkbox"
                    checked={draft.requireVideoToUnlockCodes !== false}
                    onChange={(e) => setDraft({ ...draft, requireVideoToUnlockCodes: e.target.checked })}
                    className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">
                      {isEn ? 'Unlock door codes after watching check-in video' : 'Desbloquear códigos de acceso tras ver el vídeo de entrada'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {isEn ? 'Blurs door codes on the mobile screen until the guest hits play.' : 'Difumina el código en el móvil del huésped hasta que reproduzca el vídeo explicativo.'}
                    </p>
                  </div>
                </label>
              </div>

              {/* CHECKLIST DE SALIDA DEL HUÉSPED («Antes de marcharte...») */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckSquare size={14} className="text-orange-600" />
                    {isEn ? 'Guest Departure Checklist ("Before you leave...")' : 'Checklist de Salida del Huésped («Antes de marcharte...»)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold bg-orange-100 text-orange-900 px-2 py-0.5 rounded-full">
                      {draft.departureChecklist?.length || 0} {isEn ? 'tasks' : 'tareas'}
                    </span>
                    <button
                      type="button"
                      onClick={resetDepartureChecklist}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1 transition shadow-2xs"
                      title={isEn ? 'Reset standard departure checklist' : 'Restablecer tareas estándar'}
                    >
                      <RotateCcw size={10} />
                      {isEn ? 'Reset' : 'Restablecer'}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  {isEn
                    ? 'Checklist items shown to guests in the "Departure" tab of their digital guide before leaving.'
                    : 'Tareas que el huésped ve y marca en la pestaña «Salida» de la guía digital antes de abandonar el alojamiento.'}
                </p>

                <div className="space-y-1.5">
                  {(draft.departureChecklist || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border border-slate-200/90 hover:border-slate-300 px-3 py-2 rounded-xl transition shadow-2xs"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                        <CheckSquare size={13} className="text-orange-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 break-words">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDepartureItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition shrink-0"
                        title={isEn ? 'Remove task' : 'Eliminar tarea'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {(!draft.departureChecklist || draft.departureChecklist.length === 0) && (
                    <p className="text-slate-400 text-xs italic py-1">
                      {isEn
                        ? 'No departure tasks configured. Add one below or click Reset.'
                        : 'No hay tareas de salida configuradas. Añade una abajo o pulsa Restablecer:'}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    placeholder={
                      isEn
                        ? 'New departure task (e.g. Leave keys in lockbox, take out trash...)'
                        : 'Nueva tarea de salida (ej. Dejar llaves en cajetín, apagar aire...)'
                    }
                    value={newDepartureItem}
                    onChange={(e) => setNewDepartureItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDepartureItem();
                      }
                    }}
                    className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addDepartureItem}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-1.5 rounded-xl text-xs shrink-0 transition"
                  >
                    + {isEn ? 'Add' : 'Añadir'}
                  </button>
                </div>
              </div>

              {/* Vídeos Explicativos (Entrada, Electrodomésticos y Bienvenida) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                    {isEn ? `Videos in Digital Guide (${draft.videos?.length || 0})` : `Vídeos de la Guía Digital (${draft.videos?.length || 0})`}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isEn ? 'YouTube, Shorts, TikTok or Drive' : 'YouTube, Shorts o Google Drive'}
                  </span>
                </div>

                <div className="space-y-2">
                  {(draft.videos || []).map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-2.5"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase text-orange-600 block">
                          {v.category === 'checkin'
                            ? (isEn ? 'ARRIVAL & KEYS' : 'LLEGADA / ACCESO Y LLAVES')
                            : v.category === 'appliance'
                            ? (isEn ? 'HOUSE & APPLIANCES' : 'CASA / ELECTRODOMÉSTICOS')
                            : (isEn ? 'HOME TOUR' : 'HOME TOUR BIENVENIDA')}
                        </span>
                        <p className="font-bold text-slate-900 truncate">{v.title}</p>
                        <p className="text-[11px] font-mono text-slate-400 truncate max-w-sm">{v.url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            videos: draft.videos.filter((item) => item.id !== v.id),
                          })
                        }
                        className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition shrink-0"
                        title={isEn ? 'Delete video' : 'Eliminar vídeo'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {(draft.videos || []).length === 0 && (
                    <p className="text-slate-400 text-xs italic py-1">
                      {isEn ? 'No videos added yet.' : 'No has añadido vídeos aún. Añade uno abajo para sorprender al huésped:'}
                    </p>
                  )}
                </div>

                {/* Formulario rápido para añadir vídeo */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                  <p className="font-bold text-slate-800 text-xs">{isEn ? 'Add video to guide' : 'Añadir nuevo vídeo a la guía'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      placeholder={isEn ? 'Title (e.g. How to enter / AC Remote)' : 'Título (ej. Cómo entrar / Mando Aire)'}
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="sm:col-span-2 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                    />
                    <select
                      value={newVideoCategory}
                      onChange={(e) => setNewVideoCategory(e.target.value as PropertyVideo['category'])}
                      className="border border-slate-200 rounded-xl px-2 py-1.5 font-bold text-xs bg-white"
                    >
                      <option value="checkin">{isEn ? 'Arrival (Keys & Access)' : 'Llegada (Acceso / Llaves)'}</option>
                      <option value="appliance">{isEn ? 'House (Appliances / Usage)' : 'Casa (Electrodomésticos)'}</option>
                      <option value="hometour">{isEn ? 'Home Tour (Welcome)' : 'Home Tour (Bienvenida)'}</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={addVideo}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shrink-0"
                    >
                      <Plus size={13} /> {isEn ? 'Add' : 'Añadir'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Guía escrita de Electrodomésticos y Normas */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  {isEn ? 'House Guide & Rules' : 'Manual de la Casa y Normas'}
                </span>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isEn ? 'Written Guide for Appliances (AC, Water Heater, Stovetop)' : 'Instrucciones de Electrodomésticos (Aire, Vitro, Lavadora, Termo...)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isEn ? 'e.g. AC works with white remote at 23°C. Stovetop requires holding lock key 3 seconds...' : 'Ej. El aire se enciende con el mando blanco; la vitrocerámica tiene bloqueo manteniendo 3s...'}
                    value={draft.appliancesGuide || ''}
                    onChange={(e) => setDraft({ ...draft, appliancesGuide: e.target.value })}
                    className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <label className="block font-bold text-slate-700">
                    {isEn ? 'House Rules' : 'Normas de la Casa'}
                  </label>
                  <div className="space-y-1.5">
                    {draft.houseRules.map((rule, i) => (
                      <div key={i} className="flex items-center justify-between bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                        <span>• {rule}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              houseRules: draft.houseRules.filter((_, idx) => idx !== i),
                            })
                          }
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      placeholder={isEn ? 'New rule (e.g. No smoking inside)' : 'Nueva norma (ej. No fumar en el interior)'}
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newRule.trim()) return;
                        setDraft({ ...draft, houseRules: [...draft.houseRules, newRule.trim()] });
                        setNewRule('');
                      }}
                      className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                    >
                      + {isEn ? 'Add' : 'Añadir'}
                    </button>
                  </div>
                </div>
              </div>

              {/* SECCIÓN INDEPENDIENTE: RECOMENDACIONES DE LA ZONA */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Compass size={14} className="text-blue-600" />
                    {isEn ? 'Neighborhood & Local Recommendations' : 'Recomendaciones de la Zona (Restaurantes, Ocio, Supermercados)'}
                  </span>
                  <span className="text-[10px] font-extrabold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                    {draft.localRecommendations?.length || 0} {isEn ? 'places' : 'lugares'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isEn
                    ? 'Suggestions shown to guests in their guide (favorite tapas, pharmacies, beaches, transport).'
                    : 'Tus sitios recomendados para que el huésped disfrute de la estancia (restaurantes, farmacias 24h, playas, transporte).'}
                </p>

                <div className="space-y-1.5">
                  {(draft.localRecommendations || []).map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white border border-slate-200/90 hover:border-slate-300 px-3 py-2 rounded-xl transition shadow-2xs"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                        <span className="text-blue-500 shrink-0">📍</span>
                        <span className="text-xs font-semibold text-slate-800 break-words">{rec}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            localRecommendations: draft.localRecommendations.filter((_, idx) => idx !== i),
                          })
                        }
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition shrink-0"
                        title={isEn ? 'Remove recommendation' : 'Eliminar recomendación'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {(draft.localRecommendations || []).length === 0 && (
                    <p className="text-slate-400 text-xs italic py-1">
                      {isEn ? 'No recommendations added yet.' : 'No has añadido recomendaciones aún. Añade una abajo:'}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    placeholder={isEn ? 'e.g. Chiringuito El Ancla (150m): best seafood and paella' : 'Ej. Chiringuito El Ancla (a 150m): el mejor espeto y arroz'}
                    value={newRec}
                    onChange={(e) => setNewRec(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!newRec.trim()) return;
                        setDraft({
                          ...draft,
                          localRecommendations: [...(draft.localRecommendations || []), newRec.trim()],
                        });
                        setNewRec('');
                      }
                    }}
                    className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newRec.trim()) return;
                      setDraft({
                        ...draft,
                        localRecommendations: [...(draft.localRecommendations || []), newRec.trim()],
                      });
                      setNewRec('');
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-1.5 rounded-xl text-xs shrink-0 transition"
                  >
                    + {isEn ? 'Add' : 'Añadir'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: TODOS LOS EXTRAS (LATE CHECK-OUT + UPSELL) Y CHECKLIST LIMPIEZA */}
          {tab === 'services' && (
            <div className="space-y-4">
              {/* Catálogo Unificado de Extras y Servicios de Pago */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                      {isEn ? 'Extras & Services for Guests' : 'Extras y Servicios para Huéspedes'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isEn ? 'All items guests can order through their digital guide.' : 'Todo lo que el huésped puede contratar desde su Guía Digital.'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-100/60 px-2 py-0.5 rounded-full">
                    {draft.extras?.filter((e) => e.active).length || 0} {isEn ? 'active' : 'activos'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(draft.extras || []).map((ext) => {
                    const isLateCheckout = Boolean(
                      ext.onlyWhenFreeNextDay || ext.id === 'ext-late' || /late/i.test(ext.title)
                    );

                    return (
                      <div
                        key={ext.id}
                        className={`rounded-2xl p-3 border transition ${
                          isLateCheckout
                            ? 'bg-amber-50/50 border-amber-200/80 shadow-2xs'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={ext.active}
                              onChange={(e) => {
                                const newActive = e.target.checked;
                                setDraft({
                                  ...draft,
                                  extras: draft.extras.map((item) =>
                                    item.id === ext.id ? { ...item, active: newActive } : item
                                  ),
                                });
                              }}
                              className="mt-1 h-4 w-4 rounded text-orange-600 focus:ring-orange-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs">{ext.title}</span>
                                {isLateCheckout && (
                                  <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <span>⚡ {isEn ? 'On Request (Host Confirmation)' : 'Bajo Petición (Confirmación del Anfitrión)'}</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {isLateCheckout
                                  ? (isEn
                                      ? 'Requested by guest from guide, subject to host confirmation in dashboard.'
                                      : 'El huésped lo solicita desde la guía digital y tú decides si confirmarlo en tu panel.')
                                  : ext.description}
                              </p>

                              {/* Parámetros específicos para Late Check-out */}
                              {isLateCheckout && (
                                <div className="mt-2.5 flex items-center gap-3 flex-wrap text-xs pt-2 border-t border-amber-200/60">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-600 font-medium">{isEn ? 'Max checkout hour:' : 'Salida hasta las:'}</span>
                                    <select
                                      value={draft.lateCheckoutUntil || '17:00'}
                                      onChange={(e) => {
                                        const newHour = e.target.value;
                                        setDraft({
                                          ...draft,
                                          lateCheckoutUntil: newHour,
                                          extras: draft.extras.map((item) =>
                                            item.id === ext.id
                                              ? { ...item, title: `Late Check-out hasta las ${newHour}h` }
                                              : item
                                          ),
                                        });
                                      }}
                                      className="border border-amber-300 bg-white rounded-lg px-2 py-1 font-bold text-slate-800 text-xs"
                                    >
                                      {LATE_CHECKOUT_HOURS.map((h) => (
                                        <option key={h} value={h}>{h}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Editor de precio en línea */}
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
                              <input
                                type="number"
                                min="0"
                                value={ext.price}
                                onChange={(e) => {
                                  const newPrice = Number(e.target.value);
                                  setDraft({
                                    ...draft,
                                    ...(isLateCheckout ? { lateCheckoutPrice: newPrice } : {}),
                                    extras: draft.extras.map((item) =>
                                      item.id === ext.id ? { ...item, price: newPrice } : item
                                    ),
                                  });
                                }}
                                className="w-12 font-extrabold text-slate-900 text-right focus:outline-none"
                              />
                              <span className="text-slate-500 font-bold ml-1 text-xs">€</span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setDraft({
                                  ...draft,
                                  ...(isLateCheckout ? { lateCheckoutPrice: 0 } : {}),
                                  extras: draft.extras.filter((item) => item.id !== ext.id),
                                })
                              }
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                              title={isEn ? 'Remove extra' : 'Eliminar extra'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Formulario rápido para añadir cualquier extra */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 mt-2">
                  <p className="font-bold text-slate-800 text-xs">
                    {isEn ? 'Add new extra' : 'Añadir nuevo extra al alojamiento'}
                  </p>
                  <div className="flex gap-2">
                    <input
                      placeholder={isEn ? 'Name (e.g. Private Parking, Baby Cot, Airport Shuttle...)' : 'Nombre (ej. Plaza de Parking, Cuna de Bebé, Traslado...)'}
                      value={newExtraTitle}
                      onChange={(e) => setNewExtraTitle(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                    />
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                      <input
                        type="number"
                        placeholder="25"
                        value={newExtraPrice}
                        onChange={(e) => setNewExtraPrice(Number(e.target.value))}
                        className="w-14 bg-transparent font-bold text-xs text-right focus:outline-none"
                      />
                      <span className="text-slate-500 font-bold ml-1 text-xs">€</span>
                    </div>
                    <button
                      type="button"
                      onClick={addExtra}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shrink-0 shadow-2xs"
                    >
                      <Plus size={13} /> {isEn ? 'Add Extra' : 'Añadir Extra'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Checklist para la Limpiadora con soporte de Foto Obligatoria (IVI ERP) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                        {isEn ? 'Cleaner Task Checklist' : 'Checklist de Limpieza (App Limpiadora)'}
                      </span>
                      <span className="text-[10px] font-extrabold bg-orange-100 text-orange-900 px-2 py-0.5 rounded-full">
                        {draft.customChecklist?.length || 0} {isEn ? 'tasks' : 'tareas'}
                      </span>
                      <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Camera size={10} />
                        {draft.customChecklist?.filter((c) => c.photoRequired).length || 0} {isEn ? 'photos required' : 'con foto obligatoria'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isEn
                        ? 'Protocol configured from IVI ERP. Mark which tasks require a verification photo from the cleaner.'
                        : 'Protocolo basado en la ERP de IVI. Señala qué tareas exigen foto de comprobación a la limpiadora y cuáles no.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetToIviChecklist}
                    className="text-[11px] font-bold text-slate-700 hover:text-orange-600 bg-white border border-slate-200 hover:border-orange-300 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                    title={isEn ? 'Restore default IVI ERP checklist' : 'Restablecer al checklist por defecto de IVI ERP'}
                  >
                    <RotateCcw size={12} />
                    <span>{isEn ? 'Reset IVI ERP Defaults' : 'Restablecer Plantilla IVI ERP'}</span>
                  </button>
                </div>

                {/* Filtro por categorías */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setChecklistCategoryFilter('all')}
                    className={`px-3 py-1 rounded-xl font-bold transition shrink-0 ${
                      checklistCategoryFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isEn ? 'All' : 'Todas'} ({draft.customChecklist?.length || 0})
                  </button>
                  {CLEANING_CATEGORIES.map((cat) => {
                    const count = (draft.customChecklist || []).filter((c) => (c.category || 'General') === cat).length;
                    if (count === 0 && cat === 'General') return null;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setChecklistCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-xl font-bold transition shrink-0 flex items-center gap-1.5 ${
                          checklistCategoryFilter === cat
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] opacity-75 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Lista de tareas */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {(draft.customChecklist || [])
                    .filter(
                      (item) =>
                        checklistCategoryFilter === 'all' ||
                        (item.category || 'General') === checklistCategoryFilter
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 hover:border-slate-300 p-2.5 rounded-xl transition shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
                            {item.category || 'General'}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {item.item}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Botón interactivo para señalar si requiere foto o no */}
                          <button
                            type="button"
                            onClick={() => toggleCheckPhotoRequired(item.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 border ${
                              item.photoRequired
                                ? 'bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200 shadow-2xs'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-700'
                            }`}
                            title={
                              item.photoRequired
                                ? (isEn ? 'Photo required. Click to make optional.' : 'Foto obligatoria. Clic para quitar requerimiento de foto.')
                                : (isEn ? 'Photo optional. Click to make required.' : 'Sin foto. Clic para exigir foto obligatoria a la limpiadora.')
                            }
                          >
                            <Camera size={12} className={item.photoRequired ? 'text-amber-700' : 'text-slate-400'} />
                            <span>{item.photoRequired ? (isEn ? 'Photo Required' : 'Con Foto') : (isEn ? 'No Photo' : 'Sin Foto')}</span>
                          </button>

                          {/* Botón eliminar tarea */}
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                customChecklist: (draft.customChecklist || []).filter((it) => it.id !== item.id),
                              })
                            }
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                            title={isEn ? 'Delete task' : 'Eliminar tarea'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Formulario para añadir nueva tarea personalizada */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 mt-2">
                  <p className="font-bold text-slate-800 text-xs">
                    {isEn ? 'Add new task to checklist' : 'Añadir nueva tarea al checklist'}
                  </p>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                    <select
                      value={newCheckCategory}
                      onChange={(e) => setNewCheckCategory(e.target.value)}
                      className="border border-slate-200 bg-slate-50 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {CLEANING_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    <input
                      placeholder={isEn ? 'Task name (e.g. Check terrace awning or safe)' : 'Nombre de la tarea (ej. Comprobar toldo terraza o caja fuerte)'}
                      value={newCheckItem}
                      onChange={(e) => setNewCheckItem(e.target.value)}
                      className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs"
                    />

                    <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl cursor-pointer select-none text-xs text-slate-700 font-semibold shrink-0">
                      <input
                        type="checkbox"
                        checked={newCheckPhotoRequired}
                        onChange={(e) => setNewCheckPhotoRequired(e.target.checked)}
                        className="rounded text-orange-600 focus:ring-orange-500"
                      />
                      <Camera size={13} className="text-amber-600" />
                      <span>{isEn ? 'Photo' : 'Exigir Foto'}</span>
                    </label>

                    <button
                      type="button"
                      onClick={addCheckItem}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-1.5 rounded-xl text-xs shrink-0 transition"
                    >
                      + {isEn ? 'Add' : 'Añadir'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie de guardado */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 shrink-0">
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(draft.id)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>{isEn ? 'Delete' : 'Eliminar'}</span>
              </button>
            )}
            <a
              href={`/g/${draft.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
            >
              <ExternalLink size={13} />
              <span>{isEn ? 'Live Guest Guide' : 'Ver Guía Huésped en Vivo'}</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="button"
              onClick={() => onSave(draft)}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-6 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Save size={14} />
              {isEn ? 'Save Changes' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
