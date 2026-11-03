import React from 'react';
import { Wifi, KeyRound, Printer, Sparkles, Clock } from 'lucide-react';
import { Property } from '../lib/icalParser';

interface Props {
  property: Property;
  onClose: () => void;
}

export default function PrintableQrPosterModal({ property, onClose }: Props) {
  const guideUrl = `${window.location.origin}/g/${property.slug}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(
    guideUrl
  )}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 my-8">
        {/* Barra no imprimible */}
        <div className="flex items-center justify-between print:hidden border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Cartel QR para el Salón / Recibidor
            </h3>
            <p className="text-xs text-slate-500">
              Imprímelo o guárdalo en PDF y déjalo en el apartamento.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Printer size={14} />
              Imprimir / Guardar PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Diseño del Cartel Imprimible */}
        <div className="border-2 border-slate-900 rounded-3xl p-7 text-center space-y-5 bg-white">
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-indigo-600">
              BIENVENIDO · WELCOME · BIENVENUE
            </p>
            <h1 className="text-2xl font-black text-slate-900">{property.name}</h1>
            <p className="text-xs text-slate-500">{property.address}</p>
          </div>

          <div className="flex justify-center">
            <div className="p-3 bg-white border-2 border-slate-200 rounded-3xl shadow-sm inline-block">
              <img
                src={qrImageUrl}
                alt={`QR Guía ${property.name}`}
                className="w-48 h-48 mx-auto rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-black text-slate-900 flex items-center justify-center gap-1.5">
              <Sparkles size={15} className="text-indigo-600" />
              Escanea con la cámara de tu móvil
            </p>
            <p className="text-xs text-slate-500">
              Guía del apartamento en tu idioma · Asistente IA 24/7 · Recomendaciones · Late Check-out
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1">
                <Wifi size={14} />
                <span>WiFi Gratis</span>
              </div>
              <p className="text-[11px] text-slate-500">Red: <strong className="text-slate-900">{property.wifiSsid}</strong></p>
              <p className="text-[11px] text-slate-500">Clave: <strong className="text-slate-900 font-mono">{property.wifiPassword}</strong></p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-1">
                <Clock size={14} />
                <span>Salida & Late Check-out</span>
              </div>
              <p className="text-[11px] text-slate-500">Check-out: <strong className="text-slate-900">{property.checkOutTime} h</strong></p>
              <p className="text-[11px] text-slate-500">Hasta {property.lateCheckoutUntil}h: <strong className="text-slate-900">consulta el QR</strong></p>
            </div>
          </div>

          <p className="text-[10px] font-mono text-slate-400 pt-1">{guideUrl}</p>
        </div>
      </div>
    </div>
  );
}
