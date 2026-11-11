import React, { useState } from 'react';
import { Check, Sparkles, ShieldCheck, Zap, QrCode, Users, FileText } from 'lucide-react';

export default function SaaSPricingModal({ onClose }: { onClose: () => void }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      name: 'Plan Starter',
      priceMonthly: '0 €',
      priceYearly: '0 €',
      periodMonthly: '/mes · Plan gratuito',
      periodYearly: '/año · Plan gratuito',
      subtitle: 'Para 1 Alojamiento Turístico',
      badge: 'Plan Gratuito',
      savings: '100% gratis para siempre',
      icon: QrCode,
      features: [
        '1 Alojamiento turístico conectado',
        'Guía Digital del Huésped (Vídeo Home Tour, check-in y electrodomésticos en vídeo)',
        'Envío por link en WhatsApp/Airbnb antes de que llegue el huésped',
        'Sincronización iCal automática con Airbnb y Booking',
        'App de Limpiadora con checklist y fotos de comprobación (sin contraseñas)',
        'Fotos de limpieza guardadas durante 7 días',
        'Con sello sutil "Creado con Turnexo"',
      ],
      highlighted: false,
      ctaText: 'Empezar Gratis sin Tarjeta',
    },
    {
      name: 'Plan Pro Fiscal',
      priceMonthly: '19 €',
      priceYearly: '15 €',
      periodMonthly: '/mes tarifa plana',
      periodYearly: '/mes (180 € al año)',
      subtitle: 'Hasta 5 Alojamientos (~3€/alojamiento)',
      badge: '⭐ El más elegido · IVA 10%',
      savings: 'Ahorras 48 € al año (2 meses gratis)',
      icon: FileText,
      features: [
        'Hasta 5 alojamientos turísticos',
        'Emisión ilimitada de Facturas Simplificadas y Ordinarias',
        'Cálculo automático de IVA 10% para alquiler vacacional',
        'Libro de IVA y exportación en 1 clic para tu gestoría (Modelo 303)',
        'Guías Digitales 100% personalizadas SIN marca Turnexo',
        'Histórico fotográfico de comprobación de limpieza ilimitado',
        'Alertas de rotación el mismo día y limpiezas por WhatsApp en 1 toque',
      ],
      highlighted: true,
      ctaText: 'Activar Plan Pro Fiscal',
    },
    {
      name: 'Plan Microgestora',
      priceMonthly: '39 €',
      priceYearly: '31 €',
      periodMonthly: '/mes tarifa plana',
      periodYearly: '/mes (372 € al año)',
      subtitle: 'Hasta 10 Alojamientos (~3,10€/alojamiento)',
      badge: 'Microgestores',
      savings: 'Ahorras 96 € al año (2 meses gratis)',
      icon: Users,
      features: [
        'Hasta 10 alojamientos turísticos incluidos',
        'Todo lo del Plan Pro Fiscal ilimitado',
        'Multi-serie de facturación por propietario / NIF',
        'Liquidación automática a personal de limpieza en CSV',
        'Despacho masivo de limpiezas por WhatsApp',
        'Soporte directo prioritario',
      ],
      highlighted: false,
      ctaText: 'Activar Plan Microgestora',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck size={14} />
              Adaptado a la nueva normativa de IVA 10% para estancias turísticas
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Planes simples para propietarios particulares y pequeñas gestoras
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Empieza 100% gratis con 1 alojamiento. Activa el Plan Pro cuando necesites facturar legalmente con IVA 10% o gestionar varios alojamientos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2.5 py-1.5 rounded-lg"
          >
            Cerrar ✕
          </button>
        </div>

        {/* SELECTOR FACTURACIÓN MENSUAL / ANUAL */}
        <div className="flex items-center justify-center gap-3">
          <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pago Mensual
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pago Anual</span>
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-black">
                -20%
              </span>
            </button>
          </div>
          {billingCycle === 'yearly' && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              🎁 2 meses gratis incluidos
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const Icon = p.icon;
            const isYearly = billingCycle === 'yearly';
            const price = isYearly ? p.priceYearly : p.priceMonthly;
            const period = isYearly ? p.periodYearly : p.periodMonthly;
            const showCrossedOut = isYearly && p.priceYearly !== p.priceMonthly;

            return (
              <div
                key={p.name}
                className={`rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                  p.highlighted
                    ? 'bg-slate-900 text-white border-emerald-500 shadow-2xl ring-2 ring-emerald-500/20 scale-[1.02]'
                    : 'bg-slate-50 text-slate-900 border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Icon size={16} className={p.highlighted ? 'text-emerald-400' : 'text-indigo-600'} />
                      {p.name}
                    </span>
                    {p.badge && (
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          p.highlighted
                            ? 'bg-emerald-500 text-slate-950 font-extrabold'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      {showCrossedOut && (
                        <span className={`text-xl font-bold line-through ${p.highlighted ? 'text-slate-500' : 'text-slate-400'}`}>
                          {p.priceMonthly}
                        </span>
                      )}
                      <span className="text-4xl font-black">{price}</span>
                      <span className={`text-xs ${p.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                        {period}
                      </span>
                    </div>
                    {isYearly && (
                      <p className={`text-[11px] font-bold mt-1 ${p.highlighted ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        ✓ {p.savings}
                      </p>
                    )}
                    <p
                      className={`text-xs font-semibold mt-1 ${
                        p.highlighted ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {p.subtitle}
                    </p>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {p.features.map((f, i) => (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <Check
                          size={15}
                          className={`shrink-0 mt-0.5 ${
                            p.highlighted ? 'text-emerald-400' : 'text-emerald-600'
                          }`}
                        />
                        <span className={p.highlighted ? 'text-slate-200' : 'text-slate-700'}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className={`mt-6 w-full py-3 rounded-2xl text-xs font-black transition ${
                    p.highlighted
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {p.ctaText}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950">
          <span className="flex items-center gap-2 font-semibold">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            Sin permanencia ni configuraciones complejas. Emite facturas simplificadas legales al instante y exporta tu resumen para el Modelo 303 de Hacienda con 1 clic.
          </span>
        </div>
      </div>
    </div>
  );
}
