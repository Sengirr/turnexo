import { Invoice, formatDisplayDate, formatInvoiceConcept } from './invoice';

export function generateInvoiceHtml(invoice: Invoice): string {
  const isSimplified = invoice.isSimplified;
  return `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; background: #ffffff; padding: 24px; max-width: 750px; margin: 0 auto; font-size: 13px; line-height: 1.5;">
      <!-- Cabecera -->
      <div style="margin-bottom: 24px; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px;">
        <h1 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px;">
          ${isSimplified ? 'FACTURA SIMPLIFICADA' : 'FACTURA'}
        </h1>
        <p style="margin: 0 0 4px 0; font-family: monospace; font-size: 13px; color: #64748b;">
          Nº: <strong style="color: #0f172a;">${invoice.invoiceNumber}</strong>
        </p>
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          Fecha de expedición: <strong style="color: #334155;">${formatDisplayDate(invoice.issueDate)}</strong>
        </p>
      </div>

      <!-- Datos Emisor y Huésped -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div>
          <p style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #94a3b8; margin: 0 0 4px 0;">Emisor / Anfitrión</p>
          <p style="font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">${invoice.hostName}</p>
          <p style="font-family: monospace; font-size: 12px; color: #475569; margin: 0 0 2px 0;">NIF/CIF: ${invoice.hostFiscalId}</p>
          <p style="color: #475569; margin: 0 0 2px 0;">${invoice.hostAddress}</p>
          <p style="color: #475569; margin: 0;">${invoice.hostPostalCode} ${invoice.hostCity}</p>
        </div>
        <div>
          <p style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #94a3b8; margin: 0 0 4px 0;">Huésped</p>
          <p style="font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">${invoice.guestName}</p>
          ${
            invoice.guestFiscalId
              ? `<p style="font-family: monospace; font-size: 12px; color: #475569; margin: 0 0 2px 0;">NIF/ID: ${invoice.guestFiscalId}</p>`
              : isSimplified
              ? `<p style="font-style: italic; font-size: 11px; color: #94a3b8; margin: 0 0 2px 0;">Identificación simplificada (RD 1619/2012 Art. 4.1)</p>`
              : `<p style="font-style: italic; font-size: 11px; color: #94a3b8; margin: 0 0 2px 0;">Particular (identificación según reserva / Registro de Viajeros)</p>`
          }
          ${invoice.guestAddress ? `<p style="color: #475569; margin: 0 0 2px 0;">${invoice.guestAddress}</p>` : ''}
          ${invoice.guestEmail ? `<p style="color: #64748b; font-size: 11px; margin: 0;">${invoice.guestEmail}</p>` : ''}
        </div>
      </div>

      <!-- Tabla Concepto -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left; font-size: 11px; color: #475569; border-bottom: 1px solid #e2e8f0;">
            <th style="padding: 10px 12px;">Concepto / Servicio</th>
            <th style="padding: 10px 12px;">Estancia</th>
            <th style="padding: 10px 12px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">
              <strong style="color: #0f172a; display: block;">${formatInvoiceConcept(invoice.concept)}</strong>
              <span style="font-size: 11px; color: #64748b;">${invoice.propertyName}</span>
            </td>
            <td style="padding: 12px; font-family: monospace; font-size: 11px; color: #475569; border-bottom: 1px solid #f1f5f9;">
              ${formatDisplayDate(invoice.stayStartDate)} al ${formatDisplayDate(invoice.stayEndDate)}
            </td>
            <td style="padding: 12px; text-align: right; font-weight: 800; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
              ${invoice.totalAmount.toFixed(2)} €
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Desglose IVA -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
        <div style="width: 260px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #475569;">
            <span>Base Imponible:</span>
            <span style="font-family: monospace; font-weight: 700;">${invoice.baseAmount.toFixed(2)} €</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #475569;">
            <span>IVA devengado (${invoice.vatRate}%):</span>
            <span style="font-family: monospace; font-weight: 700;">${invoice.vatAmount.toFixed(2)} €</span>
          </div>
          ${
            invoice.touristTaxAmount && invoice.touristTaxAmount > 0
              ? `<div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #475569;">
                  <span>Tasa turística:</span>
                  <span style="font-family: monospace; font-weight: 700;">${invoice.touristTaxAmount.toFixed(2)} €</span>
                </div>`
              : ''
          }
          <div style="display: flex; justify-content: space-between; padding: 10px 12px; background: #0f172a; color: #ffffff; border-radius: 8px; margin-top: 8px; font-weight: 800; font-size: 14px;">
            <span>TOTAL FACTURA:</span>
            <span style="font-family: monospace;">${invoice.totalAmount.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <!-- Pie Legal -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 10px; color: #94a3b8; line-height: 1.4;">
        <p style="margin: 0 0 4px 0;">* Factura expedida con arreglo a la normativa tributaria española vigente (RD 1619/2012, de 30 de noviembre). Régimen general del Impuesto sobre el Valor Añadido (IVA al tipo reducido del 10% para alojamiento turístico).</p>
        <p style="margin: 0;">Documento expedido mediante software de gestión de alojamientos turísticos Turnexo.</p>
      </div>
    </div>
  `;
}

export async function downloadSingleInvoicePdf(invoice: Invoice): Promise<void> {
  // @ts-ignore
  const html2pdf = (await import('html2pdf.js')).default;
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '750px';
  tempDiv.style.background = '#ffffff';
  tempDiv.innerHTML = generateInvoiceHtml(invoice);
  document.body.appendChild(tempDiv);

  const opt = {
    margin: 10,
    filename: `Factura_${invoice.invoiceNumber}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  };

  try {
    await html2pdf().from(tempDiv).set(opt).save();
  } finally {
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }
}
