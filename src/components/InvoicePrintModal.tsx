import React from 'react';
import { Printer, Download, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Invoice } from '../lib/invoice';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoicePrintModal({ invoice, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8 print:shadow-none print:m-0 print:p-6 print:rounded-none">
        {/* Cabecera modal (oculta al imprimir) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={14} />
              {invoice.isSimplified ? 'Factura Simplificada (≤ 400 €)' : 'Factura Completa'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              R.D. 1619/2012 · IVA 10%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
            >
              <Printer size={14} />
              Imprimir / PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg text-xs font-bold"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTENIDO DE LA FACTURA (Imprimible) */}
        <div className="space-y-6 text-slate-800 font-sans print:text-black">
          {/* Encabezado y Nº Factura */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {invoice.isSimplified ? 'FACTURA SIMPLIFICADA' : 'FACTURA'}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Nº: <strong className="text-slate-900 font-bold">{invoice.invoiceNumber}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Fecha de expedición: <span className="font-semibold text-slate-700">{invoice.issueDate}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-slate-900 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-lg">
                Turnexo Hospitality
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Estancias de corta duración</p>
            </div>
          </div>

          {/* Bloque de Partes: Emisor y Huésped */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs print:bg-white print:border-slate-300">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                Emisor / Anfitrión
              </p>
              <p className="font-bold text-slate-900 mt-1">{invoice.hostName}</p>
              <p className="text-slate-600 font-mono">NIF/CIF: {invoice.hostFiscalId}</p>
              <p className="text-slate-600">{invoice.hostAddress}</p>
              <p className="text-slate-600">
                {invoice.hostPostalCode} {invoice.hostCity}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                Huésped / Cliente
              </p>
              <p className="font-bold text-slate-900 mt-1">{invoice.guestName}</p>
              {invoice.guestFiscalId ? (
                <p className="text-slate-600 font-mono">NIF/ID: {invoice.guestFiscalId}</p>
              ) : invoice.isSimplified ? (
                <p className="text-slate-400 italic">
                  Identificación simplificada (RD 1619/2012 Art. 4.1)
                </p>
              ) : (
                <p className="text-slate-400 italic">
                  Particular (identificación según reserva / Registro de Viajeros)
                </p>
              )}
              {invoice.guestAddress && (
                <p className="text-slate-600">{invoice.guestAddress}</p>
              )}
              {invoice.guestEmail && (
                <p className="text-slate-500 text-[11px]">{invoice.guestEmail}</p>
              )}
            </div>
          </div>

          {/* Detalle del Servicio */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Concepto / Servicio</th>
                  <th className="py-2.5 px-3">Estancia</th>
                  <th className="py-2.5 px-3 text-center">Noches</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{invoice.concept}</p>
                    <p className="text-[11px] text-slate-500">{invoice.propertyName}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    {invoice.stayStartDate} al {invoice.stayEndDate}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-700">
                    {invoice.nights}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {invoice.totalAmount.toFixed(2)} €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cuadro de Desglose de IVA */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                <span>Base Imponible:</span>
                <span className="font-mono font-semibold">{invoice.baseAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                <span>IVA devengado ({invoice.vatRate}%):</span>
                <span className="font-mono font-semibold">{invoice.vatAmount.toFixed(2)} €</span>
              </div>
              {invoice.touristTaxAmount && invoice.touristTaxAmount > 0 ? (
                <div className="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                  <span>Tasa turística:</span>
                  <span className="font-mono font-semibold">{invoice.touristTaxAmount.toFixed(2)} €</span>
                </div>
              ) : null}
              <div className="flex justify-between py-2 text-sm font-black text-slate-900 bg-slate-100 px-3 rounded-xl">
                <span>TOTAL FACTURA:</span>
                <span className="font-mono">{invoice.totalAmount.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Nota Legal */}
          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-1">
            <p>
              * Factura expedida con arreglo a la normativa tributaria española vigente (RD 1619/2012, de 30 de noviembre). Régimen general del Impuesto sobre el Valor Añadido (IVA al tipo reducido del 10% para alojamiento turístico).
            </p>
            <p className="font-mono text-[9px] text-slate-400">
              Documento generado electrónicamente mediante Turnexo · Código de verificación: {invoice.id}
            </p>
          </div>
        </div>

        {/* Pie modal */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 print:hidden">
          <p className="text-xs text-slate-500">
            Puedes descargar este documento en PDF con el botón <strong>Imprimir / PDF</strong>.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
