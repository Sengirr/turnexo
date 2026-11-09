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
  guestFiscalId?: string; // DNI/NIF/Pasaporte (opcional para simplificada < 3.000€)
  guestAddress?: string; // Opcional para simplificada
  isSimplified: boolean; // true si es Factura Simplificada (< 3.000€, RD 1619/2012 Art. 4)
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
    inv.isSimplified ? 'Simplificada (<3000€)' : 'Completa',
    inv.issueDate,
    inv.stayStartDate,
    inv.stayEndDate,
    `"${inv.propertyName.replace(/"/g, '""')}"`,
    `"${inv.guestName.replace(/"/g, '""')}"`,
    inv.guestFiscalId || 'No requerido (<3000€)',
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
