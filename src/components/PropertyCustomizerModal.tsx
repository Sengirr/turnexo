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
} from 'lucide-react';
import { Cleaner, Property, PropertyExtra, PropertyVideo } from '../lib/icalParser';

interface Props {
  property: Property;
  cleaners?: Cleaner[];
  language?: 'es' | 'en';
  onSave: (updated: Property) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

type EditorTab = 'general' | 'guide' | 'services';

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
  const [draft, setDraft] = useState<Property>(() => JSON.parse(JSON.stringify(property)));
  const [tab, setTab] = useState<EditorTab>('general');

  // Campos temporales para añadir vídeos, extras, normas, recomendaciones y checklist
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState<PropertyVideo['category']>('checkin');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const [newExtraTitle, setNewExtraTitle] = useState('');
  const [newExtraDesc, setNewExtraDesc] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState(25);
  const [newExtraUnit, setNewExtraUnit] = useState<PropertyExtra['priceUnit']>('reserva');

  const [newRule, setNewRule] = useState('');
  const [newRec, setNewRec] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');

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
    setDraft({
      ...draft,
      extras: [
        ...(draft.extras || []),
        {
          id: `ext-${Date.now()}`,
          title: newExtraTitle.trim(),
          description: newExtraDesc.trim() || (isEn ? 'Requested via digital guide' : 'Solicitado desde la guía'),
          price: newExtraPrice,
          priceUnit: newExtraUnit,
          icon: 'sparkles',
          active: true,
        },
      ],
    });
    setNewExtraTitle('');
    setNewExtraDesc('');
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
                    {isEn ? 'Leave empty for manual mode' : 'Deja vacío si gestionas reservas manualmente'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">URL iCal Airbnb (.ics)</label>
                    <input
                      value={draft.airbnbIcalUrl || ''}
                      onChange={(e) => setDraft({ ...draft, airbnbIcalUrl: e.target.value })}
                      placeholder="https://www.airbnb.es/calendar/ical/..."
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">URL iCal Booking (.ics)</label>
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

                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <label className="block font-bold text-slate-700">
                    {isEn ? 'Local Recommendations (Restaurants, Supermarket)' : 'Recomendaciones de la Zona (Restaurantes, Supermercado)'}
                  </label>
                  <div className="space-y-1.5">
                    {draft.localRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-center justify-between bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                        <span>📍 {rec}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              localRecommendations: draft.localRecommendations.filter((_, idx) => idx !== i),
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
                      placeholder={isEn ? 'e.g. Supermarket Dia 100m away' : 'Ej. Supermercado Día a 100m hacia la derecha'}
                      value={newRec}
                      onChange={(e) => setNewRec(e.target.value)}
                      className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newRec.trim()) return;
                        setDraft({
                          ...draft,
                          localRecommendations: [...draft.localRecommendations, newRec.trim()],
                        });
                        setNewRec('');
                      }}
                      className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                    >
                      + {isEn ? 'Add' : 'Añadir'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: EXTRAS, LATE CHECK-OUT Y CHECKLIST LIMPIEZA */}
          {tab === 'services' && (
            <div className="space-y-4">
              {/* Late Check-out Configuración */}
              <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      {isEn ? 'Late Check-out Upsell' : 'Venta de Late Check-out (Salida por la tarde)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isEn ? 'Offered in digital guide only when no guest is checking in the same day.' : 'Se ofrece en la guía solo si el día de salida no entra otra reserva en el iCal.'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isEn ? 'Latest Allowed Check-out' : 'Hora máxima permitida'}
                    </label>
                    <select
                      value={draft.lateCheckoutUntil || '17:00'}
                      onChange={(e) => setDraft({ ...draft, lateCheckoutUntil: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-bold text-slate-800"
                    >
                      {LATE_CHECKOUT_HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isEn ? 'Price (€)' : 'Precio que pagará el huésped (€)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={draft.lateCheckoutPrice || 35}
                      onChange={(e) => setDraft({ ...draft, lateCheckoutPrice: Number(e.target.value) })}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Otros Extras / Servicios */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  {isEn ? 'Other Extras & Paid Services' : 'Otros Extras y Servicios de Pago'}
                </span>

                <div className="space-y-2">
                  {(draft.extras || []).map((ext) => (
                    <div
                      key={ext.id}
                      className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={ext.active}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              extras: draft.extras.map((item) =>
                                item.id === ext.id ? { ...item, active: e.target.checked } : item
                              ),
                            })
                          }
                          className="h-4 w-4 rounded text-orange-600"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">
                            {ext.title} — <span className="text-emerald-700 font-extrabold">{ext.price} €</span>
                          </p>
                          <p className="text-[11px] text-slate-500">{ext.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            extras: draft.extras.filter((item) => item.id !== ext.id),
                          })
                        }
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                  <p className="font-bold text-slate-800 text-xs">{isEn ? 'Add extra (Parking, Baby cot...)' : 'Añadir extra (Parking, Cuna, Traslado...)'}</p>
                  <div className="flex gap-2">
                    <input
                      placeholder={isEn ? 'Name (e.g. Covered Parking Space)' : 'Nombre (ej. Plaza de Parking)'}
                      value={newExtraTitle}
                      onChange={(e) => setNewExtraTitle(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="€"
                      value={newExtraPrice}
                      onChange={(e) => setNewExtraPrice(Number(e.target.value))}
                      className="w-20 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={addExtra}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs shrink-0"
                    >
                      + {isEn ? 'Add' : 'Añadir'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Checklist para la Limpiadora */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                    {isEn ? 'Cleaner Task Checklist' : 'Checklist de Limpieza (App Limpiadora)'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isEn ? 'Tasks shown on cleaner mobile magic link' : 'Tareas que marca la limpiadora desde su enlace móvil'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {(draft.customChecklist || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-xl">
                      <span className="font-medium text-slate-800">☑️ {item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            customChecklist: draft.customChecklist.filter((_, idx) => idx !== i),
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
                    placeholder={isEn ? 'New cleaning task (e.g. Check terrace windows)' : 'Nueva tarea (ej. Comprobar termo eléctrico o limpiar terraza)'}
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCheckItem.trim()) return;
                      setDraft({
                        ...draft,
                        customChecklist: [...(draft.customChecklist || []), newCheckItem.trim()],
                      });
                      setNewCheckItem('');
                    }}
                    className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-xl text-xs shrink-0"
                  >
                    + {isEn ? 'Add' : 'Añadir'}
                  </button>
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
