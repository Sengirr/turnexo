import React, { useState } from 'react';
import { Zap, X, CheckCircle2, ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import { Property, Reservation } from '../lib/icalParser';
import {
  calculateBreakdown,
  generateNextInvoiceNumber,
  HostFiscalProfile,
  Invoice,
  SIMPLIFIED_INVOICE_MAX_AMOUNT,
} from '../lib/invoice';

interface Props {
  reservations: Reservation[];
  properties: Property[];
  existingInvoices: Invoice[];
  fiscalProfile: HostFiscalProfile;
  onGenerate: (invoices: Invoice[]) => void;
  onClose: () => void;
}

export default function AutoGenerateInvoicesModal({
  reservations,
  properties,
  existingInvoices,
  fiscalProfile,
  onGenerate,
  onClose,
}: Props) {
  // Encontrar reservas que aún no tienen factura emitida
  const invoicedResIds = new Set(existingInvoices.map((inv) => inv.reservationId));
  const pendingReservations = reservations.filter((r) => !invoicedResIds.has(r.id));

  const [avgPricePerNight, setAvgPricePerNight] = useState<number>(95);
  const [selectedQuarter, setSelectedQuarter] = useState<'all' | '1T' | '2T' | '3T' | '4T'>('all');

  const calculateNights = (checkIn: string, checkOut: string) => {
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff || 1);
    } catch {
      return 1;
    }
  };

  const getQuarter = (dateStr: string) => {
    const month = parseInt(dateStr.split('-')[1] || '1', 10);
    if (month <= 3) return '1T';
    if (month <= 6) return '2T';
    if (month <= 9) return '3T';
    return '4T';
  };

  const filteredReservations = pendingReservations.filter((r) => {
    if (selectedQuarter === 'all') return true;
    return getQuarter(r.checkIn) === selectedQuarter;
  });

  const handleGenerate = () => {
    if (filteredReservations.length === 0) return;

    let invoicePool = [...existingInvoices];
    const generated: Invoice[] = [];

    for (const res of filteredReservations) {
      const prop = properties.find((p) => p.id === res.propertyId);
      const nights = calculateNights(res.checkIn, res.checkOut);
      const totalAmount = Math.round(nights * avgPricePerNight * 100) / 100;
      const isSimplified = totalAmount <= SIMPLIFIED_INVOICE_MAX_AMOUNT;
      const { number, series } = generateNextInvoiceNumber(invoicePool, isSimplified);
      const breakdown = calculateBreakdown(totalAmount, fiscalProfile.defaultVatRate || 10, 0);

      const newInv: Invoice = {
        id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        invoiceNumber: number,
        series,
        issueDate: res.checkOut || new Date().toISOString().split('T')[0],
        reservationId: res.id,
        propertyId: prop?.id || res.propertyId,
        propertyName: prop?.name || 'Alojamiento turístico',
        stayStartDate: res.checkIn,
        stayEndDate: res.checkOut,
        nights,
        guestName: res.guestName || (isSimplified ? 'Huésped Particular' : 'Cliente'),
        isSimplified,
        hostName: fiscalProfile.fullNameOrCompany,
        hostFiscalId: fiscalProfile.nifCif,
        hostAddress: fiscalProfile.fiscalAddress,
        hostPostalCode: fiscalProfile.postalCode,
        hostCity: fiscalProfile.city,
        concept: `Alojamiento turístico (${nights} ${nights === 1 ? 'noche' : 'noches'} · IVA 10%)`,
        totalAmount: breakdown.totalAmount,
        vatRate: fiscalProfile.defaultVatRate || 10,
        baseAmount: breakdown.baseAmount,
        vatAmount: breakdown.vatAmount,
        status: 'issued',
      };

      generated.push(newInv);
      invoicePool = [newInv, ...invoicePool];
    }

    onGenerate(generated);
    onClose();
  };

  const totalCalculated = filteredReservations.reduce((sum, r) => {
    const nights = calculateNights(r.checkIn, r.checkOut);
    return sum + nights * avgPricePerNight;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                <Sparkles size={12} />
                Sincronización con iCal
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Auto-generar Facturas desde Calendario
              </h2>
              <p className="text-xs text-slate-500">
                Convierte tus reservas sincronizadas de Airbnb o Booking en facturas oficiales con IVA del 10%.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Ajustes de generación */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Filtro por Trimestre
              </label>
              <select
                value={selectedQuarter}
                onChange={(e: any) => setSelectedQuarter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
              >
                <option value="all">Todas las pendientes ({pendingReservations.length})</option>
                <option value="1T">1er Trimestre (Ene - Mar)</option>
                <option value="2T">2º Trimestre (Abr - Jun)</option>
                <option value="3T">3er Trimestre (Jul - Sep)</option>
                <option value="4T">4º Trimestre (Oct - Dic)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tarifa media aprox. (€ / noche)
              </label>
              <input
                type="number"
                min="10"
                step="5"
                value={avgPricePerNight}
                onChange={(e) => setAvgPricePerNight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-extrabold text-slate-900"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Reservas encontradas sin facturar:</span>
              <span className="font-bold text-slate-900">{filteredReservations.length} reservas</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Régimen impositivo:</span>
              <span className="font-bold text-slate-900">IVA 10% obligatorio VUT</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Criterio legal de tipo:</span>
              <span className="font-bold text-emerald-700">≤ 400 € Simplificada / &gt; 400 € Completa</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-black text-slate-900 text-sm">
              <span>Total facturación calculada:</span>
              <span className="font-mono text-emerald-700">{totalCalculated.toFixed(2)} €</span>
            </div>
          </div>

          {filteredReservations.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-center">
              No hay reservas pendientes de facturar para el filtro seleccionado.
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">
              ✓ Se generarán facturas correlativas oficiales (serie <strong>{fiscalProfile.simplifiedSeriesPrefix}</strong> y <strong>{fiscalProfile.completeSeriesPrefix}</strong>) listas para descargar en el Libro Registro del Modelo 303.
            </p>
          )}
        </div>

        {/* Botonera de Acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={filteredReservations.length === 0}
            onClick={handleGenerate}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-md transition flex items-center gap-2"
          >
            <Zap size={16} />
            <span>Generar {filteredReservations.length} Facturas Ahora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
