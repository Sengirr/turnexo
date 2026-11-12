import { Property } from './icalParser';
import * as XLSX from 'xlsx';

export const SIMPLIFIED_INVOICE_MAX_AMOUNT = 400; // Art. 4.1 RD 1619/2012 (Factura simplificada hasta 400€ con IVA)

export interface Invoice {
  id: string;
  invoiceNumber: string; // ej. FS-2026-001 o FC-2026-001
  series: string; // ej. FS-2026
  issueDate: string; // YYYY-MM-DD
  reservationId: string;
  propertyId: string;
  propertyName: string;
  stayStartDate: string;
  stayEndDate: string;
  nights: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  guestFiscalId?: string; // DNI/NIF/Pasaporte (opcional para simplificada <= 400€)
  guestAddress?: string; // Opcional para simplificada
  isSimplified: boolean; // true si es Factura Simplificada (<= 400€, RD 1619/2012 Art. 4)
  hostName: string;
  hostFiscalId: string; // NIF / CIF del propietario
  hostAddress: string;
  hostPostalCode: string;
  hostCity: string;
  concept: string; // "Alojamiento turístico (IVA 10%)"
  totalAmount: number; // PVP con IVA
  vatRate: number; // 10% obligatorio estancias < 30 días
  baseAmount: number; // Base imponible
  vatAmount: number; // Cuota IVA 10%
  touristTaxAmount?: number; // Tasa turística (si aplica)
  status: 'issued' | 'cancelled';
}

export interface HostFiscalProfile {
  fullNameOrCompany: string;
  nifCif: string;
  fiscalAddress: string;
  postalCode: string;
  city: string;
  province: string;
  simplifiedSeriesPrefix: string; // ej. "FS-2026"
  completeSeriesPrefix: string; // ej. "FC-2026"
  defaultVatRate: number; // 10
}

export const DEFAULT_HOST_FISCAL_PROFILE: HostFiscalProfile = {
  fullNameOrCompany: 'Anfitrión Turnexo S.L. / Particular',
  nifCif: '12345678Z',
  fiscalAddress: 'Calle Sol 14, 2ºB',
  postalCode: '29602',
  city: 'Marbella',
  province: 'Málaga',
  simplifiedSeriesPrefix: 'FS-2026',
  completeSeriesPrefix: 'FC-2026',
  defaultVatRate: 10,
};

export function calculateBreakdown(totalWithVat: number, vatRate = 10, touristTax = 0) {
  const taxableTotal = Math.max(0, totalWithVat - touristTax);
  const base = Math.round((taxableTotal / (1 + vatRate / 100)) * 100) / 100;
  const vat = Math.round((taxableTotal - base) * 100) / 100;
  return {
    baseAmount: base,
    vatAmount: vat,
    touristTaxAmount: touristTax,
    totalAmount: totalWithVat,
  };
}

export function generateNextInvoiceNumber(
  existingInvoices: Invoice[],
  isSimplified = true,
  year = new Date().getFullYear()
): { number: string; series: string } {
  // Prefijo unificado anual F-YYYY para evitar que se repitan números correlativos (ej: 001) entre facturas simplificadas y completas
  const prefix = `F-${year}`;

  // Extraer el número más alto existente en cualquier factura de ese año para garantizar correlatividad única sin saltos ni duplicados
  const existingNumbers = existingInvoices
    .filter((inv) => inv.invoiceNumber && inv.invoiceNumber.includes(String(year)))
    .map((inv) => {
      const match = inv.invoiceNumber.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });

  const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers, 0) : 0;
  const nextNum = maxNum + 1;
  const padded = String(nextNum).padStart(3, '0');

  return {
    series: prefix,
    number: `${prefix}-${padded}`,
  };
}

export function getQuarterFromDate(dateStr: string): '1T' | '2T' | '3T' | '4T' {
  const month = parseInt(dateStr.split('-')[1] || '1', 10);
  if (month <= 3) return '1T';
  if (month <= 6) return '2T';
  if (month <= 9) return '3T';
  return '4T';
}

export interface QuarterSummary {
  quarter: '1T' | '2T' | '3T' | '4T';
  quarterLabel: string;
  totalInvoices: number;
  totalBase: number;
  totalVat: number;
  totalAmount: number;
}

export function computeQuarterSummaries(invoices: Invoice[], year = new Date().getFullYear()): QuarterSummary[] {
  const activeInvoices = invoices.filter(
    (inv) => inv.status === 'issued' && inv.issueDate.startsWith(String(year))
  );

  const quarters: Array<{ key: '1T' | '2T' | '3T' | '4T'; label: string }> = [
    { key: '1T', label: '1er Trimestre (Ene - Mar)' },
    { key: '2T', label: '2º Trimestre (Abr - Jun)' },
    { key: '3T', label: '3er Trimestre (Jul - Sep)' },
    { key: '4T', label: '4º Trimestre (Oct - Dic)' },
  ];

  return quarters.map((q) => {
    const qInvoices = activeInvoices.filter((inv) => getQuarterFromDate(inv.issueDate) === q.key);
    const totalBase = qInvoices.reduce((acc, inv) => acc + inv.baseAmount, 0);
    const totalVat = qInvoices.reduce((acc, inv) => acc + inv.vatAmount, 0);
    const totalAmount = qInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

    return {
      quarter: q.key,
      quarterLabel: q.label,
      totalInvoices: qInvoices.length,
      totalBase: Math.round(totalBase * 100) / 100,
      totalVat: Math.round(totalVat * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  });
}

/**
 * Exporta el libro de facturas a formato CSV compatible con gestorías y Excel
 */
export function exportInvoicesToCsv(invoices: Invoice[], title = 'libro_iva_turnexo.csv'): void {
  const headers = [
    'Número Factura',
    'Tipo',
    'Fecha Emisión',
    'Fecha Entrada',
    'Fecha Salida',
    'Alojamiento',
    'Huésped / Cliente',
    'NIF/CIF Huésped',
    'Base Imponible (€)',
    '% IVA',
    'Cuota IVA (€)',
    'Total Factura (€)',
    'Estado',
  ];

  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.isSimplified ? 'Simplificada (<=400€)' : 'Completa',
    inv.issueDate,
    inv.stayStartDate,
    inv.stayEndDate,
    `"${inv.propertyName.replace(/"/g, '""')}"`,
    `"${inv.guestName.replace(/"/g, '""')}"`,
    inv.guestFiscalId || 'No requerido (<=400€)',
    inv.baseAmount.toFixed(2).replace('.', ','),
    `${inv.vatRate}%`,
    inv.vatAmount.toFixed(2).replace('.', ','),
    inv.totalAmount.toFixed(2).replace('.', ','),
    inv.status === 'issued' ? 'Emitida' : 'Anulada',
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', title);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface ImportedReservationRow {
  propertyName: string;
  guestName: string;
  guestFiscalId?: string;
  guestAddress?: string;
  stayStartDate: string;
  stayEndDate: string;
  totalAmount: number;
  reservationCode?: string;
}

const SPANISH_MONTHS: Record<string, string> = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  setiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12',
};

/**
 * Normaliza fechas en formato YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY (Airbnb) o español ("2 de julio de 2026")
 */
export function normalizeDateString(dStr: string, isAirbnb = false): string {
  if (!dStr) return new Date().toISOString().split('T')[0];
  const trimmed = String(dStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const p1 = parseInt(slashMatch[1], 10);
    const p2 = parseInt(slashMatch[2], 10);
    const year = slashMatch[3];

    // Si p1 > 12 -> p1 es el día (DD/MM/YYYY)
    if (p1 > 12) {
      return `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
    }
    // Si p2 > 12 -> p2 es el día (MM/DD/YYYY)
    if (p2 > 12) {
      return `${year}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`;
    }
    // Si ambos son <= 12: en Airbnb exports se usa MM/DD/YYYY, en Europa por defecto DD/MM/YYYY
    if (isAirbnb) {
      return `${year}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`;
    }
    return `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
  }

  const match = trimmed.match(/^(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})$/i);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthName = match[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const month = SPANISH_MONTHS[monthName] || '01';
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  // Si no coincide con formato de fecha, devolver fecha de hoy para evitar textos residuales
  return new Date().toISOString().split('T')[0];
}

/**
 * Divide líneas CSV respetando saltos de línea dentro de campos entrecomillados
 */
export function splitCsvLines(text: string): string[] {
  const lines: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (c === '\r' && text[i + 1] === '\n') {
        i++;
      }
      if (cur.trim()) {
        lines.push(cur);
      }
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.trim()) {
    lines.push(cur);
  }
  return lines;
}

/**
 * Descarga plantilla CSV para importación masiva de reservas/facturas
 */
export function downloadInvoiceImportTemplate(): void {
  const headers = [
    'Alojamiento',
    'Nombre Huésped',
    'DNI_NIF (Obligatorio si > 400€)',
    'Dirección Fiscal (Opcional si <= 400€)',
    'Fecha Entrada (AAAA-MM-DD)',
    'Fecha Salida (AAAA-MM-DD)',
    'Importe Total con IVA (€)',
  ];

  const sampleRows = [
    ['Ático Vista Marina', 'Carlos Mendoza', '', '', '2026-11-01', '2026-11-04', '350.00'],
    ['Ático Vista Marina', 'Empresa Consultora S.L.', 'B87654321', 'Paseo de la Castellana 100, Madrid', '2026-11-08', '2026-11-12', '620.00'],
    ['Loft Centro Histórico', 'Laura Pausini', '', '', '2026-11-15', '2026-11-18', '280.00'],
  ];

  const csvContent = '\uFEFF' + [headers.join(';'), ...sampleRows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'plantilla_reservas_turnexo.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parsea un importe en formato numérico o string con soporte para divisas (€, $, EUR) y comas/puntos decimales
 */
export function parseCurrencyNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let str = String(val).trim();
  str = str.replace(/[^0-9.,\-]/g, '');
  if (!str) return 0;
  if (str.includes('.') && str.includes(',')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

/**
 * Parsea un array de objetos obtenido directamente de SheetJS (evita problemas de saltos de línea dentro de celdas de Excel y soporta Booking y Airbnb)
 */
export function parseReservationsFromSheetRows(rawObjects: Record<string, any>[]): ImportedReservationRow[] {
  if (!Array.isArray(rawObjects) || rawObjects.length === 0) return [];

  // Detectar si el archivo proviene de Airbnb (cabeceras características como Tipo, Código de confirmación, Ingresos brutos, Viajero)
  const isAirbnb = rawObjects.some((row) => {
    if (!row || typeof row !== 'object') return false;
    const keys = Object.keys(row).map((k) => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    return (
      keys.some((k) => k.includes('airbnb') || k.includes('viajero') || k.includes('ingresos brutos')) ||
      row['Tipo'] !== undefined ||
      row['Código de confirmación'] !== undefined
    );
  });

  const rows: ImportedReservationRow[] = [];

  for (const row of rawObjects) {
    if (!row || typeof row !== 'object') continue;

    const entries = Object.entries(row);
    if (entries.length === 0) continue;

    const findVal = (predicate: (cleanKey: string) => boolean): any => {
      const found = entries.find(([k]) => {
        const cleanK = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        return predicate(cleanK);
      });
      return found ? found[1] : undefined;
    };

    // Tipo de transacción (en Airbnb): omitir cobros de transferencia bancaria, comisiones de coanfitrión, resoluciones y ajustes
    const tipoVal = String(findVal((k) => k === 'tipo' || k.includes('type')) || '').toLowerCase();
    if (tipoVal) {
      if (
        tipoVal.includes('payout') ||
        tipoVal.includes('transfer') ||
        tipoVal.includes('coanfitrion') ||
        tipoVal.includes('co-host') ||
        tipoVal.includes('ajuste') ||
        tipoVal.includes('adjustment') ||
        tipoVal.includes('resolucion') ||
        tipoVal.includes('resolution')
      ) {
        continue;
      }
    }

    // Si el estado es cancelado o anulado, ignorar
    const statusVal = String(findVal((k) => k.includes('estado') || k.includes('status')) || '').toLowerCase();
    if (statusVal.includes('cancel') || statusVal.includes('anula')) {
      continue;
    }

    // Huésped / Viajero
    let rawGuest = findVal((k) =>
      k.includes('viajero') ||
      k.includes('titular') ||
      k.includes('huesped') ||
      k.includes('guest') ||
      (k.includes('cliente') && !k.includes('genius')) ||
      (k.includes('nombre') && !k.includes('alojamiento') && !k.includes('propiedad') && !k.includes('habitacion'))
    );

    // Si no hay viajero / huésped o es una fila de transferencia bancaria, saltar
    if (!rawGuest || String(rawGuest).toLowerCase().includes('transferido a')) {
      continue;
    }

    // Alojamiento (evitar columnas como "ubicación" o "dirección")
    let rawProp = findVal((k) =>
      k.includes('alojamiento') ||
      k.includes('listing') ||
      k.includes('propiedad') ||
      k.includes('apartamento') ||
      k.includes('habitacion') ||
      k.includes('room')
    );

    // DNI / NIF
    let rawDni = findVal((k) =>
      k.includes('dni') || k.includes('nif') || k.includes('cif') || k.includes('fiscal') || k.includes('identificacion')
    );

    // Dirección fiscal
    let rawAddr = findVal((k) =>
      k.includes('direccion fiscal') || k.includes('domicilio fiscal') || k.includes('fiscal address')
    );

    // Fechas
    let rawIn = findVal((k) =>
      k.includes('fecha de inicio') ||
      k.includes('entrada') ||
      k.includes('check-in') ||
      k.includes('checkin') ||
      k.includes('llegada') ||
      k.includes('start') ||
      k.includes('arrival')
    );

    let rawOut = findVal((k) =>
      k.includes('fecha de finalizacion') ||
      k.includes('salida') ||
      k.includes('check-out') ||
      k.includes('checkout') ||
      k.includes('departure') ||
      k.includes('end')
    );

    // Importe: en Airbnb priorizar 'Ingresos brutos' (total íntegro pagado por el huésped)
    let rawAmount = findVal((k) => k.includes('ingresos brutos') || k.includes('gross earnings'));
    if (!rawAmount || parseCurrencyNumber(rawAmount) <= 0) {
      rawAmount = findVal((k) =>
        k.includes('importe total') ||
        k.includes('importe') ||
        k.includes('amount') ||
        k.includes('precio') ||
        k.includes('total') ||
        k.includes('cobrado')
      );
    }

    // Código de reserva
    let rawCode = findVal((k) =>
      (k.includes('codigo') && k.includes('confirmacion')) ||
      (k.includes('numero') && k.includes('reserva')) ||
      k.includes('codigo') ||
      k.includes('confirmation') ||
      k.includes('book number')
    );

    // Fallbacks si no se encontraron por nombres exactos
    if (!rawProp && entries[0]) rawProp = entries[0][1];
    if (!rawGuest && entries[1]) rawGuest = entries[1][1];

    const amountVal = parseCurrencyNumber(rawAmount);
    if (amountVal <= 0) continue;

    rows.push({
      propertyName: String(rawProp || 'Alojamiento Turístico').trim(),
      guestName: String(rawGuest || 'Huésped Particular').trim(),
      guestFiscalId: rawDni ? String(rawDni).trim() : undefined,
      guestAddress: rawAddr ? String(rawAddr).trim() : undefined,
      stayStartDate: normalizeDateString(String(rawIn || ''), isAirbnb),
      stayEndDate: normalizeDateString(String(rawOut || ''), isAirbnb),
      totalAmount: Math.round(amountVal * 100) / 100,
      reservationCode: rawCode ? String(rawCode).replace(/\.0$/, '').trim() : undefined,
    });
  }

  return rows;
}

/**
 * Parsea CSV de reservas (plantilla Turnexo, Airbnb o Booking)
 */
export function parseReservationsCsv(text: string): ImportedReservationRow[] {
  if (!text || !text.trim()) return [];

  // 1. Intentar primero con SheetJS que maneja comillas y saltos de línea multilínea dentro de celdas
  try {
    const wb = XLSX.read(text, { type: 'string', raw: true });
    const firstSheetName = wb.SheetNames[0];
    if (firstSheetName && wb.Sheets[firstSheetName]) {
      const sheetRows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[firstSheetName]);
      const res = parseReservationsFromSheetRows(sheetRows);
      if (res.length > 0) return res;
    }
  } catch {
    // Seguir al parser manual si SheetJS falla
  }

  // Limpiar BOM si existe
  const cleanText = text.replace(/^\uFEFF/, '').trim();
  const lines = splitCsvLines(cleanText);
  if (lines.length < 2) return [];

  // Detectar delimitador (punto y coma, tabulador o coma)
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

  // Función auxiliar para parsear línea respetando comillas
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headerCols = parseLine(firstLine).map((h) =>
    h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  );

  // Mapear índices de columnas de forma flexible (compatible con Booking.com, Airbnb y Plantilla Turnexo)
  let propIdx = headerCols.findIndex((h) =>
    h.includes('alojamiento') ||
    h.includes('listing') ||
    h.includes('propiedad') ||
    h.includes('habitacion') ||
    h.includes('room')
  );

  let guestIdx = headerCols.findIndex((h) =>
    h.includes('titular') ||
    h.includes('huesped') ||
    h.includes('viajero') ||
    h.includes('guest') ||
    (h.includes('cliente') && !h.includes('genius')) ||
    (h.includes('nombre') && !h.includes('alojamiento') && !h.includes('propiedad') && !h.includes('habitacion'))
  );

  let dniIdx = headerCols.findIndex((h) =>
    h.includes('dni') || h.includes('nif') || h.includes('cif') || h.includes('fiscal') || h.includes('identificacion')
  );

  let addrIdx = headerCols.findIndex((h) =>
    h.includes('direccion') || h.includes('address') || h.includes('domicilio') || h.includes('ubicacion')
  );

  let checkInIdx = headerCols.findIndex((h) =>
    h.includes('entrada') || h.includes('check-in') || h.includes('checkin') || h.includes('llegada') || h.includes('start')
  );

  let checkOutIdx = headerCols.findIndex((h) =>
    h.includes('salida') || h.includes('check-out') || h.includes('checkout') || h.includes('departure') || h.includes('end')
  );

  let amountIdx = headerCols.findIndex((h) =>
    h.includes('importe') || h.includes('amount') || h.includes('precio') || h.includes('total') || h.includes('earnings') || h.includes('cobrado')
  );

  let resCodeIdx = headerCols.findIndex((h) =>
    (h.includes('numero') && h.includes('reserva')) ||
    h.includes('codigo') ||
    h.includes('confirmation') ||
    h.includes('book number')
  );

  let statusIdx = headerCols.findIndex((h) => h.includes('estado') || h.includes('status'));

  // Fallbacks si no se encontraron columnas por nombre
  if (guestIdx === -1 && headerCols.length >= 2) guestIdx = 1;
  if (propIdx === -1 && headerCols.length >= 1) propIdx = 0;
  if (checkInIdx === -1 && headerCols.length >= 5) checkInIdx = 4;
  if (checkOutIdx === -1 && headerCols.length >= 6) checkOutIdx = 5;
  if (amountIdx === -1 && headerCols.length >= 7) amountIdx = 6;

  const rows: ImportedReservationRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length === 0 || cols.every((c) => !c)) continue;

    // Si el estado es cancelado/anulado, saltar
    if (statusIdx !== -1) {
      const st = cols[statusIdx]?.toLowerCase() || '';
      if (st.includes('cancel') || st.includes('anula')) continue;
    }

    const rawProp = propIdx !== -1 ? cols[propIdx] : 'Alojamiento Turístico';
    const rawGuest = guestIdx !== -1 ? cols[guestIdx] : 'Huésped Particular';
    const rawDni = dniIdx !== -1 ? cols[dniIdx] : '';
    const rawAddr = addrIdx !== -1 ? cols[addrIdx] : '';
    const rawIn = checkInIdx !== -1 ? cols[checkInIdx] : '';
    const rawOut = checkOutIdx !== -1 ? cols[checkOutIdx] : '';
    const rawAmount = amountIdx !== -1 ? cols[amountIdx] : '0';
    const rawCode = resCodeIdx !== -1 ? cols[resCodeIdx]?.replace(/\.0$/, '') : '';

    // Normalizar importe (manejar comas decimales, signos €, espacios)
    const cleanedAmount = rawAmount.replace(/[^0-9.,]/g, '').replace(',', '.');
    const amountVal = parseFloat(cleanedAmount) || 0;
    if (amountVal <= 0) continue; // Saltear filas sin importe válido

    rows.push({
      propertyName: rawProp || 'Alojamiento Turístico',
      guestName: rawGuest || 'Huésped Particular',
      guestFiscalId: rawDni.trim() || undefined,
      guestAddress: rawAddr.trim() || undefined,
      stayStartDate: normalizeDateString(rawIn),
      stayEndDate: normalizeDateString(rawOut),
      totalAmount: Math.round(amountVal * 100) / 100,
      reservationCode: rawCode.trim() || undefined,
    });
  }

  return rows;
}

/**
 * Convierte filas importadas de CSV en Facturas oficiales correlativas
 */
export function createInvoicesFromImportedRows(
  rows: ImportedReservationRow[],
  existingInvoices: Invoice[],
  fiscalProfile: HostFiscalProfile,
  properties?: Property[]
): Invoice[] {
  // Ordenar cronológicamente por fecha de salida para que los números correlativos sigan el orden temporal de las estancias
  const sortedRows = [...rows].sort((a, b) => {
    const dateA = a.stayEndDate || a.stayStartDate;
    const dateB = b.stayEndDate || b.stayStartDate;
    return dateA.localeCompare(dateB);
  });

  let invoicePool = [...existingInvoices];
  const newInvoices: Invoice[] = [];

  for (const row of sortedRows) {
    // Si es <= 400 € y no tiene DNI, es Factura Simplificada
    const isSimplified = row.totalAmount <= SIMPLIFIED_INVOICE_MAX_AMOUNT && !row.guestFiscalId;

    const rawIssue = row.stayEndDate || new Date().toISOString().split('T')[0];
    const issueDate = /^\d{4}-\d{2}-\d{2}$/.test(rawIssue) ? rawIssue : new Date().toISOString().split('T')[0];
    const invoiceYear = parseInt(issueDate.split('-')[0] || String(new Date().getFullYear()), 10);

    const { number, series } = generateNextInvoiceNumber(invoicePool, isSimplified, invoiceYear);

    // Calcular noches
    let nights = 1;
    try {
      const start = new Date(row.stayStartDate);
      const end = new Date(row.stayEndDate);
      const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      nights = Math.max(1, diff || 1);
    } catch {
      nights = 1;
    }

    const breakdown = calculateBreakdown(row.totalAmount, fiscalProfile.defaultVatRate || 10, 0);

    // Cruzar con alojamientos existentes en el sistema por coincidencia de nombre
    const matchedProp = properties?.find((p) => {
      const pName = p.name.toLowerCase().trim();
      const rowPName = row.propertyName.toLowerCase().trim();
      return pName.includes(rowPName) || rowPName.includes(pName);
    });

    const propId = matchedProp?.id || properties?.[0]?.id || 'prop-default';
    const propName = row.propertyName || matchedProp?.name || 'Alojamiento Turístico';

    const invoice: Invoice = {
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      invoiceNumber: number,
      series,
      issueDate,
      reservationId: row.reservationCode ? `bkg-${row.reservationCode}` : 'imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      propertyId: propId,
      propertyName: propName,
      stayStartDate: row.stayStartDate,
      stayEndDate: row.stayEndDate,
      nights,
      guestName: row.guestName,
      guestFiscalId: row.guestFiscalId,
      guestAddress: row.guestAddress,
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

    newInvoices.push(invoice);
    invoicePool = [invoice, ...invoicePool];
  }

  return newInvoices;
}

/**
 * Detecta facturas mock de ejemplo o facturas corruptas generadas por desplazamientos previos de columnas
 */
export function isCorruptedOrMockInvoice(inv: Invoice): boolean {
  if (!inv) return true;
  if (['inv-101', 'inv-102', 'inv-201'].includes(inv.id)) return true;
  if (['Sophie Laurent', 'Markus Weber', 'James & Emily Carter'].includes(inv.guestName)) return true;
  if (inv.issueDate === 'Spain' || !/^\d{4}-\d{2}-\d{2}$/.test(inv.issueDate)) return true;
  if (inv.guestName === 'Edificio Vistamarina A' || inv.guestName?.includes('Planta 1')) return true;
  if (inv.stayEndDate === 'Spain' || inv.stayStartDate?.includes('Planta 1')) return true;
  if (inv.propertyName?.includes('Planta 1 Torremolinos')) return true;
  if (inv.totalAmount > 20000 && (inv.concept?.includes('1 noches') || inv.nights === 1)) return true;
  return false;
}

export const INITIAL_INVOICES: Invoice[] = [];
