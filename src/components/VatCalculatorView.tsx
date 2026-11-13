import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  Copy,
  FileSpreadsheet,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface VatCalculatorViewProps {
  onBackToLanding: () => void;
  onNavigateToApp: () => void;
}

type CalculationMode = 'included' | 'added';

function formatEur(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export default function VatCalculatorView({
  onBackToLanding,
  onNavigateToApp,
}: VatCalculatorViewProps) {
  const [mode, setMode] = useState<CalculationMode>('included');
  const [stayInput, setStayInput] = useState<string>('480');
  const [cleaningInput, setCleaningInput] = useState<string>('60');
  const [nightsInput, setNightsInput] = useState<string>('4');
  const [commissionPctInput, setCommissionPctInput] = useState<string>('15');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Calculadora IVA 10% Alquiler Vacacional (Airbnb y Booking) | Turnexo';
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Calcula gratis el IVA del 10% de tus reservas de Airbnb y Booking para el Modelo 303 desde el 1 de diciembre. Desglose de base imponible, IVA 10% y comisión.'
      );
    }
    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.setAttribute('content', prevDesc);
    };
  }, []);

  const result = useMemo(() => {
    const stay = Math.max(0, Number(stayInput.replace(',', '.')) || 0);
    const cleaning = Math.max(0, Number(cleaningInput.replace(',', '.')) || 0);
    const nights = Math.max(1, Math.round(Number(nightsInput) || 1));
    const commissionPct = Math.min(40, Math.max(0, Number(commissionPctInput.replace(',', '.')) || 0));

    const enteredTotal = Math.round((stay + cleaning) * 100) / 100;
    const base =
      mode === 'included'
        ? Math.round((enteredTotal / 1.1) * 100) / 100
        : enteredTotal;
    const total =
      mode === 'included'
        ? enteredTotal
        : Math.round(enteredTotal * 1.1 * 100) / 100;
    const vat = Math.round((total - base) * 100) / 100;
    const estimatedCommission = Math.round(((total * commissionPct) / 100) * 100) / 100;
    const netBeforeTaxes = Math.round((base - estimatedCommission) * 100) / 100;
    const basePerNight = Math.round((base / nights) * 100) / 100;

    return {
      enteredTotal,
      base,
      vat,
      total,
      nights,
      basePerNight,
      commissionPct,
      estimatedCommission,
      netBeforeTaxes,
    };
  }, [mode, stayInput, cleaningInput, nightsInput, commissionPctInput]);

  const handleCopySummary = async () => {
    const text = [
      'Cálculo IVA 10% Alquiler Vacacional (Turnexo)',
      `Modalidad: ${mode === 'included' ? 'IVA 10% incluido' : 'Más 10% de IVA'}`,
      `Base imponible: ${formatEur(result.base)}`,
      `IVA (10%): ${formatEur(result.vat)}`,
      `Total factura huésped: ${formatEur(result.total)}`,
      `Estancia: ${result.nights} noche(s) · Base/noche: ${formatEur(result.basePerNight)}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#141413] flex flex-col">
      {/* Cabecera */}
      <header className="border-b border-[#D5CFC0] bg-[#F6F4EE]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#57554F] hover:text-[#141413] transition"
            >
              <ArrowLeft size={14} />
              <span>Turnexo</span>
            </button>
            <span className="text-[#D5CFC0]">/</span>
            <span className="text-xs font-mono font-bold text-[#C85A32] uppercase tracking-wider">
              Calculadora IVA 10%
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateToApp}
            className="px-3.5 py-2 bg-[#141413] hover:bg-[#C85A32] text-white text-xs font-mono font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5"
          >
            <span>Facturar CSV Gratis</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* Hero SEO */}
        <section className="space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1F4E3D]/10 border border-[#1F4E3D]/25 text-[#1F4E3D] text-xs font-mono font-bold uppercase tracking-wider">
            <Calculator size={13} />
            Actualizada · Entrada en vigor 1 de diciembre
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141413] leading-tight">
            Calculadora de IVA 10% para Alquiler Vacacional (Airbnb y Booking)
          </h1>
          <p className="text-base text-[#57554F] leading-relaxed">
            Calcula al instante la <strong>base imponible</strong>, el <strong>IVA del 10%</strong> para tu{' '}
            <strong>Modelo 303</strong> y el impacto aproximado de la comisión de la plataforma en cada reserva.
          </p>
        </section>

        {/* Bloque Calculadora + Resultados */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inputs */}
          <div className="lg:col-span-7 bg-white border border-[#D5CFC0] p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#57554F]">
                1. ¿El precio de tu anuncio ya incluye el IVA?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMode('included')}
                  className={`p-3 text-left border transition ${
                    mode === 'included'
                      ? 'border-[#C85A32] bg-[#C85A32]/5 text-[#141413]'
                      : 'border-[#D5CFC0] hover:border-[#141413]/40 text-[#57554F]'
                  }`}
                >
                  <p className="text-xs font-mono font-bold uppercase">
                    IVA 10% incluido (lo habitual)
                  </p>
                  <p className="text-[11px] mt-1 opacity-80">
                    Desglosa el 10% dentro del precio pagado por el huésped (÷ 1,10).
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('added')}
                  className={`p-3 text-left border transition ${
                    mode === 'added'
                      ? 'border-[#C85A32] bg-[#C85A32]/5 text-[#141413]'
                      : 'border-[#D5CFC0] hover:border-[#141413]/40 text-[#57554F]'
                  }`}
                >
                  <p className="text-xs font-mono font-bold uppercase">
                    Añadir +10% IVA aparte
                  </p>
                  <p className="text-[11px] mt-1 opacity-80">
                    Parte de tu importe neto y suma el 10% encima (× 1,10).
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="stay-amount"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-[#57554F] mb-1.5"
                >
                  Importe alojamiento (€)
                </label>
                <input
                  id="stay-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={stayInput}
                  onChange={(e) => setStayInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-base font-mono font-bold text-[#141413] focus:outline-none focus:border-[#C85A32]"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['300', '480', '750', '1200'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setStayInput(preset)}
                      className="px-2 py-0.5 text-[11px] font-mono border border-[#D5CFC0] hover:border-[#141413] text-[#57554F] hover:text-[#141413] transition"
                    >
                      {preset} €
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="cleaning-amount"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-[#57554F] mb-1.5"
                >
                  Limpieza cobrada (€, opcional)
                </label>
                <input
                  id="cleaning-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cleaningInput}
                  onChange={(e) => setCleaningInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-base font-mono font-bold text-[#141413] focus:outline-none focus:border-[#C85A32]"
                />
                <p className="text-[11px] text-[#57554F] mt-1.5">
                  En estancias turísticas, la limpieza facturada al huésped tributa al mismo 10%.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAE5D9]">
              <div>
                <label
                  htmlFor="nights-count"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-[#57554F] mb-1.5"
                >
                  Nº de noches
                </label>
                <input
                  id="nights-count"
                  type="number"
                  min="1"
                  step="1"
                  value={nightsInput}
                  onChange={(e) => setNightsInput(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-sm font-mono font-bold text-[#141413] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label
                  htmlFor="commission-pct"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-[#57554F] mb-1.5"
                >
                  Comisión plataforma (%, aprox.)
                </label>
                <input
                  id="commission-pct"
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={commissionPctInput}
                  onChange={(e) => setCommissionPctInput(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-sm font-mono font-bold text-[#141413] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="lg:col-span-5 bg-[#141413] text-[#F6F4EE] p-6 space-y-5 border border-[#141413]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#C85A32] font-bold">
                Desglose Fiscal · IVA 10%
              </span>
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[11px] font-mono uppercase transition"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div className="space-y-3 border-b border-white/15 pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-white/70">Base imponible (tu ingreso)</span>
                <span className="text-lg font-mono font-bold text-white">
                  {formatEur(result.base)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-white/70">IVA repercutido (10% · Modelo 303)</span>
                <span className="text-xl font-mono font-extrabold text-[#C85A32]">
                  {formatEur(result.vat)}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
                <span className="text-sm font-semibold text-white">Total factura al huésped</span>
                <span className="text-2xl font-mono font-extrabold text-white">
                  {formatEur(result.total)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-white/75">
              <div className="flex items-center justify-between">
                <span>Base media por noche ({result.nights} noches)</span>
                <span className="font-mono font-bold text-white">{formatEur(result.basePerNight)}</span>
              </div>
              {result.commissionPct > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Comisión aprox. plataforma ({result.commissionPct}%)</span>
                    <span className="font-mono text-white/90">
                      - {formatEur(result.estimatedCommission)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-300 font-semibold pt-1">
                    <span>Neto estimado antes de IRPF</span>
                    <span className="font-mono font-bold">{formatEur(result.netBeforeTaxes)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="p-3 bg-white/5 border border-white/10 text-[11px] text-white/75 flex items-start gap-2">
              <Info size={14} className="shrink-0 mt-0.5 text-[#C85A32]" />
              <span>
                La factura se emite por el importe total que paga el huésped, no por el neto que transfiere Airbnb o Booking tras descontar su comisión.
              </span>
            </div>
          </div>
        </section>

        {/* CTA Conversión a Turnexo */}
        <section className="bg-white border-2 border-[#C85A32] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#C85A32]">
              <Sparkles size={13} />
              Ahorra horas cada trimestre
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#141413]">
              ¿Tienes varias reservas en Airbnb o Booking? No hagas las facturas a mano
            </h2>
            <p className="text-sm text-[#57554F]">
              Sube tu archivo CSV de reservas en Turnexo y genera en 1 clic todas las facturas simplificadas u ordinarias con el <strong>IVA del 10%</strong>, más el libro resumen listo para tu asesoría. <strong>Gratis para 1 alojamiento.</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToApp}
            className="shrink-0 px-5 py-3.5 bg-[#C85A32] hover:bg-[#B24D28] text-white text-xs font-mono font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-2"
          >
            <FileSpreadsheet size={16} />
            <span>Empezar Gratis en Turnexo</span>
          </button>
        </section>

        {/* Guía / Preguntas Frecuentes SEO */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-[#141413]">
            Dudas frecuentes sobre el IVA 10% en pisos turísticos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <article className="bg-white border border-[#D5CFC0] p-5 space-y-2">
              <h3 className="font-bold text-sm text-[#141413]">
                ¿Cuándo entra en vigor el IVA del 10% en alquiler vacacional?
              </h3>
              <p className="text-xs text-[#57554F] leading-relaxed">
                El cambio entra en vigor el <strong>1 de diciembre</strong> en Península y Baleares (en Canarias aplica IGIC). Afecta a las estancias turísticas sujetas a tributación de IVA para las que deberás emitir factura y declarar el IVA repercutido en el <strong>Modelo 303</strong>.
              </p>
            </article>

            <article className="bg-white border border-[#D5CFC0] p-5 space-y-2">
              <h3 className="font-bold text-sm text-[#141413]">
                ¿Se calcula el 10% sobre lo que me ingresa el banco o sobre el total de la reserva?
              </h3>
              <p className="text-xs text-[#57554F] leading-relaxed">
                Sobre el <strong>importe total cobrado al huésped</strong> (alojamiento + limpieza). La comisión de Airbnb o Booking es un gasto aparte con su propia factura de la plataforma, nunca se resta de la base de tu factura al huésped.
              </p>
            </article>

            <article className="bg-white border border-[#D5CFC0] p-5 space-y-2">
              <h3 className="font-bold text-sm text-[#141413]">
                ¿Cómo saco el IVA si ya tenía el precio cerrado con el huésped?
              </h3>
              <p className="text-xs text-[#57554F] leading-relaxed">
                Divide el precio total entre <strong>1,10</strong> para obtener la base imponible. La diferencia hasta el total es el <strong>IVA del 10%</strong>. Por ejemplo, sobre 550 € con IVA incluido: 500 € de base y 50 € de IVA.
              </p>
            </article>

            <article className="bg-white border border-[#D5CFC0] p-5 space-y-2">
              <h3 className="font-bold text-sm text-[#141413]">
                ¿Qué necesita mi gestoría cada trimestre para el Modelo 303?
              </h3>
              <p className="text-xs text-[#57554F] leading-relaxed">
                Necesita el listado correlativo de facturas emitidas (fecha, nº de serie, base imponible, cuota de IVA al 10% y total). Turnexo exporta ese libro de IVA en 1 clic directamente desde tu CSV de Airbnb o Booking.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#D5CFC0] py-6 px-4 text-center text-xs text-[#57554F] font-mono">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#1F4E3D]" />
            Turnexo · Herramienta orientativa para anfitriones en España
          </span>
          <button
            type="button"
            onClick={onBackToLanding}
            className="underline hover:text-[#141413] transition"
          >
            Volver a Turnexo.app
          </button>
        </div>
      </footer>
    </div>
  );
}
