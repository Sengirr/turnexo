import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, X, CheckCircle2, AlertTriangle, ShieldCheck, Clipboard, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  createInvoicesFromImportedRows,
  downloadInvoiceImportTemplate,
  formatDisplayDate,
  HostFiscalProfile,
  ImportedReservationRow,
  Invoice,
  matchPropertyWithText,
  parseReservationsCsv,
  parseReservationsFromSheetRows,
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
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ImportedReservationRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterOnlyRegistered, setFilterOnlyRegistered] = useState(true);

  // Comprobar si hay reservas que coincidan con los alojamientos registrados en Turnexo
  const matchingRows = React.useMemo(() => {
    if (!properties || properties.length === 0) return parsedRows;
    return parsedRows.filter((r) =>
      properties.some((p) => matchPropertyWithText(p.name, r.propertyName))
    );
  }, [parsedRows, properties]);

  const hasMultiplePropertiesInCsv = React.useMemo(() => {
    const names = new Set(parsedRows.map((r) => r.propertyName.toLowerCase().trim()));
    return names.size > 1;
  }, [parsedRows]);

  const rowsToImport = React.useMemo(() => {
    if (
      filterOnlyRegistered &&
      hasMultiplePropertiesInCsv &&
      matchingRows.length > 0 &&
      matchingRows.length < parsedRows.length
    ) {
      return matchingRows;
    }
    return parsedRows;
  }, [filterOnlyRegistered, hasMultiplePropertiesInCsv, matchingRows, parsedRows]);

  const processCsvText = (text: string) => {
    try {
      let rows: ImportedReservationRow[] = [];
      try {
        const workbook = XLSX.read(text, { type: 'string', raw: true });
        const firstSheetName = workbook.SheetNames[0];
        if (firstSheetName && workbook.Sheets[firstSheetName]) {
          const rawObjects = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[firstSheetName]);
          rows = parseReservationsFromSheetRows(rawObjects);
        }
      } catch {
        // Fallback al parseador de texto directo
      }

      if (rows.length === 0) {
        rows = parseReservationsCsv(text);
      }

      if (rows.length === 0) {
        setErrorMsg(
          'No se encontraron reservas con importes válidos en el contenido. Verifica que incluya cabeceras de columnas o prueba pegando el texto directamente.'
        );
        setParsedRows([]);
      } else {
        setParsedRows(rows);
        setErrorMsg(null);
      }
    } catch (err: any) {
      setErrorMsg('Error al procesar los datos: ' + (err?.message || 'Formato desconocido'));
      setParsedRows([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setErrorMsg(null);

    const isExcel = /\.(xlsx|xls)$/i.test(file.name);

    if (isExcel) {
      // Procesar archivo Excel (.xls o .xlsx) directamente como objetos estructurados
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawObjects = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
          const rows = parseReservationsFromSheetRows(rawObjects);
          if (rows.length === 0) {
            setErrorMsg(
              'No se encontraron reservas con importes válidos en el archivo Excel. Verifica que incluya cabeceras de columnas.'
            );
            setParsedRows([]);
          } else {
            setParsedRows(rows);
            setErrorMsg(null);
          }
        } catch (excelErr: any) {
          setErrorMsg('No se pudo leer el archivo Excel: ' + (excelErr?.message || 'Archivo corrupto o no compatible'));
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Procesar archivo de texto (.csv, .tsv, .txt)
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCsvText(text);
      };
      reader.readAsText(file, 'utf-8');
    }
  };

  const handlePastedChange = (text: string) => {
    setPastedText(text);
    if (!text.trim()) {
      setParsedRows([]);
      setErrorMsg(null);
      return;
    }
    processCsvText(text);
  };

  const handleConfirmImport = () => {
    if (rowsToImport.length === 0) return;
    const newInvoices = createInvoicesFromImportedRows(
      rowsToImport,
      existingInvoices,
      fiscalProfile,
      properties
    );
    onImport(newInvoices);
    onClose();
  };

  const simplifiedCount = rowsToImport.filter(
    (r) => r.totalAmount <= SIMPLIFIED_INVOICE_MAX_AMOUNT && !r.guestFiscalId
  ).length;
  const completeCount = rowsToImport.length - simplifiedCount;
  const totalAmount = rowsToImport.reduce((sum, r) => sum + r.totalAmount, 0);

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
                Subir Reservas (Excel XLS, XLSX o CSV)
              </h2>
              <p className="text-xs text-slate-500">
                Soporta descargas de Booking.com, Airbnb o plantilla Turnexo para emitir todas tus facturas oficiales del trimestre.
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

        {/* Selector de Modo: Subir Archivo vs Pegar Texto */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload size={14} />
            <span>Subir Archivo (.xls, .xlsx, .csv)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'paste'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clipboard size={14} />
            <span>Pegar Tabla Copiada</span>
          </button>
        </div>

        {/* Zona de Subida y Descarga de Plantilla */}
        <div className="space-y-4 text-xs">
          {activeTab === 'upload' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="font-bold text-slate-800 block">¿Descargaste tu archivo de Booking o Airbnb?</span>
                  <span className="text-slate-500 text-[11px]">
                    Súbelo directamente aquí (incluso con extensión .xls o .xlsx) o descarga la plantilla oficial:
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
                  accept=".csv,.txt,.xls,.xlsx,.tsv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto text-slate-400 group-hover:text-emerald-600 group-hover:scale-105 transition shadow-xs">
                  <Upload size={22} />
                </div>
                <p className="font-extrabold text-slate-800 text-sm mt-3">
                  {fileName ? fileName : 'Haz clic o arrastra tu archivo .XLS, .XLSX o .CSV aquí'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Detecta automáticamente archivos de Booking.com, Airbnb y plantilla Turnexo.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">
                Pega aquí las filas copiadas de tu Excel o Booking.com:
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => handlePastedChange(e.target.value)}
                placeholder="Pega aquí el texto con cabeceras (ej: Nombre del alojamiento, Titular de la reserva, Llegada, Salida, Importe total...)"
                className="w-full p-3 font-mono text-[11px] rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60"
              />
              <p className="text-[11px] text-slate-400">
                Tip: Abre tu archivo en Excel, selecciona las filas, copia (Ctrl+C) y pégalas (Ctrl+V) aquí directamente.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">{errorMsg}</div>
            </div>
          )}

          {/* Selector de filtrado si el archivo es multi-alojamiento */}
          {parsedRows.length > 0 && hasMultiplePropertiesInCsv && matchingRows.length > 0 && matchingRows.length < parsedRows.length && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Archivo con múltiples alojamientos de agencia detectado
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Filtro Inteligente
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Este archivo contiene reservas de varios inmuebles gestionados por la agencia. Puedes emitir únicamente las facturas correspondientes a tu alojamiento registrado o importarlas todas.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <label
                  className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                    filterOnlyRegistered
                      ? 'bg-white border-emerald-500 shadow-xs text-slate-900 font-bold'
                      : 'bg-white/50 border-slate-200/80 text-slate-600 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="importFilterOption"
                    checked={filterOnlyRegistered}
                    onChange={() => setFilterOnlyRegistered(true)}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block text-slate-900">
                      Solo mi alojamiento ({matchingRows.length} reservas)
                    </span>
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                      {properties.map((p) => p.name).join(', ')}
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                    !filterOnlyRegistered
                      ? 'bg-white border-emerald-500 shadow-xs text-slate-900 font-bold'
                      : 'bg-white/50 border-slate-200/80 text-slate-600 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="importFilterOption"
                    checked={!filterOnlyRegistered}
                    onChange={() => setFilterOnlyRegistered(false)}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block text-slate-900">
                      Todas las reservas ({parsedRows.length})
                    </span>
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                      Incluye las {parsedRows.length - matchingRows.length} reservas de otros apartamentos
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Vista Previa de Filas Parseadas */}
          {rowsToImport.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span className="font-extrabold text-emerald-950 text-xs">
                    {rowsToImport.length} reservas listas para facturar
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
                    {rowsToImport.slice(0, 20).map((row, idx) => {
                      const isSimp = row.totalAmount <= SIMPLIFIED_INVOICE_MAX_AMOUNT && !row.guestFiscalId;
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-900">{row.guestName}</td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-[130px]" title={row.propertyName}>
                            {row.propertyName}
                          </td>
                          <td className="py-2 px-3 text-slate-500 font-mono text-[10px]">
                            {formatDisplayDate(row.stayStartDate)} → {formatDisplayDate(row.stayEndDate)}
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
                {rowsToImport.length > 20 && (
                  <p className="p-2 text-center text-slate-400 bg-slate-50 text-[10px]">
                    ... y {rowsToImport.length - 20} reservas más incluidas en la importación.
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
            disabled={rowsToImport.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-md transition flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>Emitir {rowsToImport.length} Facturas Oficiales</span>
          </button>
        </div>
      </div>
    </div>
  );
}
