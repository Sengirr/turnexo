/**
 * Serverless Function (/api/fetch-ical?url=...) para Producción (Vercel / Cloudflare)
 * Permite leer calendarios .ics de Airbnb y Booking bajo demanda con caché HTTP de 30 minutos (coste 0€).
 * Incluye validación anti-SSRF (solo HTTPS público y dominios/rutas iCal válidas).
 */

const PRIVATE_OR_LOCAL_HOST_REGEX =
  /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|0\.0\.0\.0|\[?::1\]?|\[?fe80:.*|\[?fc00:.*|.*\.local|.*\.internal)$/i;

const ALLOWED_ICAL_DOMAINS = [
  'airbnb.',
  'booking.com',
  'vrbo.com',
  'homeaway.',
  'calendar.google.com',
  'outlook.live.com',
  'outlook.office365.com',
  'icloud.com',
  'beds24.com',
  'smoobu.com',
  'lodgify.com',
  'avantio.com',
  'hospitable.com',
  'guesty.com',
  'escapia.com',
  'tripadvisor.',
  'holidu.',
];

function isAllowedIcalUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') return false;

  const host = parsed.hostname.toLowerCase();
  if (!host || PRIVATE_OR_LOCAL_HOST_REGEX.test(host)) return false;

  // Bloquear credenciales embebidas en la URL
  if (parsed.username || parsed.password) return false;

  const isKnownProvider = ALLOWED_ICAL_DOMAINS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`) || host.includes(domain)
  );
  const pathLower = `${parsed.pathname}${parsed.search}`.toLowerCase();
  const looksLikeIcalPath =
    pathLower.includes('.ics') || pathLower.includes('ical') || pathLower.includes('calendar');

  return isKnownProvider || looksLikeIcalPath;
}

export default async function handler(req: any, res: any) {
  const targetUrl = req.query?.url;

  if (!targetUrl || typeof targetUrl !== 'string' || !isAllowedIcalUrl(targetUrl)) {
    res.status(400).json({ error: 'URL iCal inválida o no permitida (debe ser HTTPS público de calendario)' });
    return;
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Turnexo-iCal-Sync/1.0 (+https://turnexo.app)',
        Accept: 'text/calendar, text/plain, */*',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: `El servidor iCal respondió con estado ${upstream.status}`,
      });
      return;
    }

    const icsBody = await upstream.text();
    if (icsBody.length > 5 * 1024 * 1024) {
      res.status(413).json({ error: 'El calendario iCal excede el tamaño máximo permitido (5 MB)' });
      return;
    }

    // Caché en CDN de 30 minutos (1800s) para que múltiples aperturas no consuman ejecuciones
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    res.status(200).send(icsBody);
  } catch (err: any) {
    res.status(500).json({
      error: 'Error al descargar el calendario iCal',
      details: err?.message || 'Unknown error',
    });
  }
}
