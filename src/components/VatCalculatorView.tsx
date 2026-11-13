import React, { useEffect, useMemo, useState } from 'react';
import {
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

type CalculatorTab = 'balance' | 'booking';

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
  const [tab, setTab] = useState<CalculatorTab>('balance');

  // Pestaña 1 (Balance real mes): Ingresos vs Gastos con IVA deducible
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState<string>('1000');
  const [portalCommPctInput, setPortalCommPctInput] = useState<string>('16.3');
  const [agencyPctInput, setAgencyPctInput] = useState<string>('20');
  const [monthlyCleaningInput, setMonthlyCleaningInput] = useState<string>('70');
  const [monthlyUtilitiesInput, setMonthlyUtilitiesInput] = useState<string>('155');
  const [otherExpensesInput, setOtherExpensesInput] = useState<string>('0');

  // Pestaña 2: Desglose de una reserva concreta
  const [guestPaidInput, setGuestPaidInput] = useState<string>('500');
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
        'Comprueba gratis si el IVA del 10% te afecta o te sale a devolver al deducir tus gastos (Booking, limpieza, luz, reformas) desde el 1 de diciembre.'
      );
    }
    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.setAttribute('content', prevDesc);
    };
  }, []);

  const balanceCalc = useMemo(() => {
    const grossIncome = Math.max(0, Number(monthlyIncomeInput.replace(',', '.')) || 0);
    const portalPct = Math.min(35, Math.max(0, Number(portalCommPctInput.replace(',', '.')) || 0));
    const agencyPct = Math.min(50, Math.max(0, Number(agencyPctInput.replace(',', '.')) || 0));
    const cleaningBase = Math.max(0, Number(monthlyCleaningInput.replace(',', '.')) || 0);
    const utilitiesBase = Math.max(0, Number(monthlyUtilitiesInput.replace(',', '.')) || 0);
    const otherBase = Math.max(0, Number(otherExpensesInput.replace(',', '.')) || 0);

    const incomeBase = Math.round((grossIncome / 1.1) * 100) / 100;
    const outputVat10 = Math.round((grossIncome - incomeBase) * 100) / 100;

    // Gastos base (sin IVA) + su IVA deducible (21% en comisiones/limpieza/otros, ~18.5% mixto luz/agua/internet)
    const portalBase = Math.round(((grossIncome * portalPct) / 100) * 100) / 100;
    const portalVat = Math.round(portalBase * 0.21 * 100) / 100;

    const agencyBase = Math.round(((grossIncome * agencyPct) / 100) * 100) / 100;
    const agencyVat = Math.round(agencyBase * 0.21 * 100) / 100;

    const cleaningVat = Math.round(cleaningBase * 0.21 * 100) / 100;
    // Suministros: luz/internet al 21% y agua al 10% (aprox. 18,52% combinado como en el ejemplo real)
    const utilitiesVat = Math.round(utilitiesBase * 0.18516 * 100) / 100;
    const otherVat = Math.round(otherBase * 0.21 * 100) / 100;

    const totalExpensesBase =
      Math.round((portalBase + agencyBase + cleaningBase + utilitiesBase + otherBase) * 100) / 100;
    const totalDeductibleVat =
      Math.round((portalVat + agencyVat + cleaningVat + utilitiesVat + otherVat) * 100) / 100;

    // Diferencia en Hacienda (positivo = pagas, negativo = Hacienda te devuelve / compensa)
    const vatBalanceToPay = Math.round((outputVat10 - totalDeductibleVat) * 100) / 100;

    // Antes (sin IVA repercutido: pagabas el IVA de los gastos de tu bolsillo)
    const netBefore =
      Math.round((grossIncome - (totalExpensesBase + totalDeductibleVat)) * 100) / 100;
    // Ahora (con IVA 10%: los gastos se deducen por su base y el IVA se liquida aparte)
    const netAfter = Math.round((incomeBase - totalExpensesBase) * 100) / 100;
    const pocketDiff = Math.round((netAfter - netBefore) * 100) / 100;

    return {
      grossIncome,
      incomeBase,
      outputVat10,
      portalPct,
      portalBase,
      portalVat,
      agencyPct,
      agencyBase,
      agencyVat,
      cleaningBase,
      cleaningVat,
      utilitiesBase,
      utilitiesVat,
      otherBase,
      otherVat,
      totalExpensesBase,
      totalDeductibleVat,
      vatBalanceToPay,
      netBefore,
      netAfter,
      pocketDiff,
    };
  }, [
    monthlyIncomeInput,
    portalCommPctInput,
    agencyPctInput,
    monthlyCleaningInput,
    monthlyUtilitiesInput,
    otherExpensesInput,
  ]);

  const bookingCalc = useMemo(() => {
    const total = Math.max(0, Number(guestPaidInput.replace(',', '.')) || 0);
    const commPct = Math.min(35, Math.max(0, Number(commissionPctInput.replace(',', '.')) || 0));

    const base = Math.round((total / 1.1) * 100) / 100;
    const vat = Math.round((total - base) * 100) / 100;
    const commissionBase = Math.round(((total * commPct) / 100) * 100) / 100;
    const commissionVat = Math.round(commissionBase * 0.21 * 100) / 100;
    const commissionTotal = Math.round((commissionBase + commissionVat) * 100) / 100;
    const netVatToPay = Math.round((vat - commissionVat) * 100) / 100;
    const ownerNet = Math.round((base - commissionBase) * 100) / 100;

    return {
      total,
      commPct,
      base,
      vat,
      commissionBase,
      commissionVat,
      commissionTotal,
      netVatToPay,
      ownerNet,
    };
  }, [guestPaidInput, commissionPctInput]);

  const handleCopySummary = async () => {
    const text =
      tab === 'balance'
        ? [
            `📊 IVA 10% EN VUT: TU CASO REAL (Mes de ${formatEur(balanceCalc.grossIncome)})`,
            '(Sin subir el precio al huésped)',
            '',
            `INGRESO: ${formatEur(balanceCalc.incomeBase)} + ${formatEur(balanceCalc.outputVat10)} IVA (10%)`,
            `TOTAL IVA DEDUCIBLE EN GASTOS: -${formatEur(balanceCalc.totalDeductibleVat)}`,
            balanceCalc.vatBalanceToPay <= 0
              ? `✅ RESULTADO HACIENDA: Te devuelve / compensa ${formatEur(Math.abs(balanceCalc.vatBalanceToPay))}`
              : `📌 RESULTADO HACIENDA: Pagas ${formatEur(balanceCalc.vatBalanceToPay)}`,
            '',
            `💰 EN TU BOLSILLO:`,
            `• Antes (sin IVA): ${formatEur(balanceCalc.netBefore)}`,
            `• Ahora (con IVA 10%): ${formatEur(balanceCalc.netAfter)} (${balanceCalc.pocketDiff >= 0 ? '+' : ''}${formatEur(balanceCalc.pocketDiff)})`,
          ].join('\n')
        : [
            'Resumen reserva con IVA 10% (Turnexo)',
            `Total pagado por huésped: ${formatEur(bookingCalc.total)}`,
            `IVA 10% cobrado: ${formatEur(bookingCalc.vat)}`,
            `Comisión plataforma (${bookingCalc.commPct}% + 21% IVA): -${formatEur(bookingCalc.commissionTotal)} (${formatEur(bookingCalc.commissionBase)} + ${formatEur(bookingCalc.commissionVat)} IVA deducible)`,
            `IVA neto a Hacienda (tras deducir IVA comisión): ${formatEur(bookingCalc.netVatToPay)}`,
            `Base imponible factura: ${formatEur(bookingCalc.base)}`,
            `Limpio para ti (antes de IRPF/gastos): ${formatEur(bookingCalc.ownerNet)}`,
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
      {/* Cabecera completa Turnexo */}
      <header className="border-b border-[#E2DDD2] bg-[#F6F4EE]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToLanding();
            }}
            className="flex items-center gap-2.5 shrink-0 whitespace-nowrap group"
          >
            <div className="w-8 h-8 bg-[#141413] text-[#F6F4EE] flex items-center justify-center font-mono font-extrabold text-xs tracking-tighter group-hover:bg-[#C85A32] transition-colors">
              TX
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#141413]">
              Turnexo<span className="text-[#C85A32]">.</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-[#57554F] whitespace-nowrap">
            <a
              href="/#modulos"
              onClick={(e) => {
                e.preventDefault();
                onBackToLanding();
                setTimeout(() => {
                  window.location.hash = 'modulos';
                }, 50);
              }}
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition"
            >
              Qué incluye
            </a>
            <a
              href="/#comparativa"
              onClick={(e) => {
                e.preventDefault();
                onBackToLanding();
                setTimeout(() => {
                  window.location.hash = 'comparativa';
                }, 50);
              }}
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition"
            >
              Comparativa
            </a>
            <a
              href="/#precios"
              onClick={(e) => {
                e.preventDefault();
                onBackToLanding();
                setTimeout(() => {
                  window.location.hash = 'precios';
                }, 50);
              }}
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition"
            >
              Precios
            </a>
            <a
              href="/#faq"
              onClick={(e) => {
                e.preventDefault();
                onBackToLanding();
                setTimeout(() => {
                  window.location.hash = 'faq';
                }, 50);
              }}
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition"
            >
              Preguntas
            </a>
            <span className="px-3.5 py-2 text-[#C85A32] font-bold bg-[#C85A32]/10">
              Calculadora IVA 10%
            </span>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={onBackToLanding}
              className="lg:hidden px-3 py-2 text-xs font-mono font-bold text-[#57554F] hover:text-[#141413] border border-[#D5CFC0]"
            >
              Ver Web
            </button>
            <button
              type="button"
              onClick={onNavigateToApp}
              className="px-4 py-2.5 bg-[#141413] hover:bg-[#C85A32] text-white text-xs font-mono font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5"
            >
              <span>Empezar Gratis</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Hero claro para propietarios */}
        <section className="space-y-3 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1F4E3D]/10 border border-[#1F4E3D]/25 text-[#1F4E3D] text-xs font-mono font-bold uppercase tracking-wider">
            <Calculator size={13} />
            Nueva norma · 1 de diciembre
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141413] leading-tight">
            ¿Cómo afecta el IVA del 10% a tu piso turístico?
          </h1>
          <p className="text-base text-[#57554F] leading-relaxed">
            Comprueba en 5 segundos <strong>si pagas o te devuelven en Hacienda</strong> al deducir el IVA de tus gastos (Booking, limpieza, luz, reformas) o <strong>a qué precio ajustar tu anuncio</strong>.
          </p>
        </section>

        {/* Selector de 2 preguntas reales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
          <button
            type="button"
            onClick={() => setTab('balance')}
            className={`p-4 text-left border transition flex items-start gap-3 ${
              tab === 'balance'
                ? 'bg-[#141413] text-white border-[#141413]'
                : 'bg-white text-[#141413] border-[#D5CFC0] hover:border-[#141413]'
            }`}
          >
            <Sparkles size={18} className="shrink-0 mt-0.5 text-[#C85A32]" />
            <div>
              <p className="text-sm font-bold">1. ¿Gano o pierdo con mis gastos?</p>
              <p className={`text-xs mt-0.5 ${tab === 'balance' ? 'text-white/75' : 'text-[#57554F]'}`}>
                Compara el IVA 10% cobrado vs el IVA 21% que recuperas de Booking, limpieza y luz.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTab('booking')}
            className={`p-4 text-left border transition flex items-start gap-3 ${
              tab === 'booking'
                ? 'bg-[#141413] text-white border-[#141413]'
                : 'bg-white text-[#141413] border-[#D5CFC0] hover:border-[#141413]'
            }`}
          >
            <Calculator size={18} className="shrink-0 mt-0.5 text-[#C85A32]" />
            <div>
              <p className="text-sm font-bold">2. ¿Cuánto me queda de 1 reserva?</p>
              <p className={`text-xs mt-0.5 ${tab === 'booking' ? 'text-white/75' : 'text-[#57554F]'}`}>
                Mete lo que pagó el huésped y mira cuánto va a IVA, comisión y tu bolsillo.
              </p>
            </div>
          </button>
        </div>

        {/* PESTAÑA 1: BALANCE REAL MES (INGRESOS VS GASTOS DEDUCIBLES) */}
        {tab === 'balance' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 bg-white border border-[#D5CFC0] p-6 space-y-5">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#141413]">
                Tus números de un mes normal
              </h2>

              <div>
                <label
                  htmlFor="monthly-income"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-[#57554F] mb-1"
                >
                  Ingresos brutos del mes (lo que pagan los huéspedes, €)
                </label>
                <input
                  id="monthly-income"
                  type="number"
                  min="0"
                  step="50"
                  value={monthlyIncomeInput}
                  onChange={(e) => setMonthlyIncomeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-lg font-mono font-extrabold text-[#141413] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="pt-3 border-t border-[#EAE5D9] space-y-3">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#1F4E3D]">
                  Gastos con factura (recuperas todo su IVA)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#141413] mb-1">
                      Comisión Airbnb / Booking (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="35"
                      step="0.1"
                      value={portalCommPctInput}
                      onChange={(e) => setPortalCommPctInput(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-sm font-mono font-bold focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#141413] mb-1">
                      Agencia / Gestora (% · 0 si lo llevas tú)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="1"
                      value={agencyPctInput}
                      onChange={(e) => setAgencyPctInput(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-sm font-mono font-bold focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#141413] mb-1">
                      Limpieza del mes (base sin IVA, €)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={monthlyCleaningInput}
                      onChange={(e) => setMonthlyCleaningInput(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-sm font-mono font-bold focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#141413] mb-1">
                      Luz, agua e internet (base sin IVA, €)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={monthlyUtilitiesInput}
                      onChange={(e) => setMonthlyUtilitiesInput(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-sm font-mono font-bold focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">
                    Otros gastos / muebles / aire / reparaciones (base sin IVA, €)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={otherExpensesInput}
                    onChange={(e) => setOtherExpensesInput(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-sm font-mono font-bold focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#141413] text-[#F6F4EE] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C85A32] font-bold">
                  Resultado real (sin subir precio)
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

              <div className="space-y-2 text-xs border-b border-white/15 pb-4">
                <div className="flex justify-between">
                  <span className="text-white/75">IVA 10% cobrado en alquiler ({formatEur(balanceCalc.incomeBase)} base)</span>
                  <span className="font-mono font-bold text-white">+{formatEur(balanceCalc.outputVat10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/75">IVA 21% Booking/Airbnb ({balanceCalc.portalPct}%)</span>
                  <span className="font-mono text-emerald-300">-{formatEur(balanceCalc.portalVat)}</span>
                </div>
                {balanceCalc.agencyPct > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/75">IVA 21% Agencia / Gestora ({balanceCalc.agencyPct}%)</span>
                    <span className="font-mono text-emerald-300">-{formatEur(balanceCalc.agencyVat)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/75">IVA 21% Limpieza</span>
                  <span className="font-mono text-emerald-300">-{formatEur(balanceCalc.cleaningVat)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/75">IVA Luz, agua e internet</span>
                  <span className="font-mono text-emerald-300">-{formatEur(balanceCalc.utilitiesVat)}</span>
                </div>
                {balanceCalc.otherBase > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/75">IVA 21% Otros gastos / mejoras</span>
                    <span className="font-mono text-emerald-300">-{formatEur(balanceCalc.otherVat)}</span>
                  </div>
                )}
              </div>

              <div
                className={`p-4 border ${
                  balanceCalc.vatBalanceToPay <= 0
                    ? 'bg-[#1F4E3D]/40 border-[#1F4E3D]'
                    : 'bg-white/5 border-white/15'
                }`}
              >
                <p className="text-xs text-white/75">Resultado en Hacienda (Modelo 303):</p>
                <p className="text-xl font-mono font-extrabold text-white mt-1">
                  {balanceCalc.vatBalanceToPay <= 0
                    ? `Hacienda te devuelve / compensa ${formatEur(Math.abs(balanceCalc.vatBalanceToPay))}`
                    : `Pagas ${formatEur(balanceCalc.vatBalanceToPay)} de IVA a Hacienda`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-white/5 border border-white/10">
                  <p className="text-[11px] text-white/65">Limpio ANTES (sin IVA)</p>
                  <p className="text-lg font-mono font-bold text-white mt-1">
                    {formatEur(balanceCalc.netBefore)}
                  </p>
                </div>
                <div className="p-3.5 bg-white/5 border border-white/10">
                  <p className="text-[11px] text-white/65">Limpio AHORA (con IVA 10%)</p>
                  <p className="text-lg font-mono font-extrabold text-emerald-300 mt-1">
                    {formatEur(balanceCalc.netAfter)}
                  </p>
                  <p className="text-[11px] font-mono text-emerald-300">
                    ({balanceCalc.pocketDiff >= 0 ? '+' : ''}
                    {formatEur(balanceCalc.pocketDiff)}/mes)
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-white/65 flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5 text-[#C85A32]" />
                <span>
                  Al entrar en régimen de IVA, también podrás deducirte el 21% de IVA en muebles, aire acondicionado, reformas o menaje del piso.
                </span>
              </p>
            </div>
          </section>
        )}

        {/* PESTAÑA 1: DESGLOSE RESERVA */}
        {tab === 'booking' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 bg-white border border-[#D5CFC0] p-6 space-y-6">
              <div>
                <label
                  htmlFor="guest-paid"
                  className="block text-sm font-bold text-[#141413] mb-1"
                >
                  ¿Cuánto pagó el huésped en total por la reserva?
                </label>
                <p className="text-xs text-[#57554F] mb-3">
                  Incluye noches + limpieza (el precio total de la reserva en Airbnb o Booking, antes de que te descuenten su comisión).
                </p>
                <div className="relative">
                  <input
                    id="guest-paid"
                    type="number"
                    min="0"
                    step="1"
                    value={guestPaidInput}
                    onChange={(e) => setGuestPaidInput(e.target.value)}
                    className="w-full px-4 py-3 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-xl font-mono font-extrabold text-[#141413] focus:outline-none focus:border-[#C85A32]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold text-[#57554F]">
                    €
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE5D9]">
                <label
                  htmlFor="platform-comm"
                  className="block text-sm font-bold text-[#141413] mb-1"
                >
                  Comisión de la plataforma (% · 0 si es reserva directa)
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="platform-comm"
                    type="number"
                    min="0"
                    max="35"
                    step="0.1"
                    value={commissionPctInput}
                    onChange={(e) => setCommissionPctInput(e.target.value)}
                    className="w-28 px-3 py-2 border border-[#D5CFC0] bg-[#F6F4EE]/50 text-sm font-mono font-bold text-[#141413] focus:outline-none focus:border-[#C85A32]"
                  />
                  <span className="text-xs font-mono text-[#57554F]">%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#141413] text-[#F6F4EE] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C85A32] font-bold">
                  Así se reparte ese dinero
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-white/5 border border-white/10">
                  <p className="text-[11px] text-white/65">IVA neto Hacienda</p>
                  <p className="text-xl font-mono font-extrabold text-[#C85A32] mt-1">
                    {formatEur(bookingCalc.netVatToPay)}
                  </p>
                  <p className="text-[10px] text-white/55 mt-1">
                    {formatEur(bookingCalc.vat)} − {formatEur(bookingCalc.commissionVat)} IVA com.
                  </p>
                </div>
                <div className="p-3.5 bg-white/5 border border-white/10">
                  <p className="text-[11px] text-white/65">Comisión + 21% IVA</p>
                  <p className="text-xl font-mono font-bold text-white/90 mt-1">
                    - {formatEur(bookingCalc.commissionTotal)}
                  </p>
                  <p className="text-[10px] text-white/55 mt-1">
                    {formatEur(bookingCalc.commissionBase)} + {formatEur(bookingCalc.commissionVat)} IVA
                  </p>
                </div>
                <div className="p-3.5 bg-[#1F4E3D]/40 border border-[#1F4E3D]">
                  <p className="text-[11px] text-emerald-200">Limpio para ti*</p>
                  <p className="text-xl font-mono font-extrabold text-emerald-300 mt-1">
                    {formatEur(bookingCalc.ownerNet)}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 text-xs text-white/80 space-y-1">
                <p className="font-semibold text-white">Dato para tu factura / gestoría:</p>
                <p>
                  Base imponible: <strong className="font-mono">{formatEur(bookingCalc.base)}</strong> + IVA 10%:{' '}
                  <strong className="font-mono">{formatEur(bookingCalc.vat)}</strong> = Total{' '}
                  <strong className="font-mono">{formatEur(bookingCalc.total)}</strong>
                </p>
              </div>

              <p className="text-[11px] text-white/60 flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5 text-[#C85A32]" />
                <span>
                  *Antes de tus gastos (limpieza, luz, agua) y de tu IRPF anual. Recuerda que el IVA se calcula sobre el total que pagó el huésped, no sobre lo que te transfirió el portal.
                </span>
              </p>
            </div>
          </section>
        )}

        {/* Guía práctica paso a paso */}
        <section className="bg-white border border-[#D5CFC0] p-6 sm:p-8 space-y-5">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1F4E3D]">
              Checklist práctico · 1 de diciembre
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#141413] mt-1">
              Qué tienes que hacer paso a paso como propietario
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[#F6F4EE]/60 border border-[#EAE5D9] space-y-1.5">
              <p className="font-mono font-bold text-[#C85A32]">1. Alta en IVA (Modelo 036)</p>
              <p className="text-[#57554F] leading-relaxed">
                Avisa a tu gestoría para darte de alta en el régimen de IVA en Hacienda antes del 1 de diciembre (en Canarias aplica IGIC).
              </p>
            </div>
            <div className="p-4 bg-[#F6F4EE]/60 border border-[#EAE5D9] space-y-1.5">
              <p className="font-mono font-bold text-[#C85A32]">2. Pide facturas de TODO con tu NIF</p>
              <p className="text-[#57554F] leading-relaxed">
                Booking/Airbnb, gestora, limpieza, luz, agua, internet, muebles o aire acondicionado: ahora <strong>te deduces todo su IVA (21%)</strong>.
              </p>
            </div>
            <div className="p-4 bg-[#F6F4EE]/60 border border-[#EAE5D9] space-y-1.5">
              <p className="font-mono font-bold text-[#C85A32]">3. Decide si ajustas precios</p>
              <p className="text-[#57554F] leading-relaxed">
                Usa la pestaña 1 arriba: si tienes bastantes gastos deducibles, muchas veces no te hace falta subir el precio al huésped.
              </p>
            </div>
            <div className="p-4 bg-[#F6F4EE]/60 border border-[#EAE5D9] space-y-1.5">
              <p className="font-mono font-bold text-[#C85A32]">4. Emite factura al 10% por estancia</p>
              <p className="text-[#57554F] leading-relaxed">
                Aunque el huésped no te la pida, debes emitir factura (simplificada o completa si te piden NIF) por el total pagado (Turnexo te las genera todas desde tu CSV).
              </p>
            </div>
            <div className="p-4 bg-[#F6F4EE]/60 border border-[#EAE5D9] space-y-1.5 md:col-span-2 lg:col-span-2">
              <p className="font-mono font-bold text-[#C85A32]">5. Presentación trimestral (Modelo 303)</p>
              <p className="text-[#57554F] leading-relaxed">
                Cada trimestre entregas a tu asesoría tus facturas emitidas (IVA 10%) y tus facturas de gastos (IVA 21%). Si el IVA de tus gastos supera al IVA cobrado, te queda saldo a favor (se compensa en siguientes trimestres o Hacienda te lo devuelve en el 4º trimestre).
              </p>
            </div>
          </div>
        </section>

        {/* CTA Conversión a Turnexo */}
        <section className="bg-white border-2 border-[#C85A32] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#C85A32]">
              <Sparkles size={13} />
              ¿Ya tienes reservas? No lo calcules una a una
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#141413]">
              Sube tu CSV de Airbnb o Booking y saca todas tus facturas al 10% en 1 clic
            </h2>
            <p className="text-sm text-[#57554F]">
              Turnexo lee tus reservas, desglosa automáticamente el <strong>IVA del 10%</strong> de cada estancia y te descarga el resumen listo para tu asesoría (Modelo 303). <strong>Gratis para 1 alojamiento.</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToApp}
            className="shrink-0 px-5 py-3.5 bg-[#C85A32] hover:bg-[#B24D28] text-white text-xs font-mono font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-2"
          >
            <FileSpreadsheet size={16} />
            <span>Probar Gratis en Turnexo</span>
          </button>
        </section>

        {/* Guía / Preguntas Frecuentes SEO */}
        <section className="space-y-5">
          <h2 className="text-2xl font-extrabold text-[#141413]">
            Preguntas rápidas sobre el IVA del 10% en pisos turísticos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <article className="bg-white border border-[#D5CFC0] p-5 space-y-2">
              <h3 className="font-bold text-sm text-[#141413]">
                ¿Cuándo entra en vigor el IVA del 10% en alquiler vacacional?
              </h3>
              <p className="text-xs text-[#57554F] leading-relaxed">
                El <strong>1 de diciembre</strong> en Península y Baleares (en Canarias aplica IGIC). A partir de esa fecha tendrás que emitir factura con IVA al 10% por las estancias turísticas sujetas y declararlo en el <strong>Modelo 303</strong>.
              </p>
            </article>

            <article className="bg-white border border-[#D5CFC0] p-5 space-y-2">
              <h3 className="font-bold text-sm text-[#141413]">
                ¿El 10% se aplica sobre lo que me ingresa Airbnb/Booking en el banco?
              </h3>
              <p className="text-xs text-[#57554F] leading-relaxed">
                No. Se aplica sobre el <strong>total que paga el huésped</strong> (alojamiento + limpieza). La comisión que te cobra el portal es un gasto aparte con su propia factura.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#D5CFC0] py-6 px-4 text-center text-xs text-[#57554F] font-mono">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#1F4E3D]" />
            Turnexo · Cálculo orientativo para propietarios en España
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
