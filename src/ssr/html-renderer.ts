import { chromium, Browser } from 'playwright';
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
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials',
      ]
    });
  }
  return browser;
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
