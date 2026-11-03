/**
 * Serverless Function (/api/fetch-ical?url=...) para Producción (Vercel / Cloudflare)
 * Permite leer calendarios .ics de Airbnb y Booking bajo demanda con caché HTTP de 30 minutos (coste 0€).
 */
export default async function handler(req: any, res: any) {
  const targetUrl = req.query?.url;

  if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.startsWith('http')) {
    res.status(400).json({ error: 'Parámetro url (.ics) inválido o ausente' });
    return;
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Turnexo-iCal-Sync/1.0 (+https://turnexo.com)',
        Accept: 'text/calendar, text/plain, */*',
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: `El servidor iCal respondió con estado ${upstream.status}`,
      });
      return;
    }

    const icsBody = await upstream.text();

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
