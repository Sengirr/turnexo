import React, { useState } from 'react';
import { X, CheckCircle2, User, FileText, MapPin, Mail, ShieldCheck } from 'lucide-react';
import { Invoice, SIMPLIFIED_INVOICE_MAX_AMOUNT } from '../lib/invoice';

interface Props {
  invoice: Invoice;
  onSave: (updatedInvoice: Invoice) => void;
  onClose: () => void;
}

export default function EditInvoiceGuestModal({ invoice, onSave, onClose }: Props) {
  const [guestName, setGuestName] = useState(invoice.guestName || '');
  const [guestFiscalId, setGuestFiscalId] = useState(invoice.guestFiscalId || '');
  const [guestAddress, setGuestAddress] = useState(invoice.guestAddress || '');
  const [guestEmail, setGuestEmail] = useState(invoice.guestEmail || '');
  const [isSimplified, setIsSimplified] = useState<boolean>(
    invoice.guestFiscalId ? false : invoice.isSimplified
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedDni = guestFiscalId.trim().toUpperCase();
    const cleanedAddress = guestAddress.trim();
    const cleanedEmail = guestEmail.trim();
    const cleanedName = guestName.trim() || invoice.guestName;

    // Si se añade DNI/NIF o el importe supera 400€, es Factura Completa
    const updatedIsSimplified = cleanedDni
      ? false
      : invoice.totalAmount <= SIMPLIFIED_INVOICE_MAX_AMOUNT
      ? isSimplified
      : false;

    const updatedInvoice: Invoice = {
      ...invoice,
      guestName: cleanedName,
      guestFiscalId: cleanedDni || undefined,
      guestAddress: cleanedAddress || undefined,
      guestEmail: cleanedEmail || undefined,
      isSimplified: updatedIsSimplified,
    };

    onSave(updatedInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base">
                Completar Datos del Huésped
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Factura: <strong className="text-slate-800">{invoice.invoiceNumber}</strong> · {invoice.totalAmount.toFixed(2)} €
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Nombre / Empresa */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <User size={13} className="text-slate-400" />
              <span>Nombre y Apellidos o Razón Social</span>
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ej: Juan Pérez García o Empresa S.L."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-xs font-semibold"
            />
          </div>

          {/* DNI / NIF / Pasaporte */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>DNI / NIF / CIF / Pasaporte</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {invoice.totalAmount > SIMPLIFIED_INVOICE_MAX_AMOUNT
                  ? 'Requerido para Factura Completa (> 400 €)'
                  : 'Opcional si es ≤ 400 €'}
              </span>
            </div>
            <input
              type="text"
              value={guestFiscalId}
              onChange={(e) => {
                const val = e.target.value;
                setGuestFiscalId(val);
                if (val.trim()) {
                  setIsSimplified(false);
                }
              }}
              placeholder="Ej: 12345678Z, B12345678 o Pasaporte"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-xs font-mono uppercase"
            />
            <p className="text-[10px] text-slate-400">
              Puedes obtener este dato del Registro de Viajeros (SES.HOSPEDAJES / check-in).
            </p>
          </div>

          {/* Dirección Fiscal */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400" />
              <span>Dirección Fiscal Completa</span>
            </label>
            <textarea
              rows={2}
              value={guestAddress}
              onChange={(e) => setGuestAddress(e.target.value)}
              placeholder="Calle, número, piso, código postal, ciudad y país"
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-xs"
            />
          </div>

          {/* Email del Huésped */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Mail size={13} className="text-slate-400" />
              <span>Email del Huésped (Opcional)</span>
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-xs"
            />
          </div>

          {/* Estado Fiscal Resultante */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Régimen legal resultante:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full ${
                guestFiscalId.trim() || invoice.totalAmount > SIMPLIFIED_INVOICE_MAX_AMOUNT
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {guestFiscalId.trim() || invoice.totalAmount > SIMPLIFIED_INVOICE_MAX_AMOUNT
                ? 'Factura Completa con NIF (Art. 6 RD 1619/2012)'
                : 'Factura Simplificada (Art. 4 RD 1619/2012)'}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Guardar Datos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
