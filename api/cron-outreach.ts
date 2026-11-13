import crypto from 'node:crypto';

/**
 * Serverless Function (/api/cron-outreach)
 * Envía automáticamente un lote diario (por defecto 6) de leads `pendiente`
 * desde `info@turnexo.app` usando Hostinger Mail API y los marca como `enviado` en Supabase.
 *
 * Acepta:
 * - POST desde /admin autenticado con token HMAC (ADMIN_PASSWORD)
 * - GET desde Vercel Cron (verificando CRON_SECRET si existe, o cabecera x-vercel-cron)
 *
 * Variables requeridas en Vercel:
 * - HOSTINGER_MAIL_API_KEY
 * - SUPABASE_URL (o VITE_SUPABASE_URL)
 * - SUPABASE_SERVICE_ROLE_KEY
 * - ADMIN_PASSWORD
 */

function verifyAdminToken(authHeader: string | undefined, secret: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;

  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function buildSubject(kind: 'initial' | 'followup', segment?: string): string {
  if (segment === 'propietario') {
    return kind === 'followup'
      ? 'Re: IVA del 10% en tu vivienda turística (calculadora gratuita)'
      : 'IVA del 10% en tu vivienda turística (calculadora gratuita)';
  }
  return kind === 'followup'
    ? 'Re: Nuevo IVA 10% en alquiler vacacional'
    : 'Nuevo IVA 10% en alquiler vacacional';
}

function buildEmailBody(companyName: string, city?: string, segment?: string): string {
  const area = city && city.trim() ? city.trim() : 'la zona';
  if (segment === 'propietario') {
    return [
      `Hola (${companyName}),`,
      '',
      `Te escribo brevemente por tu alojamiento turístico en ${area}.`,
      '',
      'Con la entrada en vigor del IVA del 10% este 1 de diciembre, muchos propietarios nos preguntaban cuánto van a pagar realmente en Hacienda al deducirse el 21% de Booking/Airbnb, limpieza y suministros.',
      '',
      'Hemos preparado una calculadora gratuita para que metas tus números y veas en 5 segundos cuánto te queda limpio por reserva o al mes (sin necesidad de registro):',
      'https://turnexo.app/calculadora-iva-alquiler-vacacional',
      '',
      'Y si luego necesitas emitir las facturas legales al 10% desde tu CSV de Airbnb o Booking en 1 clic, en Turnexo es gratis para 1 alojamiento.',
      '',
      'Un saludo,',
      'Iván Álvarez · Turnexo',
    ].join('\n');
  }
  return [
    `Hola equipo de ${companyName},`,
    '',
    `¿Lleváis clientes particulares con viviendas turísticas en ${area}?`,
    '',
    'Con la entrada en vigor del IVA del 10% este 1 de diciembre, muchos propietarios os van a empezar a mandar extractos sueltos de Airbnb y Booking sin saber emitir la factura de cada estancia para el Modelo 303.',
    '',
    'En Turnexo hemos hecho una herramienta muy simple para que el propio propietario suba su Excel/CSV de Airbnb o Booking y genere en 1 clic todas las facturas legales al 10% + el resumen listo para entregaros (gratis para 1 alojamiento).',
    '',
    'Si tenéis algún cliente que os dé guerra con los extractos, ¿os paso el enlace para que se lo podáis recomendar directamente? A la asesoría no os cuesta nada.',
    '',
    'Un saludo,',
    'Iván Álvarez · Turnexo',
  ].join('\n');
}

function buildFollowupBody(companyName: string, city?: string, segment?: string): string {
  const area = city && city.trim() ? city.trim() : 'la zona';
  if (segment === 'propietario') {
    return [
      `Hola de nuevo (${companyName}):`,
      '',
      `Te subo este correo por si no lo viste. De cara al IVA del 10% del 1 de diciembre en ${area}, te dejo la calculadora gratuita para simular tus gastos deducibles (Booking/Airbnb, limpieza, luz) frente al 10%:',
      'https://turnexo.app/calculadora-iva-alquiler-vacacional',
      '',
      'Y si quieres sacar todas tus facturas desde el CSV sin hacerlo a mano, en Turnexo tienes 1 alojamiento gratis.',
      '',
      'Un saludo,',
      'Iván Álvarez · Turnexo',
    ].join('\n');
  }
  return [
    `Hola de nuevo, equipo de ${companyName}:`,
    '',
    `Os subo este correo por si quedó abajo con el lío de la semana. Con la entrada del IVA del 10% el 1 de diciembre, si algún cliente con pisos turísticos en ${area} os pregunta cómo sacar las facturas legales de Airbnb o Booking para el Modelo 303, Turnexo lo hace en 1 clic (gratis para 1 alojamiento).`,
    '',
    'Si queréis, os paso el enlace para que se lo reenviéis directamente cuando os pregunten.',
    '',
    'Un saludo,',
    'Iván Álvarez · Turnexo',
  ].join('\n');
}

async function resolveMailboxId(mailApiKey: string): Promise<string | null> {
  if (process.env.HOSTINGER_MAILBOX_ID) {
    return process.env.HOSTINGER_MAILBOX_ID;
  }
  const resp = await fetch('https://api.mail.hostinger.com/api/v1/me', {
    headers: { Authorization: `Bearer ${mailApiKey}` },
  });
  if (!resp.ok) return null;
  const data = (await resp.json()) as any;
  return data?.data?.mailboxes?.[0]?.resourceId || null;
}

export default async function handler(req: any, res: any) {
  const adminSecret = process.env.ADMIN_PASSWORD || '';
  const cronSecret = process.env.CRON_SECRET || '';
  const authHeader = req.headers?.authorization as string | undefined;

  const isAdminPost = req.method === 'POST' && adminSecret && verifyAdminToken(authHeader, adminSecret);
  const isCronGet =
    req.method === 'GET' &&
    ((cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (!cronSecret && req.headers?.['x-vercel-cron'] === '1'));

  if (!isAdminPost && !isCronGet) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  const mailApiKey = process.env.HOSTINGER_MAIL_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!mailApiKey) {
    res.status(503).json({ error: 'Falta configurar HOSTINGER_MAIL_API_KEY en Vercel' });
    return;
  }
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(503).json({ error: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const batchLimit = Math.min(20, Math.max(1, Number(body?.limit || process.env.OUTREACH_DAILY_LIMIT || 6)));

  const sbHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };

  try {
    const mailboxId = await resolveMailboxId(mailApiKey);
    if (!mailboxId) {
      res.status(502).json({ error: 'No se pudo obtener el mailboxId de Hostinger Mail API' });
      return;
    }

    const leadsResp = await fetch(
      `${supabaseUrl}/rest/v1/outreach_leads?status=eq.pendiente&order=created_at.asc&limit=${batchLimit}`,
      { headers: sbHeaders }
    );
    if (!leadsResp.ok) {
      const errText = await leadsResp.text();
      res.status(502).json({ error: `Error leyendo leads pendientes: ${errText}` });
      return;
    }

    const pendingLeads = (await leadsResp.json()) as any[];
    const queue: Array<{ lead: any; kind: 'initial' | 'followup' }> = pendingLeads.map((lead) => ({
      lead,
      kind: 'initial',
    }));

    // Si quedan huecos en el cupo diario, enviamos 1 único follow-up a leads sin respuesta tras 4+ días
    const remainingSlots = batchLimit - queue.length;
    if (remainingSlots > 0) {
      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
      const followupResp = await fetch(
        `${supabaseUrl}/rest/v1/outreach_leads?status=eq.enviado&followup_sent_at=is.null&sent_at=lte.${encodeURIComponent(
          fourDaysAgo
        )}&order=sent_at.asc&limit=${remainingSlots}`,
        { headers: sbHeaders }
      );
      if (followupResp.ok) {
        const followupLeads = (await followupResp.json()) as any[];
        for (const lead of followupLeads) {
          queue.push({ lead, kind: 'followup' });
        }
      }
    }

    if (queue.length === 0) {
      res.status(200).json({ ok: true, sentCount: 0, message: 'No hay leads pendientes ni follow-ups.' });
      return;
    }

    const results: Array<{ email: string; kind: 'initial' | 'followup'; ok: boolean; status: number }> = [];
    let sentCount = 0;

    // Escalonado entre envíos (7.5s por defecto para 6 correos ≈ 37.5s, capado a 40s totales)
    const delayMs =
      queue.length > 1
        ? Math.min(7500, Math.floor(40000 / (queue.length - 1)))
        : 0;

    for (let i = 0; i < queue.length; i += 1) {
      const { lead, kind } = queue[i];
      const subject = buildSubject(kind, lead.segment);
      const text =
        kind === 'followup'
          ? buildFollowupBody(lead.company_name, lead.city, lead.segment)
          : buildEmailBody(lead.company_name, lead.city, lead.segment);

      const sendResp = await fetch(
        `https://api.mail.hostinger.com/api/v1/mailboxes/${encodeURIComponent(mailboxId)}/send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mailApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: [lead.email],
            displayName: 'Iván Álvarez · Turnexo',
            subject,
            text,
          }),
        }
      );

      results.push({ email: lead.email, kind, ok: sendResp.ok, status: sendResp.status });

      if (sendResp.ok) {
        sentCount += 1;
        const nowIso = new Date().toISOString();
        const patchBody =
          kind === 'followup'
            ? { followup_sent_at: nowIso }
            : { status: 'enviado', sent_at: nowIso };
        await fetch(
          `${supabaseUrl}/rest/v1/outreach_leads?id=eq.${encodeURIComponent(lead.id)}`,
          {
            method: 'PATCH',
            headers: sbHeaders,
            body: JSON.stringify(patchBody),
          }
        );
      }

      if (i < queue.length - 1 && delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    res.status(200).json({ ok: true, sentCount, results });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error ejecutando outreach' });
  }
}
