import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, X, CheckCircle2, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import {
  createInvoicesFromImportedRows,
  downloadInvoiceImportTemplate,
  HostFiscalProfile,
  ImportedReservationRow,
  Invoice,
  parseReservationsCsv,
  SIMPLIFIED_INVOICE_MAX_AMOUNT,
} from '../lib/invoice';
import { Property } from '../lib/icalParser';

interface Props {
  fiscalProfile: HostFiscalProfile;
  existingInvoices: Invoice[];
  properties: Property[];
  onImport: (invoices: Invoice[]) => void;
  onClose: () => void;
}

export default function ImportInvoicesCsvModal({
  fiscalProfile,
  existingInvoices,
  properties,
  onImport,
  onClose,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ImportedReservationRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const rows = parseReservationsCsv(text);
        if (rows.length === 0) {
          setErrorMsg(
            'No se encontraron reservas con importes válidos en el archivo. Revisa el delimitador (punto y coma o coma) o descarga la plantilla oficial.'
          );
          setParsedRows([]);
        } else {
          setParsedRows(rows);
        }
      } catch (err: any) {
        setErrorMsg('Error al leer el archivo CSV: ' + (err?.message || 'Formato desconocido'));
        setParsedRows([]);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    const defaultPropId = properties[0]?.id || 'prop-default';
    const newInvoices = createInvoicesFromImportedRows(
      parsedRows,
      existingInvoices,
      fiscalProfile,
      defaultPropId
    );
    onImport(newInvoices);
    onClose();
  };

  const simplifiedCount = parsedRows.filter(
    (r) => r.totalAmount <= SIMPLIFIED_INVOICE_MAX_AMOUNT && !r.guestFiscalId
  ).length;
  const completeCount = parsedRows.length - simplifiedCount;
  const totalAmount = parsedRows.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck size={12} />
                Importación Masiva · Cero Trabajo Manual
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Subir Reservas desde Excel / CSV
              </h2>
              <p className="text-xs text-slate-500">
                Importa tu exportación de Airbnb, Booking o la plantilla Turnexo y genera todas tus facturas oficiales del trimestre en 1 clic.
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

        {/* Zona de Subida y Descarga de Plantilla */}
        <div className="space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <span className="font-bold text-slate-800 block">¿No tienes un CSV preparado?</span>
              <span className="text-slate-500 text-[11px]">
                Descarga la plantilla oficial en Excel/CSV con los campos listos:
              </span>
            </div>
            <button
              type="button"
              onClick={downloadInvoiceImportTemplate}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download size={13} className="text-emerald-600" />
              <span>Descargar Plantilla CSV</span>
            </button>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/20 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto text-slate-400 group-hover:text-emerald-600 group-hover:scale-105 transition shadow-xs">
              <Upload size={22} />
            </div>
            <p className="font-extrabold text-slate-800 text-sm mt-3">
              {fileName ? fileName : 'Haz clic o arrastra tu archivo CSV aquí'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Compatible con exportaciones de Airbnb, Booking y plantilla Turnexo.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">{errorMsg}</div>
            </div>
          )}

          {/* Vista Previa de Filas Parseadas */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span className="font-extrabold text-emerald-950 text-xs">
                    {parsedRows.length} reservas listas para facturar
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-900">
                  <span>{simplifiedCount} Simplificadas (≤400 €)</span>
                  <span>·</span>
                  <span>{completeCount} Completas (&gt;400 €)</span>
                  <span>·</span>
                  <span className="text-emerald-950 font-black">Total: {totalAmount.toFixed(2)} €</span>
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-200 text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Huésped</th>
                      <th className="py-2 px-3">Alojamiento</th>
                      <th className="py-2 px-3">Fechas</th>
                      <th className="py-2 px-3">DNI / NIF</th>
                      <th className="py-2 px-3 text-right">Importe</th>
                      <th className="py-2 px-3 text-right">Tipo Factura</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 15).map((row, idx) => {
                      const isSimp = row.totalAmount <= SIMPLIFIED_INVOICE_MAX_AMOUNT && !row.guestFiscalId;
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-900">{row.guestName}</td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-[120px]">
                            {row.propertyName}
                          </td>
                          <td className="py-2 px-3 text-slate-500 font-mono text-[10px]">
                            {row.stayStartDate} → {row.stayEndDate}
                          </td>
                          <td className="py-2 px-3 font-mono text-[10px] text-slate-600">
                            {row.guestFiscalId || (
                              <span className="text-slate-400 italic">No requerido</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {row.totalAmount.toFixed(2)} €
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                isSimp
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {isSimp ? 'Simplificada' : 'Completa'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {parsedRows.length > 15 && (
                  <p className="p-2 text-center text-slate-400 bg-slate-50 text-[10px]">
                    ... y {parsedRows.length - 15} reservas más incluidas en la importación.
                  </p>
                )}
              </div>
            </div>
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
            disabled={parsedRows.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-md transition flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>Emitir {parsedRows.length} Facturas Oficiales</span>
          </button>
        </div>
      </div>
    </div>
  );
}
