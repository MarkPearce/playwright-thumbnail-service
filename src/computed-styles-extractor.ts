/**
 * Computed Styles Extractor
 * 
 * Extracts computed styles from HTML using Playwright to get actual rendered values
 * after CSS cascade, inheritance, and fallbacks.
 */

import { chromium, Browser, Page } from 'playwright';
import { createLogger } from './utils/logger.js';

const logger = createLogger('ComputedStylesExtractor');

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

export interface ComputedStylesRequest {
  html: string;
  url: string; // Original URL for resolving relative paths
  options?: {
    viewport?: { width: number; height: number };
    waitForFonts?: boolean;
    includeAll?: boolean; // Include all elements or just key ones
    maxElements?: number; // Limit number of elements to analyze
  };
}

export interface ElementComputedStyles {
  selector: string;
  tagName: string;
  id?: string;
  className?: string;
  // Typography
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: string;
  // Colors
  color: string;
  backgroundColor: string;
  // Layout
  display: string;
  position: string;
  width: string;
  height: string;
  // Spacing
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  // Borders
  borderStyle: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  // Effects
  opacity: string;
  boxShadow: string;
  // Custom properties
  cssVariables?: Record<string, string>;
}

export interface ComputedStylesResult {
  success: boolean;
  data?: {
    elements: ElementComputedStyles[];
    summary: {
      totalElements: number;
      uniqueFonts: string[];
      uniqueColors: string[];
      primaryFont?: string;
      primaryColor?: string;
      backgroundColor?: string;
    };
    cssVariables: Record<string, string>;
    metadata: {
      url: string;
      timestamp: string;
      processingTime: number;
      viewport: { width: number; height: number };
    };
  };
  error?: string;
}

/**
 * Extract computed styles from HTML
 */
export async function extractComputedStyles(
  request: ComputedStylesRequest
): Promise<ComputedStylesResult> {
  const startTime = Date.now();
  const { html, url, options = {} } = request;
  const {
    viewport = { width: 1920, height: 1080 },
    waitForFonts = true,
    includeAll = false,
    maxElements = 100
  } = options;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    logger.info(`Extracting computed styles for ${url}`);
    
    // Set viewport
    await page.setViewportSize(viewport);

    // Set content with proper base URL for resolving relative paths
    await page.setContent(html, { 
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for fonts to load if requested
    if (waitForFonts) {
      await page.evaluate(() => document.fonts.ready);
    }

    // Extract computed styles
    const computedData = await page.evaluate((config) => {
      const { includeAll, maxElements } = config;
      
      // Helper to get CSS selector for an element
      function getSelector(el: Element): string {
        if (el.id) return `#${el.id}`;
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.trim().split(/\s+/).join('.');
          if (classes) return `${el.tagName.toLowerCase()}.${classes}`;
        }
        return el.tagName.toLowerCase();
      }

      // Get elements to analyze
      let elements: Element[];
      if (includeAll) {
        elements = Array.from(document.querySelectorAll('*')).slice(0, maxElements);
      } else {
        // Focus on key elements for CRO
        const selectors = [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', // Headings
          'p', 'a', 'button', 'input', 'form', // Interactive elements
          '.btn', '.button', '[class*="button"]', // Common button classes
          '.cta', '[class*="cta"]', // CTAs
          'nav', 'header', 'footer', // Layout elements
          '[class*="hero"]', '[class*="banner"]', // Hero sections
          '[class*="testimonial"]', '[class*="review"]', // Social proof
          '[class*="price"]', '[class*="pricing"]' // Pricing elements
        ];
        
        const elementSet = new Set<Element>();
        selectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(el => elementSet.add(el));
          } catch (e) {
            // Skip invalid selectors
          }
        });
        
        elements = Array.from(elementSet).slice(0, maxElements);
      }

      // Extract styles for each element
      const elementStyles = elements.map(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        return {
          selector: getSelector(el),
          tagName: el.tagName.toLowerCase(),
          id: el.id || undefined,
          className: (typeof el.className === 'string' ? el.className : '') || undefined,
          // Typography
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          textAlign: style.textAlign,
          // Colors
          color: style.color,
          backgroundColor: style.backgroundColor,
          // Layout
          display: style.display,
          position: style.position,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          // Spacing
          marginTop: style.marginTop,
          marginRight: style.marginRight,
          marginBottom: style.marginBottom,
          marginLeft: style.marginLeft,
          paddingTop: style.paddingTop,
          paddingRight: style.paddingRight,
          paddingBottom: style.paddingBottom,
          paddingLeft: style.paddingLeft,
          // Borders
          borderStyle: style.borderStyle,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth,
          borderRadius: style.borderRadius,
          // Effects
          opacity: style.opacity,
          boxShadow: style.boxShadow
        };
      });

      // Extract CSS variables from :root
      const rootStyle = window.getComputedStyle(document.documentElement);
      const cssVariables: Record<string, string> = {};
      
      // Get all CSS custom properties
      Array.from(rootStyle).forEach(prop => {
        if (prop.startsWith('--')) {
          cssVariables[prop] = rootStyle.getPropertyValue(prop).trim();
        }
      });

      // Collect unique fonts and colors
      const fonts = new Set<string>();
      const colors = new Set<string>();
      
      elementStyles.forEach(style => {
        if (style.fontFamily) fonts.add(style.fontFamily);
        if (style.color && style.color !== 'rgba(0, 0, 0, 0)') colors.add(style.color);
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          colors.add(style.backgroundColor);
        }
      });

      // Find most common font (primary font)
      const fontCounts = new Map<string, number>();
      elementStyles.forEach(style => {
        if (style.fontFamily) {
          fontCounts.set(style.fontFamily, (fontCounts.get(style.fontFamily) || 0) + 1);
        }
      });
      
      const primaryFont = Array.from(fontCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      // Get body background color
      const bodyStyle = window.getComputedStyle(document.body);
      const backgroundColor = bodyStyle.backgroundColor;

      return {
        elements: elementStyles,
        summary: {
          totalElements: elements.length,
          uniqueFonts: Array.from(fonts),
          uniqueColors: Array.from(colors),
          primaryFont,
          backgroundColor
        },
        cssVariables
      };
    }, { includeAll, maxElements });

    // Find primary color (most used non-black/white color)
    const colorCounts = new Map<string, number>();
    computedData.elements.forEach(el => {
      const color = el.color;
      if (color && !color.includes('0, 0, 0') && !color.includes('255, 255, 255')) {
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      }
    });
    
    const primaryColor = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    // Create the final summary with primaryColor if found
    const summary = {
      ...computedData.summary,
      ...(primaryColor && { primaryColor })
    };

    const processingTime = Date.now() - startTime;
    
    logger.info(`Computed styles extraction completed in ${processingTime}ms`, {
      elements: computedData.elements.length,
      fonts: summary.uniqueFonts.length,
      colors: summary.uniqueColors.length,
      cssVariables: Object.keys(computedData.cssVariables).length
    });

    return {
      success: true,
      data: {
        elements: computedData.elements,
        summary,
        cssVariables: computedData.cssVariables,
        metadata: {
          url,
          timestamp: new Date().toISOString(),
          processingTime,
          viewport
        }
      }
    };

  } catch (error) {
    logger.error('Error extracting computed styles:', error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract computed styles'
    };
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
