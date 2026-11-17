import { timingSafeEqual } from 'node:crypto';
import express from 'express';
import { renderTemplate } from './ssr/entry.js';
import { renderHTMLToImage } from './ssr/html-renderer.js';
import type { ThumbnailOptions } from './types.js';

const app = express();
const PORT = process.env.PORT || 3001;
const SERVICE_TOKEN = process.env.SERVICE_TOKEN ?? '';

const MAX_WIDTH = 3840;
const MAX_HEIGHT = 2160;

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', service: 'playwright-thumbnail-service' });
});

function tokenMatches(provided: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(SERVICE_TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Only the generate-thumbnail Edge Function calls this service; it sends the
// shared SERVICE_TOKEN. Without a configured token the service refuses all work.
app.use((req, res, next) => {
  if (!SERVICE_TOKEN) {
    res.status(503).json({ error: 'Service token not configured' });
    return;
  }
  if (!tokenMatches(req.get('x-service-token') ?? '')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

function clamp(value: unknown, fallback: number, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(Math.max(n, 1), max);
}

app.post('/thumbnail/template', async (req, res): Promise<void> => {
  try {
    const { templateId, props = {}, options = {} }: { templateId: string; props: any; options: ThumbnailOptions } = req.body;

    if (!templateId) {
      res.status(400).json({ error: 'Missing required field: templateId' });
      return;
    }

    const renderOptions: ThumbnailOptions = {
      deviceScaleFactor: 0.5,
      format: 'png',
      ...options,
      width: clamp(options.width, 1280, MAX_WIDTH),
      height: clamp(options.height, 720, MAX_HEIGHT),
    };

    const html = renderTemplate({
      templateId,
      props,
      width: renderOptions.width!,
      height: renderOptions.height!,
    });

    const imageBuffer = await renderHTMLToImage(html, renderOptions);

    res.set({
      'Content-Type': `image/${renderOptions.format}`,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'no-store',
    });
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error generating SSR template thumbnail:', error);
    res.status(500).json({ error: 'Failed to generate thumbnail' });
  }
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Playwright Thumbnail Service running on port ${PORT}`);
  if (!SERVICE_TOKEN) console.warn('SERVICE_TOKEN is not set; every render request will be refused.');
});

export default app;
