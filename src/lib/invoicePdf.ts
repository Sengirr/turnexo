import {
  Invoice,
  formatDisplayDate,
  formatInvoiceConcept,
  getInvoiceBookingRef,
  getInvoiceChannel,
} from './invoice';

function escapeHtml(value: string | undefined | null): string {
  if (!value) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateInvoiceHtml(invoice: Invoice): string {
  const isSimplified = invoice.isSimplified;
  const hostName = escapeHtml(invoice.hostName);
  const hostFiscalId = escapeHtml(invoice.hostFiscalId);
  const hostAddress = escapeHtml(invoice.hostAddress);
  const hostPostalCode = escapeHtml(invoice.hostPostalCode);
  const hostCity = escapeHtml(invoice.hostCity);
  const propertyName = escapeHtml(invoice.propertyName);
  const invoiceNumber = escapeHtml(invoice.invoiceNumber);
  const issueDate = escapeHtml(formatDisplayDate(invoice.issueDate));
  const bookingRef = escapeHtml(getInvoiceBookingRef(invoice));
  const channel = escapeHtml(getInvoiceChannel(invoice));
  const guestName = escapeHtml(invoice.guestName);
  const guestFiscalId = escapeHtml(invoice.guestFiscalId);
  const guestAddress = escapeHtml(invoice.guestAddress);
  const guestEmail = escapeHtml(invoice.guestEmail);
  const stayStart = escapeHtml(formatDisplayDate(invoice.stayStartDate));
  const stayEnd = escapeHtml(formatDisplayDate(invoice.stayEndDate));

  return `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; background: #ffffff; padding: 24px; max-width: 750px; margin: 0 auto; font-size: 12px; line-height: 1.5;">
      <!-- Barra superior verde azulado IVI -->
      <div style="height: 10px; background-color: #0e6f68; width: 100%; margin-bottom: 24px; border-radius: 4px;"></div>

      <!-- Cabecera: Emisor / Arrendador (Izq) y Factura de Hospedaje (Der) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: flex-start;">
        <div style="font-size: 11px; color: #334155; line-height: 1.5;">
          <p style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin: 0 0 4px 0; letter-spacing: 0.5px;">EMISOR / ARRENDADOR:</p>
          <p style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 3px 0;">${hostName}</p>
          <p style="font-family: monospace; font-size: 11px; color: #475569; margin: 0 0 2px 0;">NIF / CIF: ${hostFiscalId}</p>
          <p style="color: #475569; margin: 0 0 2px 0;">Domicilio Fiscal: ${hostAddress}, ${hostPostalCode} ${hostCity} (ES)</p>
          <p style="color: #475569; margin: 0;">Inmueble: <strong style="color: #0f172a;">${propertyName}</strong></p>
        </div>
        <div style="text-align: right; font-size: 11px; color: #475569;">
          <h1 style="font-size: 22px; font-weight: 900; color: #0e6f68; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: -0.5px;">FACTURA DE HOSPEDAJE</h1>
          <p style="margin: 0 0 3px 0;">Nº Factura: <strong style="color: #0f172a; font-family: monospace; font-size: 12px;">${invoiceNumber}</strong></p>
          <p style="margin: 0 0 3px 0;">Fecha de Emisión: <strong style="color: #334155;">${issueDate}</strong></p>
          <p style="margin: 0 0 3px 0;">Localizador: <strong style="color: #334155; font-family: monospace;">${bookingRef}</strong></p>
          <p style="margin: 0;">Canal de Reserva: <strong style="color: #334155;">${channel}</strong></p>
        </div>
      </div>

      <!-- Línea divisoria horizontal -->
      <div style="border-bottom: 2px solid #0f172a; margin: 16px 0 20px 0;"></div>

      <!-- Datos del Cliente / Huésped (Receptor) -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
        <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #0e6f68; margin: 0 0 4px 0; letter-spacing: 0.5px;">DATOS DEL CLIENTE / HUÉSPED (RECEPTOR)</p>
        <p style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">${guestName}</p>
        ${
          guestFiscalId
            ? `<p style="font-family: monospace; font-size: 11px; color: #475569; margin: 0 0 2px 0;">NIF / ID: ${guestFiscalId}</p>`
            : isSimplified
            ? `<p style="font-style: italic; font-size: 11px; color: #94a3b8; margin: 0 0 2px 0;">Particular (identificación según reserva / Registro de Viajeros)</p>`
            : `<p style="font-style: italic; font-size: 11px; color: #b45309; margin: 0 0 2px 0;">Particular (sin NIF registrado en plataforma)</p>`
        }
        ${guestAddress ? `<p style="font-size: 11px; color: #475569; margin: 0 0 2px 0;">Domicilio: ${guestAddress}</p>` : ''}
        ${guestEmail ? `<p style="font-size: 11px; color: #64748b; margin: 0;">${guestEmail}</p>` : ''}
      </div>

      <!-- Tabla de Servicios estilo IVI -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 12px;">
        <thead>
          <tr style="background-color: #0e6f68; color: #ffffff; text-align: left; font-size: 11px; font-weight: 800;">
            <th style="padding: 10px 12px;">Descripción del Servicio</th>
            <th style="padding: 10px 12px; text-align: center;">Tipo IVA</th>
            <th style="padding: 10px 12px; text-align: right;">Base Imponible</th>
            <th style="padding: 10px 12px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background-color: #ffffff;">
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">
              <strong style="color: #0f172a; display: block; font-size: 12px;">Servicio de alojamiento turístico en ${propertyName}</strong>
              <span style="font-size: 11px; color: #64748b; display: block; margin-top: 3px;">Entrada: ${stayStart} — Salida: ${stayEnd}</span>
            </td>
            <td style="padding: 12px; text-align: center; color: #334155; border-bottom: 1px solid #f1f5f9;">
              ${invoice.vatRate}%
            </td>
            <td style="padding: 12px; text-align: right; font-family: monospace; color: #334155; border-bottom: 1px solid #f1f5f9;">
              ${invoice.baseAmount.toFixed(2)} €
            </td>
            <td style="padding: 12px; text-align: right; font-weight: 800; font-family: monospace; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
              ${invoice.totalAmount.toFixed(2)} €
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Bloque inferior: Estado del Pago a la izq y Totales a la der -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: flex-start; margin-bottom: 24px;">
        <div style="font-size: 11px; color: #475569; line-height: 1.5;">
          <p style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #0e6f68; margin: 0 0 4px 0; letter-spacing: 0.5px;">ESTADO DEL PAGO:</p>
          <p style="margin: 0 0 3px 0; color: #1e293b; font-weight: 600;">Cobrado y confirmado a través de plataforma (${channel}).</p>
          <p style="margin: 0; color: #64748b;">Importe íntegro satisfecho con anterioridad o durante la estancia.</p>
        </div>
        <div>
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #f8fafc;">
            <div style="padding: 10px 14px; font-size: 11px; color: #475569;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>Base Imponible:</span>
                <span style="font-family: monospace; font-weight: 700; color: #0f172a;">${invoice.baseAmount.toFixed(2)} €</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>IVA Alojamiento Turístico (${invoice.vatRate}%):</span>
                <span style="font-family: monospace; font-weight: 700; color: #0f172a;">${invoice.vatAmount.toFixed(2)} €</span>
              </div>
              ${
                invoice.touristTaxAmount && invoice.touristTaxAmount > 0
                  ? `<div style="display: flex; justify-content: space-between; margin-top: 4px;">
                      <span>Tasa turística:</span>
                      <span style="font-family: monospace; font-weight: 700; color: #0f172a;">${invoice.touristTaxAmount.toFixed(2)} €</span>
                    </div>`
                  : ''
              }
            </div>
            <div style="background-color: #0e6f68; color: #ffffff; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; font-weight: 800;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL FACTURA:</span>
              <span style="font-size: 15px; font-family: monospace;">${invoice.totalAmount.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pie Legal -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; line-height: 1.4;">
        <p style="margin: 0;">* Factura de hospedaje expedida con arreglo a la normativa tributaria española vigente (RD 1619/2012, de 30 de noviembre). Régimen general del Impuesto sobre el Valor Añadido (IVA al tipo reducido del 10% para alojamiento turístico).</p>
      </div>
    </div>
  `;
}

export async function downloadSingleInvoicePdf(invoice: Invoice): Promise<void> {
  // Carga dinámica de html2canvas y jsPDF para máxima fiabilidad y rendimiento
  // @ts-ignore
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  // Crear contenedor temporal A4 en el DOM asegurando posición en viewport
  const container = document.createElement('div');
  container.innerHTML = generateInvoiceHtml(invoice);
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '794px'; // Ancho A4 a 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '999999';
  container.style.pointerEvents = 'none';
  container.style.boxSizing = 'border-box';
  document.body.appendChild(container);

  try {
    // Pausa breve para renderizado de fuentes del sistema y estilos
    await new Promise((resolve) => setTimeout(resolve, 80));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: 794,
      windowWidth: 794,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
    pdf.save(`Factura_${invoice.invoiceNumber}.pdf`);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
