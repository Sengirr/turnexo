import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ical-proxy',
      configureServer(server) {
        server.middlewares.use('/api/fetch-ical', async (req, res) => {
          try {
            const urlObj = new URL(req.url || '', 'http://localhost');
            const targetUrl = urlObj.searchParams.get('url');
            if (!targetUrl) {
              res.statusCode = 400;
              res.end('Missing url param');
              return;
            }
            const response = await fetch(targetUrl, {
              headers: { 'User-Agent': 'HostPilot-iCal-Sync/1.0' },
            });
            const text = await response.text();
            res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
            res.statusCode = 200;
            res.end(text);
          } catch (err: any) {
            res.statusCode = 500;
            res.end(err?.message || 'Error fetching iCal');
          }
        });
      },
    },
  ],
});

