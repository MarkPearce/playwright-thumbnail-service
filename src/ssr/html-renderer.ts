import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { chromium, Browser, Route } from 'playwright';
import type { ThumbnailOptions } from '../types.js';

let browser: Browser | null = null;

// Get or create browser instance
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--deterministic-fetch',
      ]
    });
  }
  return browser;
}

const BLOCKED_V4: Array<[number, number]> = [
  [0x00000000, 8], [0x0a000000, 8], [0x64400000, 10], [0x7f000000, 8],
  [0xa9fe0000, 16], [0xac100000, 12], [0xc0000000, 24], [0xc0a80000, 16],
  [0xc6120000, 15], [0xe0000000, 4], [0xf0000000, 4],
];

function isPublicV4(ip: string): boolean {
  const n = ip.split('.').reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
  return !BLOCKED_V4.some(([base, bits]) => (n >>> (32 - bits)) === (base >>> (32 - bits)));
}

function isPublicAddress(ip: string): boolean {
  if (isIP(ip) === 4) return isPublicV4(ip);
  const v6 = ip.toLowerCase();
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPublicV4(mapped[1]);
  // WHATWG URL parsing rewrites [::ffff:127.0.0.1] as [::ffff:7f00:1].
  const mappedHex = v6.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16);
    const lo = parseInt(mappedHex[2], 16);
    return isPublicV4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  return !(
    v6 === '::' || v6 === '::1' || v6.startsWith('::ffff:') || v6.startsWith('64:ff9b:') ||
    /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6) || v6.startsWith('ff')
  );
}

// Slide HTML may reference any public image or embed (AMBOSS media, YouTube,
// Google Fonts, Supabase storage). Requests to loopback, private, link-local
// and metadata addresses are refused so a render can't reach internal services.
async function guardRequest(route: Route): Promise<void> {
  try {
    const url = new URL(route.request().url());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return route.abort('blockedbyclient');
    const host = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address);
    if (addresses.length === 0 || !addresses.every(isPublicAddress)) return route.abort('blockedbyclient');
    return route.continue();
  } catch {
    return route.abort('blockedbyclient');
  }
}

/**
 * Renders HTML to an image buffer using Playwright
 * @param html - Complete HTML document as string
 * @param options - Rendering options (width, height, etc.)
 * @returns Image buffer
 */
export async function renderHTMLToImage(
  html: string,
  options: ThumbnailOptions
): Promise<Buffer> {
  const {
    width = 1280,
    height = 720,
    format = 'png',
    quality = 90
  } = options;
  
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.route('**/*', guardRequest);

  try {
    // Set viewport
    await page.setViewportSize({ width, height });
    
    // Set content and wait for rendering
    await page.setContent(html, { 
      waitUntil: 'networkidle'
    });
    
    // Wait for fonts to load
    await page.evaluate(() => {
      return document.fonts.ready;
    });
    
    // Wait for all images to load
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise((resolve) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve); // Resolve even on error
            // Set timeout to prevent hanging
            setTimeout(resolve, 5000);
          }))
      );
    });
    
    // Add slight delay for layout stabilization
    await page.waitForTimeout(500);
    
    // Take screenshot
    const screenshotOptions: any = {
      type: format,
      clip: {
        x: 0,
        y: 0,
        width,
        height
      }
    };
    
    if (format === 'jpeg') {
      screenshotOptions.quality = quality;
    }
    
    const imageBuffer = await page.screenshot(screenshotOptions);
    
    return imageBuffer;
    
  } finally {
    await page.close();
  }
}

// Cleanup function
export async function cleanup() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
