import React, { useState } from 'react';
import { ShieldCheck, X, FileText, Check, AlertCircle } from 'lucide-react';
import { Property, Reservation } from '../lib/icalParser';
import {
  calculateBreakdown,
  generateNextInvoiceNumber,
  HostFiscalProfile,
  Invoice,
} from '../lib/invoice';

interface Props {
  properties: Property[];
  reservations: Reservation[];
  existingInvoices: Invoice[];
  fiscalProfile: HostFiscalProfile;
  initialReservationId?: string;
  onSaveInvoice: (invoice: Invoice) => void;
  onClose: () => void;
}

export default function CreateInvoiceModal({
  properties,
  reservations,
  existingInvoices,
  fiscalProfile,
  initialReservationId,
  onSaveInvoice,
  onClose,
}: Props) {
  const defaultRes =
    reservations.find((r) => r.id === initialReservationId) || reservations[0];

  const [selectedResId, setSelectedResId] = useState<string>(defaultRes?.id || '');
  const selectedRes = reservations.find((r) => r.id === selectedResId) || defaultRes;
  const selectedProp = properties.find((p) => p.id === selectedRes?.propertyId);

  // Calcular noches por defecto
  const nights = React.useMemo(() => {
    if (!selectedRes) return 1;
    const start = new Date(selectedRes.checkIn);
    const end = new Date(selectedRes.checkOut);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff || 1);
  }, [selectedRes]);

  const [isSimplified, setIsSimplified] = useState(true);
  const [totalAmount, setTotalAmount] = useState<number>(300);
  const [guestName, setGuestName] = useState(selectedRes?.guestName || 'Huésped Particular');
  const [guestFiscalId, setGuestFiscalId] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Actualizar al cambiar reserva
  React.useEffect(() => {
    if (selectedRes) {
      setGuestName(selectedRes.guestName);
    }
  }, [selectedRes]);

  const breakdown = React.useMemo(() => {
    return calculateBreakdown(totalAmount, 10, 0);
  }, [totalAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes || !selectedProp) return;

    const { number, series } = generateNextInvoiceNumber(existingInvoices, isSimplified);

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: number,
      series,
      issueDate: new Date().toISOString().split('T')[0],
      reservationId: selectedRes.id,
      propertyId: selectedProp.id,
      propertyName: selectedProp.name,
      stayStartDate: selectedRes.checkIn,
      stayEndDate: selectedRes.checkOut,
      nights,
      guestName,
      guestEmail: guestEmail.trim() || undefined,
      guestFiscalId: isSimplified ? (guestFiscalId.trim() || undefined) : guestFiscalId.trim(),
      guestAddress: isSimplified ? (guestAddress.trim() || undefined) : guestAddress.trim(),
      isSimplified,
      hostName: fiscalProfile.fullNameOrCompany,
      hostFiscalId: fiscalProfile.nifCif,
      hostAddress: fiscalProfile.fiscalAddress,
      hostPostalCode: fiscalProfile.postalCode,
      hostCity: fiscalProfile.city,
      concept: `Alojamiento turístico (${nights} ${nights === 1 ? 'noche' : 'noches'} · IVA 10%)`,
      totalAmount: breakdown.totalAmount,
      vatRate: 10,
      baseAmount: breakdown.baseAmount,
      vatAmount: breakdown.vatAmount,
      status: 'issued',
    };

    onSaveInvoice(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} />
              IVA del 10% Obligatorio
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Emitir Factura a Huésped
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Genera tu factura legal en 1 clic lista para Hacienda y tu gestoría.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Selector de Reserva */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Reserva asociada (del calendario iCal)
            </label>
            <select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {reservations.map((r) => {
                const prop = properties.find((p) => p.id === r.propertyId);
                return (
                  <option key={r.id} value={r.id}>
                    {r.guestName} · {prop?.name} ({r.checkIn} → {r.checkOut})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Selector Tipo de Factura: Simplificada o Completa */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="block font-bold text-slate-700">Tipo de Factura</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsSimplified(true)}
                className={`py-2 px-3 rounded-xl font-bold text-center border transition ${
                  isSimplified
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Simplificada (&lt; 3.000 €)
                <span className="block text-[10px] opacity-80 font-normal">Sin NIF obligatorio</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSimplified(false)}
                className={`py-2 px-3 rounded-xl font-bold text-center border transition ${
                  !isSimplified
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Factura Completa
                <span className="block text-[10px] opacity-80 font-normal">Empresas / Autónomos</span>
              </button>
            </div>
            {isSimplified && (
              <p className="text-[11px] text-emerald-800 font-medium">
                ✓ Válida legalmente para particulares según el R.D. 1619/2012 (Art. 4.2.f). No necesitas pedir DNI ni dirección.
              </p>
            )}
          </div>

          {/* Importe Total de la reserva */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Importe total cobrado al huésped (€ IVA incluido)
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max="50000"
              value={totalAmount}
              onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Desglose en tiempo real */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Base Imponible:</span>
              <span className="font-mono font-bold text-slate-900">{breakdown.baseAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cuota IVA (10%):</span>
              <span className="font-mono font-bold text-indigo-700">+{breakdown.vatAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-indigo-200 text-sm">
              <span>Total Facturado:</span>
              <span className="font-mono">{breakdown.totalAmount.toFixed(2)} €</span>
            </div>
          </div>

          {/* Datos del huésped */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre del huésped</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
                required
              />
            </div>

            {!isSimplified && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIF / CIF / Pasaporte de la empresa o huésped *
                  </label>
                  <input
                    type="text"
                    value={guestFiscalId}
                    onChange={(e) => setGuestFiscalId(e.target.value)}
                    placeholder="Ej. B-88776655 o 12345678A"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required={!isSimplified}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dirección fiscal del cliente *
                  </label>
                  <input
                    type="text"
                    value={guestAddress}
                    onChange={(e) => setGuestAddress(e.target.value)}
                    placeholder="Calle, número, código postal y ciudad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required={!isSimplified}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email para enviar la factura (opcional)
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="ejemplo@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-lg flex items-center gap-1.5"
            >
              <FileText size={15} />
              Emitir Factura Ahora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
