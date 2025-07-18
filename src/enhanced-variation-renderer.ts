/**
 * Enhanced Variation Renderer
 * 
 * Integrates CSS data and design intelligence for brand-aware thumbnail generation.
 */

import { chromium, Browser } from 'playwright';
import type { ThumbnailOptions } from './types.js';
import { CSSIntegrationService, EnhancedRenderOptions } from './css-integration-refactored.js';
import { 
  CSSIntegrationOptions, 
  ProcessedCSSData
} from './types/css-types.js';
import { createLogger } from './utils/logger.js';

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

export interface EnhancedVariationRenderOptions extends ThumbnailOptions {
  highlightChanges?: boolean;
  fullPage?: boolean;
  referencePageId?: string;
  cssIntegration?: CSSIntegrationOptions;
}

export interface EnhancedVariationRenderRequest {
  modifiedHtml: string;
  originalHtml?: string;
  referencePageId?: string;
  cssData?: any; // CSS data passed directly from our Supabase function
  options?: EnhancedVariationRenderOptions;
}

export interface EnhancedComparisonRenderRequest {
  originalHtml: string;
  modifiedHtml: string;
  referencePageId?: string;
  options?: EnhancedVariationRenderOptions;
}

/**
 * Renders a CRO variation with CSS data integration and brand preservation
 */
export async function renderEnhancedVariation(
  request: EnhancedVariationRenderRequest
): Promise<Buffer> {
  const {
    modifiedHtml,
    referencePageId,
    cssData,
    options = {}
  } = request;

  const {
    width = 1440,
    height = 900,
    format = 'png',
    quality = 90,
    highlightChanges = false,
    fullPage = false,
    cssIntegration = {}
  } = options;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    console.log(`[EnhancedRenderer] Starting enhanced variation rendering`);
    
    // Set viewport
    await page.setViewportSize({ width, height });

    let processedCSS: ProcessedCSSData | null = null;

    // Process CSS data if provided directly or fetch via reference page ID
    if (cssData) {
      try {
        console.log(`[EnhancedRenderer] Processing CSS data passed directly from Supabase`);
        
        const cssService = CSSIntegrationService.getInstance();
        
        // Set default CSS integration options
        const defaultCSSOptions: CSSIntegrationOptions = {
          enableDesignIntelligence: true,
          useCriticalCSSOnly: false,
          preserveBrandElements: true,
          optimizeForThumbnails: true,
          ...cssIntegration
        };

        processedCSS = await cssService.processCSSForThumbnail(
          cssData,
          modifiedHtml,
          defaultCSSOptions
        );

        console.log(`[EnhancedRenderer] CSS processing completed:`, {
          combinedCSSLength: processedCSS.combinedCSS.length,
          brandCSSLength: processedCSS.brandCSS.length,
          qualityScore: processedCSS.designIntelligence?.qualityScore || 'N/A'
        });
      } catch (error) {
        console.warn(`[EnhancedRenderer] CSS integration failed, continuing without it:`, error);
      }
    } else if (referencePageId) {
      try {
        console.log(`[EnhancedRenderer] Fetching CSS data for reference page: ${referencePageId}`);
        
        const cssService = CSSIntegrationService.getInstance();
        const fetchedCssData = await cssService.fetchCSSData(referencePageId);
        
        if (fetchedCssData) {
          // Set default CSS integration options
          const defaultCSSOptions: CSSIntegrationOptions = {
            enableDesignIntelligence: true,
            useCriticalCSSOnly: false,
            preserveBrandElements: true,
            optimizeForThumbnails: true,
            ...cssIntegration
          };

          processedCSS = await cssService.processCSSForThumbnail(
            fetchedCssData,
            modifiedHtml,
            defaultCSSOptions
          );

          console.log(`[EnhancedRenderer] CSS processing completed:`, {
            combinedCSSLength: processedCSS.combinedCSS.length,
            brandCSSLength: processedCSS.brandCSS.length,
            qualityScore: processedCSS.designIntelligence?.qualityScore || 'N/A'
          });
        }
      } catch (error) {
        console.warn(`[EnhancedRenderer] CSS integration failed, continuing without it:`, error);
      }
    }

    // Create enhanced HTML with CSS integration
    const enhancedHtml = createEnhancedHtml(
      modifiedHtml, 
      processedCSS, 
      { width, height, highlightChanges }
    );

    // Set content and wait for rendering
    await page.setContent(enhancedHtml, { 
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for images with timeout
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise((resolve) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve);
            setTimeout(resolve, 5000); // 5 second timeout per image
          }))
      );
    });

    // Additional stabilization delay for CSS-heavy pages
    const stabilizationDelay = processedCSS ? 1000 : 500;
    await page.waitForTimeout(stabilizationDelay);

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

    console.log(`[EnhancedRenderer] Taking screenshot with enhanced CSS integration`);
    const screenshot = await page.screenshot(screenshotOptions);

    console.log(`[EnhancedRenderer] Enhanced variation rendering completed successfully`);
    return screenshot;

  } catch (error) {
    console.error(`[EnhancedRenderer] Error in enhanced variation rendering:`, error);
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * Renders a side-by-side comparison with CSS integration
 */
export async function renderEnhancedComparison(
  request: EnhancedComparisonRenderRequest
): Promise<Buffer> {
  const {
    originalHtml,
    modifiedHtml,
    referencePageId,
    options = {}
  } = request;

  const {
    width = 2880, // Double width for side-by-side
    height = 900,
    format = 'png',
    quality = 90,
    cssIntegration = {}
  } = options;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    console.log(`[EnhancedRenderer] Starting enhanced comparison rendering`);
    
    // Set viewport
    await page.setViewportSize({ width, height });

    let processedCSS: ProcessedCSSData | null = null;

    // Fetch and process CSS data if reference page ID is provided
    if (referencePageId) {
      try {
        const cssService = CSSIntegrationService.getInstance();
        const cssData = await cssService.fetchCSSData(referencePageId);
        
        if (cssData) {
          const defaultCSSOptions: CSSIntegrationOptions = {
            enableDesignIntelligence: true,
            useCriticalCSSOnly: false,
            preserveBrandElements: true,
            optimizeForThumbnails: true,
            ...cssIntegration
          };

          processedCSS = await cssService.processCSSForThumbnail(
            cssData,
            originalHtml, // Use original HTML for CSS processing
            defaultCSSOptions
          );
        }
      } catch (error) {
        console.warn(`[EnhancedRenderer] CSS integration failed for comparison:`, error);
      }
    }

    // Create side-by-side comparison HTML with CSS integration
    const comparisonHtml = createComparisonHtml(
      originalHtml,
      modifiedHtml,
      processedCSS,
      { width, height }
    );

    // Set content and wait
    await page.setContent(comparisonHtml, { 
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for iframes to load with extended timeout for CSS-heavy pages
    const iframeTimeout = processedCSS ? 3000 : 2000;
    await page.waitForTimeout(iframeTimeout);

    // Take screenshot
    const screenshotOptions: any = {
      type: format,
      clip: { x: 0, y: 0, width, height }
    };

    if (format === 'jpeg') {
      screenshotOptions.quality = quality;
    }

    console.log(`[EnhancedRenderer] Enhanced comparison rendering completed successfully`);
    return await page.screenshot(screenshotOptions);

  } catch (error) {
    console.error(`[EnhancedRenderer] Error in enhanced comparison rendering:`, error);
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * Creates enhanced HTML with CSS integration
 */
function createEnhancedHtml(
  content: string, 
  processedCSS: ProcessedCSSData | null, 
  options: { width: number; height: number; highlightChanges?: boolean }
): string {
  const { width, height, highlightChanges = false } = options;

  // Use optimized CSS if available, otherwise fall back to basic styles
  const cssToInject = processedCSS?.optimizedCSS || '';
  const brandCSS = processedCSS?.brandCSS || '';

  // Generate design intelligence info for debugging
  const designInfo = processedCSS?.designIntelligence ? `
    <!-- Design Intelligence -->
    <!-- Brand Fonts: ${processedCSS.designIntelligence.brandFonts.join(', ')} -->
    <!-- Brand Colors: ${processedCSS.designIntelligence.brandColors.join(', ')} -->
    <!-- Quality Score: ${processedCSS.designIntelligence.qualityScore} -->
    <!-- Logo Selectors: ${processedCSS.designIntelligence.logoSelectors.join(', ')} -->
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${designInfo}
        <style>
          /* Reset styles */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          /* Apply dimensions */
          html, body {
            width: ${width}px;
            min-height: ${height}px;
            overflow-x: hidden;
          }
          
          /* Enhanced CSS from reference page */
          ${cssToInject}
          
          /* Brand-specific CSS preservation */
          ${brandCSS}
          
          /* Ensure proper font rendering */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Enhanced change highlight styles */
          ${highlightChanges ? `
          .cro-change-highlight {
            position: relative;
            outline: 3px solid #3b82f6 !important;
            outline-offset: 2px;
            background: rgba(59, 130, 246, 0.1) !important;
          }
          
          .cro-change-indicator {
            position: absolute;
            top: -25px;
            right: 0;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            z-index: 10000;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
          
          .cro-change-indicator::after {
            content: '';
            position: absolute;
            top: 100%;
            right: 10px;
            border: 4px solid transparent;
            border-top-color: #1d4ed8;
          }
          ` : ''}
          
          /* Thumbnail-specific optimizations */
          img {
            max-width: 100%;
            height: auto;
          }
          
          /* Ensure text remains readable in thumbnails */
          body {
            font-size: 14px;
            line-height: 1.4;
          }
          
          h1 { font-size: 24px; }
          h2 { font-size: 20px; }
          h3 { font-size: 18px; }
          h4 { font-size: 16px; }
          h5 { font-size: 14px; }
          h6 { font-size: 12px; }
        </style>
      </head>
      <body>
        ${content}
        
        ${processedCSS?.designIntelligence ? `
        <div style="position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-size: 10px; z-index: 10001;">
          Quality: ${processedCSS.designIntelligence.qualityScore}/100 | 
          Fonts: ${processedCSS.designIntelligence.brandFonts.length} | 
          Colors: ${processedCSS.designIntelligence.brandColors.length}
        </div>
        ` : ''}
      </body>
    </html>
  `;
}

/**
 * Creates comparison HTML with CSS integration
 */
function createComparisonHtml(
  originalHtml: string,
  modifiedHtml: string,
  processedCSS: ProcessedCSSData | null,
  dimensions: { width: number; height: number }
): string {
  const { width, height } = dimensions;
  const halfWidth = width / 2;

  const originalEnhanced = createEnhancedHtml(originalHtml, processedCSS, { 
    width: halfWidth, 
    height,
    highlightChanges: false 
  });
  
  const modifiedEnhanced = createEnhancedHtml(modifiedHtml, processedCSS, { 
    width: halfWidth, 
    height,
    highlightChanges: true 
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            width: ${width}px; 
            height: ${height}px; 
            overflow: hidden; 
            font-family: system-ui, -apple-system, sans-serif;
          }
          
          .comparison-container {
            display: flex;
            width: 100%;
            height: 100%;
          }
          
          .comparison-side {
            width: 50%;
            height: 100%;
            position: relative;
            overflow: hidden;
          }
          
          .comparison-side:first-child {
            border-right: 3px solid #e5e7eb;
          }
          
          .comparison-label {
            position: absolute;
            top: 15px;
            left: 15px;
            background: rgba(0,0,0,0.85);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          
          .comparison-label.control {
            background: linear-gradient(135deg, #6b7280, #4b5563);
          }
          
          .comparison-label.variation {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          }
          
          .comparison-iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
          }
          
          ${processedCSS?.designIntelligence ? `
          .design-info {
            position: absolute;
            bottom: 15px;
            left: 15px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            z-index: 1000;
          }
          ` : ''}
        </style>
      </head>
      <body>
        <div class="comparison-container">
          <div class="comparison-side">
            <div class="comparison-label control">Control (Original)</div>
            ${processedCSS?.designIntelligence ? `
            <div class="design-info">
              Quality: ${processedCSS.designIntelligence.qualityScore}/100
            </div>
            ` : ''}
            <iframe 
              class="comparison-iframe"
              srcdoc="${escapeHtml(originalEnhanced)}"
              sandbox="allow-same-origin allow-scripts"
            ></iframe>
          </div>
          <div class="comparison-side">
            <div class="comparison-label variation">Variation (Enhanced)</div>
            <iframe 
              class="comparison-iframe"
              srcdoc="${escapeHtml(modifiedEnhanced)}"
              sandbox="allow-same-origin allow-scripts"
            ></iframe>
          </div>
        </div>
      </body>
    </html>
  `;
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

/**
 * Batch render multiple enhanced variations
 */
export async function renderEnhancedBatch(
  variations: Array<EnhancedVariationRenderRequest & { id: string }>
): Promise<Array<{ id: string; success: boolean; buffer?: Buffer; error?: string }>> {
  const results = [];

  for (const variation of variations) {
    try {
      console.log(`[EnhancedRenderer] Processing batch variation: ${variation.id}`);
      const buffer = await renderEnhancedVariation(variation);
      results.push({
        id: variation.id,
        success: true,
        buffer
      });
    } catch (error) {
      console.error(`[EnhancedRenderer] Error rendering enhanced variation ${variation.id}:`, error);
      results.push({
        id: variation.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
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
