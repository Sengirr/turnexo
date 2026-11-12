import React, { useRef, useState } from 'react';
import { Printer, Download, X, ShieldCheck, Loader2, Pencil } from 'lucide-react';
import { Invoice, formatDisplayDate, formatInvoiceConcept } from '../lib/invoice';

interface Props {
  invoice: Invoice;
  onEditGuest?: () => void;
  onClose: () => void;
}

export default function InvoicePrintModal({ invoice, onEditGuest, onClose }: Props) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 10,
        filename: `Factura_${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };
      await html2pdf().from(invoiceRef.current).set(opt).save();
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

        {/* CONTENIDO DE LA FACTURA (Imprimible y descargable a PDF) */}
        <div ref={invoiceRef} className="space-y-6 text-slate-800 font-sans bg-white p-4 sm:p-6 rounded-2xl">
          {/* Encabezado y Nº Factura */}
          <div className="flex justify-between items-start gap-4 pb-2 border-b border-slate-100">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {invoice.isSimplified ? 'FACTURA SIMPLIFICADA' : 'FACTURA'}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Nº: <strong className="text-slate-900 font-bold text-sm">{invoice.invoiceNumber}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Fecha de expedición: <span className="font-semibold text-slate-800">{formatDisplayDate(invoice.issueDate)}</span>
              </p>
            </div>
          </div>

          {/* Bloque de Partes: Emisor y Huésped */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
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
                Huésped
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
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{formatInvoiceConcept(invoice.concept)}</p>
                    <p className="text-[11px] text-slate-500">{invoice.propertyName}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    {formatDisplayDate(invoice.stayStartDate)} al {formatDisplayDate(invoice.stayEndDate)}
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
            <p className="text-[10px] text-slate-400">
              Documento expedido mediante software de gestión de alojamientos turísticos Turnexo.
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
