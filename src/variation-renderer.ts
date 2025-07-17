import { chromium, Browser } from 'playwright';
import type { ThumbnailOptions } from './types.js';

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

export interface VariationRenderOptions extends ThumbnailOptions {
  highlightChanges?: boolean;
  fullPage?: boolean;
}

export interface DesignSystem {
  css?: string;
  fonts?: Array<{ url: string; family?: string }>;
  colorPalette?: Record<string, string | Record<string, string>>;
  typography?: Record<string, string | number>;
}

export interface VariationChange {
  selector?: string;
  changeType?: string;
  originalContent?: string;
  newContent?: string;
  rationale?: string;
}

export interface VariationRenderRequest {
  modifiedHtml: string;
  originalHtml?: string;
  designSystem?: DesignSystem;
  changes?: VariationChange[];
  options?: VariationRenderOptions;
}

export interface ComparisonRenderRequest {
  originalHtml: string;
  modifiedHtml: string;
  designSystem?: DesignSystem;
  changes?: VariationChange[];
  options?: VariationRenderOptions;
}

/**
 * Renders a CRO variation with design system applied
 */
export async function renderVariation(
  request: VariationRenderRequest
): Promise<Buffer> {
  const {
    modifiedHtml,
    designSystem = {},
    changes = [],
    options = {}
  } = request;

  const {
    width = 1440,
    height = 900,
    format = 'png',
    quality = 90,
    highlightChanges = false,
    fullPage = false
  } = options;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set viewport
    await page.setViewportSize({ width, height });

    // Process HTML to highlight changes if requested
    let processedHtml = modifiedHtml;
    if (highlightChanges && changes.length > 0) {
      processedHtml = addChangeHighlights(modifiedHtml, changes);
    }

    // Create full HTML document with design system
    const html = createFullHtml(processedHtml, designSystem, { width, height });

    // Set content and wait for rendering
    await page.setContent(html, { 
      waitUntil: 'networkidle'
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for images
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise((resolve) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve);
            setTimeout(resolve, 5000);
          }))
      );
    });

    // Stabilization delay
    await page.waitForTimeout(500);

    // Take screenshot
    const screenshotOptions: any = {
      type: format,
      fullPage
    };

    if (!fullPage) {
      screenshotOptions.clip = { x: 0, y: 0, width, height };
    }

    if (format === 'jpeg') {
      screenshotOptions.quality = quality;
    }

    return await page.screenshot(screenshotOptions);

  } finally {
    await page.close();
  }
}

/**
 * Renders a side-by-side comparison of control vs variation
 */
export async function renderComparison(
  request: ComparisonRenderRequest
): Promise<Buffer> {
  const {
    originalHtml,
    modifiedHtml,
    designSystem = {},
    changes = [],
    options = {}
  } = request;

  const {
    width = 2880, // Double width for side-by-side
    height = 900,
    format = 'png',
    quality = 90
  } = options;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set viewport
    await page.setViewportSize({ width, height });

    // Create side-by-side comparison HTML
    const comparisonHtml = `
      <div style="display: flex; width: 100%; height: 100%;">
        <div style="width: 50%; height: 100%; position: relative; overflow: hidden; border-right: 2px solid #e5e7eb;">
          <div style="position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; z-index: 1000;">
            Control (Original)
          </div>
          <iframe 
            srcdoc="${escapeHtml(createFullHtml(originalHtml, designSystem, { width: width/2, height }))}"
            style="width: 100%; height: 100%; border: none;"
            sandbox="allow-same-origin allow-scripts"
          ></iframe>
        </div>
        <div style="width: 50%; height: 100%; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; z-index: 1000;">
            Variation
          </div>
          <iframe 
            srcdoc="${escapeHtml(createFullHtml(modifiedHtml, designSystem, { width: width/2, height }))}"
            style="width: 100%; height: 100%; border: none;"
            sandbox="allow-same-origin allow-scripts"
          ></iframe>
        </div>
      </div>
    `;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; width: ${width}px; height: ${height}px; overflow: hidden; }
          </style>
        </head>
        <body>
          ${comparisonHtml}
        </body>
      </html>
    `;

    // Set content and wait
    await page.setContent(html, { 
      waitUntil: 'networkidle'
    });

    // Wait for iframes to load
    await page.waitForTimeout(2000);

    // Take screenshot
    const screenshotOptions: any = {
      type: format,
      clip: { x: 0, y: 0, width, height }
    };

    if (format === 'jpeg') {
      screenshotOptions.quality = quality;
    }

    return await page.screenshot(screenshotOptions);

  } finally {
    await page.close();
  }
}

/**
 * Batch render multiple variations
 */
export async function renderBatch(
  variations: Array<VariationRenderRequest & { id: string }>
): Promise<Array<{ id: string; success: boolean; buffer?: Buffer; error?: string }>> {
  const results = [];

  for (const variation of variations) {
    try {
      const buffer = await renderVariation(variation);
      results.push({
        id: variation.id,
        success: true,
        buffer
      });
    } catch (error) {
      console.error(`Error rendering variation ${variation.id}:`, error);
      results.push({
        id: variation.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

/**
 * Creates a full HTML document with design system applied
 */
function createFullHtml(content: string, designSystem: DesignSystem, dimensions: { width: number; height: number }): string {
  const { css = '', fonts = [], colorPalette = {}, typography = {} } = designSystem;

  // Extract font links
  const fontLinks = fonts.map(font => {
    if (font.url) {
      return `<link href="${font.url}" rel="stylesheet">`;
    }
    return '';
  }).join('\n');

  // Generate CSS variables from design tokens
  const cssVariables = generateCSSVariables(colorPalette, typography);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${fontLinks}
        <style>
          /* Reset styles */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          /* Apply dimensions */
          html, body {
            width: ${dimensions.width}px;
            min-height: ${dimensions.height}px;
            overflow-x: hidden;
          }
          
          /* Design system variables */
          :root {
            ${cssVariables}
          }
          
          /* Original page CSS */
          ${css}
          
          /* Ensure proper font rendering */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Change highlight styles */
          .cro-change-highlight {
            position: relative;
            outline: 2px dashed #3b82f6 !important;
            outline-offset: 2px;
          }
          
          .cro-change-indicator {
            position: absolute;
            top: -20px;
            right: 0;
            background: #3b82f6;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            z-index: 10000;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}

/**
 * Generates CSS variables from design tokens
 */
function generateCSSVariables(colorPalette: Record<string, any>, typography: Record<string, any>): string {
  const variables: string[] = [];

  // Add color variables
  Object.entries(colorPalette).forEach(([key, value]) => {
    if (typeof value === 'string') {
      variables.push(`--color-${key}: ${value};`);
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([shade, color]) => {
        variables.push(`--color-${key}-${shade}: ${color};`);
      });
    }
  });

  // Add typography variables
  Object.entries(typography).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      variables.push(`--typography-${key}: ${value};`);
    }
  });

  return variables.join('\n    ');
}

/**
 * Adds visual highlights to changed elements
 */
function addChangeHighlights(html: string, changes: VariationChange[]): string {
  let processedHtml = html;

  changes.forEach((change, index) => {
    if (change.selector) {
      // Add a marker comment that we'll replace after parsing
      const marker = `<!-- CRO_CHANGE_${index} -->`;

      // Try to find and mark the element
      // This is a simplified approach - in production, you'd use a proper HTML parser
      const selectorPattern = new RegExp(`(<${change.selector}[^>]*>)`, 'gi');
      processedHtml = processedHtml.replace(selectorPattern, (match) => {
        return `${marker}${match}`;
      });
    }
  });

  // Replace markers with actual highlight elements
  changes.forEach((change, index) => {
    const marker = `<!-- CRO_CHANGE_${index} -->`;
    const highlightHtml = `
      <div class="cro-change-highlight" style="display: inline-block; position: relative;">
        <span class="cro-change-indicator">${change.changeType || 'Changed'}</span>
    `;
    processedHtml = processedHtml.replace(marker, highlightHtml);
  });

  return processedHtml;
}

/**
 * Escapes HTML for safe embedding in srcdoc
 */
function escapeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
