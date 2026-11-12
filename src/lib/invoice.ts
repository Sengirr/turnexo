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
  const prefix = isSimplified ? `FS-${year}` : `FC-${year}`;
  const sameSeries = existingInvoices.filter((inv) =>
    inv.invoiceNumber.startsWith(prefix)
  );
  const nextNum = sameSeries.length + 1;
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
 * Parsea CSV de reservas (plantilla Turnexo, Airbnb o Booking)
 */
export function parseReservationsCsv(text: string): ImportedReservationRow[] {
  if (!text || !text.trim()) return [];

  // Limpiar BOM si existe
  const cleanText = text.replace(/^\uFEFF/, '').trim();
  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Detectar delimitador (punto y coma o coma)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

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

  // Mapear índices de columnas de forma flexible (compatible con Plantilla Turnexo, Airbnb y Booking)
  let propIdx = headerCols.findIndex((h) => h.includes('alojamiento') || h.includes('listing') || h.includes('propiedad') || h.includes('habitacion') || h.includes('room'));
  let guestIdx = headerCols.findIndex((h) => h.includes('huesped') || h.includes('guest') || h.includes('cliente') || h.includes('viajero') || h.includes('nombre'));
  let dniIdx = headerCols.findIndex((h) => h.includes('dni') || h.includes('nif') || h.includes('cif') || h.includes('fiscal') || h.includes('identificacion'));
  let addrIdx = headerCols.findIndex((h) => h.includes('direccion') || h.includes('address') || h.includes('domicilio'));
  let checkInIdx = headerCols.findIndex((h) => h.includes('entrada') || h.includes('check-in') || h.includes('checkin') || h.includes('llegada') || h.includes('start'));
  let checkOutIdx = headerCols.findIndex((h) => h.includes('salida') || h.includes('check-out') || h.includes('checkout') || h.includes('departure') || h.includes('end'));
  let amountIdx = headerCols.findIndex((h) => h.includes('importe') || h.includes('amount') || h.includes('precio') || h.includes('total') || h.includes('earnings') || h.includes('cobrado'));

  // Fallbacks si no se encontraron columnas por nombre (asumir orden estándar de plantilla)
  if (guestIdx === -1 && headerCols.length >= 2) guestIdx = 1;
  if (propIdx === -1 && headerCols.length >= 1) propIdx = 0;
  if (checkInIdx === -1 && headerCols.length >= 5) checkInIdx = 4;
  if (checkOutIdx === -1 && headerCols.length >= 6) checkOutIdx = 5;
  if (amountIdx === -1 && headerCols.length >= 7) amountIdx = 6;

  const rows: ImportedReservationRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length === 0 || cols.every((c) => !c)) continue;

    const rawProp = propIdx !== -1 ? cols[propIdx] : 'Alojamiento Turístico';
    const rawGuest = guestIdx !== -1 ? cols[guestIdx] : 'Huésped';
    const rawDni = dniIdx !== -1 ? cols[dniIdx] : '';
    const rawAddr = addrIdx !== -1 ? cols[addrIdx] : '';
    const rawIn = checkInIdx !== -1 ? cols[checkInIdx] : '';
    const rawOut = checkOutIdx !== -1 ? cols[checkOutIdx] : '';
    const rawAmount = amountIdx !== -1 ? cols[amountIdx] : '0';

    // Normalizar importe (manejar comas decimales, signos €, espacios)
    const cleanedAmount = rawAmount.replace(/[^0-9.,]/g, '').replace(',', '.');
    const amountVal = parseFloat(cleanedAmount) || 0;
    if (amountVal <= 0) continue; // Saltear filas sin importe válido

    // Normalizar fechas (soportar YYYY-MM-DD y DD/MM/YYYY)
    const normalizeDate = (dStr: string): string => {
      if (!dStr) return new Date().toISOString().split('T')[0];
      const trimmed = dStr.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
        const parts = trimmed.split('/');
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return trimmed;
    };

    rows.push({
      propertyName: rawProp || 'Alojamiento Turístico',
      guestName: rawGuest || 'Huésped Particular',
      guestFiscalId: rawDni.trim() || undefined,
      guestAddress: rawAddr.trim() || undefined,
      stayStartDate: normalizeDate(rawIn),
      stayEndDate: normalizeDate(rawOut),
      totalAmount: Math.round(amountVal * 100) / 100,
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
  defaultPropertyId?: string
): Invoice[] {
  let invoicePool = [...existingInvoices];
  const newInvoices: Invoice[] = [];

  for (const row of rows) {
    // Si es <= 400 € y no tiene DNI, es Factura Simplificada
    const isSimplified = row.totalAmount <= SIMPLIFIED_INVOICE_MAX_AMOUNT && !row.guestFiscalId;
    const { number, series } = generateNextInvoiceNumber(invoicePool, isSimplified);

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

    const invoice: Invoice = {
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      invoiceNumber: number,
      series,
      issueDate: row.stayEndDate || new Date().toISOString().split('T')[0],
      reservationId: 'imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      propertyId: defaultPropertyId || 'prop-default',
      propertyName: row.propertyName,
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

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'FS-2026-001',
    series: 'FS-2026',
    issueDate: '2026-11-03',
    reservationId: 'res-101',
    propertyId: 'prop-1',
    propertyName: 'Ático Vista Marina · Playa',
    stayStartDate: '2026-10-30',
    stayEndDate: '2026-11-03',
    nights: 4,
    guestName: 'Sophie Laurent',
    guestEmail: 'sophie.laurent@example.fr',
    isSimplified: true,
    hostName: 'Carlos Mendizábal (Particular)',
    hostFiscalId: '34892110A',
    hostAddress: 'Paseo Marítimo 42, 4ºA',
    hostPostalCode: '29602',
    hostCity: 'Marbella (Málaga)',
    concept: 'Alojamiento turístico estancia corta (4 noches)',
    totalAmount: 480.0,
    vatRate: 10,
    baseAmount: 436.36,
    vatAmount: 43.64,
    status: 'issued',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'FS-2026-002',
    series: 'FS-2026',
    issueDate: '2026-11-08',
    reservationId: 'res-102',
    propertyId: 'prop-1',
    propertyName: 'Ático Vista Marina · Playa',
    stayStartDate: '2026-11-05',
    stayEndDate: '2026-11-08',
    nights: 3,
    guestName: 'Markus Weber',
    guestEmail: 'm.weber@example.de',
    isSimplified: true,
    hostName: 'Carlos Mendizábal (Particular)',
    hostFiscalId: '34892110A',
    hostAddress: 'Paseo Marítimo 42, 4ºA',
    hostPostalCode: '29602',
    hostCity: 'Marbella (Málaga)',
    concept: 'Alojamiento turístico estancia corta (3 noches)',
    totalAmount: 375.0,
    vatRate: 10,
    baseAmount: 340.91,
    vatAmount: 34.09,
    status: 'issued',
  },
  {
    id: 'inv-201',
    invoiceNumber: 'FS-2026-003',
    series: 'FS-2026',
    issueDate: '2026-11-02',
    reservationId: 'res-201',
    propertyId: 'prop-2',
    propertyName: 'Loft Centro Histórico Catedral',
    stayStartDate: '2026-10-31',
    stayEndDate: '2026-11-02',
    nights: 2,
    guestName: 'James & Emily Carter',
    isSimplified: true,
    hostName: 'Carlos Mendizábal (Particular)',
    hostFiscalId: '34892110A',
    hostAddress: 'Paseo Marítimo 42, 4ºA',
    hostPostalCode: '29602',
    hostCity: 'Marbella (Málaga)',
    concept: 'Alojamiento turístico estancia corta (2 noches)',
    totalAmount: 260.0,
    vatRate: 10,
    baseAmount: 236.36,
    vatAmount: 23.64,
    status: 'issued',
  },
];
