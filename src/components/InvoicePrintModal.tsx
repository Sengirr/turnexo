import React, { useRef, useState } from 'react';
import { Printer, Download, X, ShieldCheck, Loader2, Pencil } from 'lucide-react';
import {
  Invoice,
  formatDisplayDate,
  formatInvoiceConcept,
  getInvoiceBookingRef,
  getInvoiceChannel,
} from '../lib/invoice';
import { downloadSingleInvoicePdf } from '../lib/invoicePdf';

interface Props {
  invoice: Invoice;
  onEditGuest?: () => void;
  onClose: () => void;
}

export default function InvoicePrintModal({ invoice, onEditGuest, onClose }: Props) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadSingleInvoicePdf(invoice);
    } catch (err) {
      console.error('Error generating PDF:', err);
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!invoiceRef.current) {
      window.print();
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const htmlContent = invoiceRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura ${invoice.invoiceNumber}</title>
          <meta charset="utf-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body class="p-6">
          <div class="max-w-2xl mx-auto space-y-6">
            ${htmlContent}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 350);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8 print:shadow-none print:m-0 print:p-6 print:rounded-none">
        {/* Cabecera modal (oculta al imprimir) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${
                invoice.isSimplified
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              <ShieldCheck size={14} />
              {invoice.isSimplified ? 'Factura Simplificada (≤ 400 €)' : 'Factura Completa'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              R.D. 1619/2012 · IVA 10%
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onEditGuest && (
              <button
                type="button"
                onClick={onEditGuest}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs"
                title="Modificar DNI o dirección fiscal del huésped"
              >
                <Pencil size={13} className="text-emerald-600" />
                <span>Editar Datos</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>Descargar PDF</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm"
            >
              <Printer size={14} />
              <span>Imprimir</span>
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

        {/* CONTENIDO DE LA FACTURA (Estilo ERP IVI Hospedaje) */}
        <div ref={invoiceRef} className="space-y-5 text-slate-800 font-sans bg-white p-4 sm:p-8 rounded-2xl border border-slate-100 shadow-xs">
          {/* Barra superior verde azulado IVI */}
          <div className="h-2.5 bg-[#0e6f68] w-full rounded-t-lg -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 mb-5" />

          {/* Bloque superior: Emisor a la izquierda y Factura de Hospedaje a la derecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pb-4 border-b-2 border-slate-800/80">
            {/* Izquierda: Emisor / Arrendador */}
            <div className="space-y-0.5 text-xs text-slate-700">
              <p className="text-[11px] font-black uppercase text-slate-900 tracking-wider">
                EMISOR / ARRENDADOR:
              </p>
              <p className="text-sm font-black text-slate-900 pt-0.5">{invoice.hostName}</p>
              <p className="font-mono text-[11px] text-slate-600">NIF / CIF: {invoice.hostFiscalId}</p>
              <p className="text-[11px] text-slate-600">
                Domicilio Fiscal: {invoice.hostAddress}, {invoice.hostPostalCode} {invoice.hostCity} (ES)
              </p>
              <p className="text-[11px] text-slate-700">
                Inmueble: <strong className="font-bold text-slate-900">{invoice.propertyName}</strong>
              </p>
            </div>

            {/* Derecha: Factura de Hospedaje y Datos de Emisión */}
            <div className="sm:text-right space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#0e6f68] tracking-tight uppercase">
                FACTURA DE HOSPEDAJE
              </h1>
              <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                <p>
                  Nº Factura: <strong className="font-bold text-slate-900 font-mono text-xs">{invoice.invoiceNumber}</strong>
                </p>
                <p>
                  Fecha de Emisión: <span className="font-semibold text-slate-800">{formatDisplayDate(invoice.issueDate)}</span>
                </p>
                <p>
                  Localizador: <span className="font-mono font-semibold text-slate-800">{getInvoiceBookingRef(invoice)}</span>
                </p>
                <p>
                  Canal de Reserva: <span className="font-semibold text-slate-800">{getInvoiceChannel(invoice)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Bloque: Datos del Cliente / Huésped (Receptor) */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 text-xs">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#0e6f68]">
              DATOS DEL CLIENTE / HUÉSPED (RECEPTOR)
            </p>
            <p className="font-bold text-slate-900 mt-1 text-sm">{invoice.guestName}</p>
            {invoice.guestFiscalId ? (
              <p className="text-slate-600 font-mono text-xs mt-0.5">NIF / ID: {invoice.guestFiscalId}</p>
            ) : invoice.isSimplified ? (
              <p className="text-slate-400 italic text-[11px] mt-0.5">
                Particular (identificación según reserva / Registro de Viajeros)
              </p>
            ) : (
              <p className="text-amber-700 italic text-[11px] mt-0.5">
                Particular (sin NIF registrado en plataforma)
              </p>
            )}
            {invoice.guestAddress && (
              <p className="text-slate-600 text-xs mt-0.5">Domicilio: {invoice.guestAddress}</p>
            )}
            {invoice.guestEmail && (
              <p className="text-slate-500 text-[11px]">{invoice.guestEmail}</p>
            )}
          </div>

          {/* Tabla de Servicios estilo IVI */}
          <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#0e6f68] text-white font-bold">
                <tr>
                  <th className="py-2.5 px-3">Descripción del Servicio</th>
                  <th className="py-2.5 px-3 text-center">Tipo IVA</th>
                  <th className="py-2.5 px-3 text-right">Base Imponible</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-900">
                      Servicio de alojamiento turístico en {invoice.propertyName}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Entrada: {formatDisplayDate(invoice.stayStartDate)} — Salida: {formatDisplayDate(invoice.stayEndDate)}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-slate-700">
                    {invoice.vatRate}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {invoice.baseAmount.toFixed(2)} €
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {invoice.totalAmount.toFixed(2)} €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bloque inferior: Estado del Pago a la izq y Totales a la der */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-2">
            {/* Estado del Pago */}
            <div className="space-y-1 text-xs">
              <p className="text-[11px] font-extrabold uppercase text-[#0e6f68] tracking-wider">
                ESTADO DEL PAGO:
              </p>
              <p className="text-slate-800 font-medium">
                Cobrado y confirmado a través de plataforma ({getInvoiceChannel(invoice)}).
              </p>
              <p className="text-slate-500 text-[11px]">
                Importe íntegro satisfecho con anterioridad o durante la estancia.
              </p>
            </div>

            {/* Totales estilo IVI */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50">
              <div className="p-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Base Imponible:</span>
                  <span className="font-mono font-semibold text-slate-800">{invoice.baseAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA Alojamiento Turístico ({invoice.vatRate}%):</span>
                  <span className="font-mono font-semibold text-slate-800">{invoice.vatAmount.toFixed(2)} €</span>
                </div>
                {invoice.touristTaxAmount && invoice.touristTaxAmount > 0 ? (
                  <div className="flex justify-between">
                    <span>Tasa turística:</span>
                    <span className="font-mono font-semibold text-slate-800">{invoice.touristTaxAmount.toFixed(2)} €</span>
                  </div>
                ) : null}
              </div>
              <div className="bg-[#0e6f68] text-white px-3 py-2.5 flex justify-between items-center font-bold">
                <span className="text-xs uppercase tracking-wider">TOTAL FACTURA:</span>
                <span className="text-base font-black font-mono">{invoice.totalAmount.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Nota Legal */}
          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
            <p>
              * Factura de hospedaje expedida con arreglo a la normativa tributaria española vigente (RD 1619/2012, de 30 de noviembre). Régimen general del Impuesto sobre el Valor Añadido (IVA al tipo reducido del 10% para alojamiento turístico).
            </p>
          </div>
        </div>

        {/* Pie modal */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
