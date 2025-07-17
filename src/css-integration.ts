/**
 * CSS Integration Module
 * 
 * Handles integration with the reference pages CSS data for brand-aware thumbnail generation.
 * Self-contained implementation for the thumbnail service.
 */

// Simple logger for thumbnail service
const logger = {
  info: (message: string, data?: any) => console.log(`[CSSIntegration] ${message}`, data?.data || ''),
  warn: (message: string, data?: any) => console.warn(`[CSSIntegration] ${message}`, data?.data || ''),
  error: (message: string, data?: any) => console.error(`[CSSIntegration] ${message}`, data?.data || '')
};

// CSS Integration Types
interface CSSExtractionResult {
  css_external: Array<{
    url: string;
    content: string;
    media?: string;
    error?: string;
  }>;
  css_inline: string;
  css_variables: Record<string, string>;
  font_urls: string[];
  asset_urls: string[];
  css_processing_errors: Array<{
    url: string;
    error: string;
    timestamp: string;
  }>;
}

interface SimplifiedDesignIntelligence {
  brandFonts: string[];
  brandColors: string[];
  logoSelectors: string[];
  qualityScore: number;
}

export interface CSSIntegrationOptions {
  enableDesignIntelligence?: boolean;
  useCriticalCSSOnly?: boolean;
  preserveBrandElements?: boolean;
  optimizeForThumbnails?: boolean;
}

export interface EnhancedRenderOptions {
  cssData?: CSSExtractionResult;
  designIntelligence?: SimplifiedDesignIntelligence;
  brandPreservation?: boolean;
  cssIntegration?: CSSIntegrationOptions;
}

export interface ProcessedCSSData {
  combinedCSS: string;
  criticalCSS: string;
  brandCSS: string;
  optimizedCSS: string;
  designIntelligence?: SimplifiedDesignIntelligence;
}

/**
 * CSS Integration Service
 */
export class CSSIntegrationService {
  private static instance: CSSIntegrationService;
  private cache = new Map<string, ProcessedCSSData>();

  static getInstance(): CSSIntegrationService {
    if (!this.instance) {
      this.instance = new CSSIntegrationService();
    }
    return this.instance;
  }

  /**
   * Fetch CSS data from reference pages service
   */
  async fetchCSSData(referencePageId: string): Promise<CSSExtractionResult | null> {
    try {
      logger.info('Fetching CSS data for reference page', { data: { referencePageId } });

      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase configuration');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/reference-pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          action: 'get',
          id: referencePageId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reference page: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Reference page not found or invalid response');
      }

      const referencePage = result.data;

      // Reconstruct CSS data from flattened structure
      const cssData: CSSExtractionResult = {
        css_external: referencePage.css_external || [],
        css_inline: referencePage.css_inline || '',
        css_variables: referencePage.css_variables || {},
        font_urls: referencePage.font_urls || [],
        asset_urls: referencePage.asset_urls || [],
        css_processing_errors: referencePage.css_processing_errors || []
      };

      logger.info('CSS data fetched successfully', {
        data: {
          externalFiles: cssData.css_external.length,
          inlineLength: cssData.css_inline.length,
          variablesCount: Object.keys(cssData.css_variables).length,
          fontUrls: cssData.font_urls.length
        }
      });

      return cssData;

    } catch (error) {
      logger.error('Error fetching CSS data', { data: { error, referencePageId } });
      return null;
    }
  }

  /**
   * Process CSS data for thumbnail generation
   */
  async processCSSForThumbnail(
    cssData: CSSExtractionResult,
    html: string,
    options: CSSIntegrationOptions = {}
  ): Promise<ProcessedCSSData> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(cssData, options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      logger.info('Using cached CSS processing result');
      return this.cache.get(cacheKey)!;
    }

    try {
      logger.info('Processing CSS data for thumbnail generation');

      // Combine all CSS
      const combinedCSS = this.combineAllCSS(cssData);

      // Extract critical CSS for above-fold rendering
      const criticalCSS = options.useCriticalCSSOnly 
        ? this.extractCriticalCSS(combinedCSS, html)
        : combinedCSS;

      // Generate simplified design intelligence if enabled
      let designIntelligence: SimplifiedDesignIntelligence | undefined;

      if (options.enableDesignIntelligence) {
        try {
          designIntelligence = this.generateSimplifiedDesignIntelligence(combinedCSS, html);

          logger.info('Design intelligence generated', {
            data: {
              brandFonts: designIntelligence.brandFonts.length,
              brandColors: designIntelligence.brandColors.length,
              logoSelectors: designIntelligence.logoSelectors.length,
              qualityScore: designIntelligence.qualityScore
            }
          });

        } catch (error) {
          logger.warn('Design intelligence generation failed, continuing without it', { data: { error } });
        }
      }

      // Extract brand-specific CSS if brand preservation is enabled
      let brandCSS = '';
      if (options.preserveBrandElements && designIntelligence) {
        brandCSS = this.extractBrandCSS(combinedCSS, designIntelligence);
      }

      // Optimize CSS for thumbnail rendering
      const optimizedCSS = options.optimizeForThumbnails 
        ? this.optimizeCSSForThumbnails(criticalCSS)
        : criticalCSS;

      const result: ProcessedCSSData = {
        combinedCSS,
        criticalCSS,
        brandCSS,
        optimizedCSS,
        designIntelligence
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      const processingTime = Date.now() - startTime;
      logger.info('CSS processing completed', {
        data: {
          combinedCSSLength: combinedCSS.length,
          criticalCSSLength: criticalCSS.length,
          brandCSSLength: brandCSS.length,
          optimizedCSSLength: optimizedCSS.length,
          processingTime
        }
      });

      return result;

    } catch (error) {
      logger.error('Error processing CSS for thumbnail', { data: { error } });
      throw new Error(`CSS processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Combine all CSS content from extraction result
   */
  private combineAllCSS(cssData: CSSExtractionResult): string {
    const cssContent: string[] = [];
    
    // Add external CSS files
    cssData.css_external.forEach(css => {
      if (css.content && !css.error) {
        cssContent.push(`/* External CSS: ${css.url} */`);
        if (css.media) {
          cssContent.push(`@media ${css.media} {`);
          cssContent.push(css.content);
          cssContent.push('}');
        } else {
          cssContent.push(css.content);
        }
      }
    });

    // Add inline CSS
    if (cssData.css_inline) {
      cssContent.push('/* Inline CSS */');
      cssContent.push(cssData.css_inline);
    }

    return cssContent.join('\n\n');
  }

  /**
   * Extract critical CSS (above-fold styles)
   */
  private extractCriticalCSS(allCSS: string, html?: string): string {
    const criticalSelectors = new Set<string>();
    
    // Add common above-fold selectors
    const commonCriticalSelectors = [
      'body', 'html', 'head',
      'header', 'nav', 'main',
      'h1', 'h2', 'h3',
      '.hero', '.banner', '.header',
      '.navbar', '.nav', '.menu',
      '.logo', '.brand',
      '.container', '.wrapper'
    ];
    
    commonCriticalSelectors.forEach(selector => {
      criticalSelectors.add(selector);
    });

    // Extract CSS rules that match critical selectors
    const criticalCSS: string[] = [];
    const rules = this.extractCSSRules(allCSS);
    
    rules.forEach(({ selector, rule }) => {
      // Check if selector matches any critical selector
      for (const criticalSelector of criticalSelectors) {
        if (selector.includes(criticalSelector) || 
            selector.toLowerCase().includes(criticalSelector.toLowerCase())) {
          criticalCSS.push(rule);
          break;
        }
      }
    });
    
    return criticalCSS.join('\n');
  }

  /**
   * Extract CSS rules from CSS content
   */
  private extractCSSRules(css: string): Array<{ selector: string; rule: string }> {
    const rules: Array<{ selector: string; rule: string }> = [];
    
    // Simple CSS rule extraction
    const ruleRegex = /([^{]+)\s*\{([^}]*)\}/g;
    let match;
    
    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2].trim();
      
      if (selector && declarations) {
        rules.push({
          selector,
          rule: `${selector} {\n  ${declarations}\n}`
        });
      }
    }
    
    return rules;
  }

  /**
   * Generate simplified design intelligence
   */
  private generateSimplifiedDesignIntelligence(css: string, html: string): SimplifiedDesignIntelligence {
    const brandFonts = this.extractBrandFonts(css);
    const brandColors = this.extractBrandColors(css);
    const logoSelectors = this.extractLogoSelectors(html);
    const qualityScore = this.calculateQualityScore(css, html);

    return {
      brandFonts,
      brandColors,
      logoSelectors,
      qualityScore
    };
  }

  /**
   * Extract brand fonts from CSS
   */
  private extractBrandFonts(css: string): string[] {
    const fonts = new Set<string>();
    
    // Extract font-family declarations
    const fontFamilyRegex = /font-family\s*:\s*([^;]+);/gi;
    let match;
    
    while ((match = fontFamilyRegex.exec(css)) !== null) {
      const fontFamily = match[1].trim().replace(/['"]/g, '');
      // Skip generic fonts
      if (!fontFamily.includes('serif') && 
          !fontFamily.includes('sans-serif') && 
          !fontFamily.includes('monospace') &&
          !fontFamily.includes('system-ui')) {
        fonts.add(fontFamily.split(',')[0].trim());
      }
    }
    
    return Array.from(fonts).slice(0, 3); // Top 3 brand fonts
  }

  /**
   * Extract brand colors from CSS
   */
  private extractBrandColors(css: string): string[] {
    const colors = new Set<string>();
    
    // Extract color values (hex, rgb, hsl)
    const colorRegex = /(#[a-f0-9]{6}|#[a-f0-9]{3}|rgb\([^)]+\)|hsl\([^)]+\))/gi;
    let match;
    
    while ((match = colorRegex.exec(css)) !== null) {
      const color = match[1].toLowerCase();
      // Skip common colors
      if (!color.includes('#fff') && 
          !color.includes('#000') && 
          !color.includes('rgb(255') &&
          !color.includes('rgb(0')) {
        colors.add(color);
      }
    }
    
    return Array.from(colors).slice(0, 5); // Top 5 brand colors
  }

  /**
   * Extract logo selectors from HTML
   */
  private extractLogoSelectors(html: string): string[] {
    const logoSelectors: string[] = [];
    
    // Common logo patterns
    const logoPatterns = [
      /class="[^"]*logo[^"]*"/gi,
      /id="[^"]*logo[^"]*"/gi,
      /class="[^"]*brand[^"]*"/gi,
      /alt="[^"]*logo[^"]*"/gi
    ];

    logoPatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const selector = match.match(/(class|id)="([^"]+)"/);
          if (selector) {
            const prefix = selector[1] === 'class' ? '.' : '#';
            logoSelectors.push(`${prefix}${selector[2]}`);
          }
        });
      }
    });

    return [...new Set(logoSelectors)]; // Remove duplicates
  }

  /**
   * Calculate a simple quality score
   */
  private calculateQualityScore(css: string, html: string): number {
    let score = 50; // Base score
    
    // Check for modern CSS features
    if (css.includes('flexbox') || css.includes('display: flex')) score += 10;
    if (css.includes('grid') || css.includes('display: grid')) score += 10;
    if (css.includes('var(--')) score += 10; // CSS variables
    if (css.includes('@media')) score += 10; // Responsive design
    
    // Check for accessibility features
    if (css.includes('focus') || css.includes(':focus')) score += 5;
    if (css.includes('aria-') || html.includes('aria-')) score += 5;
    
    // Penalize for outdated practices
    if (css.includes('float:')) score -= 5;
    if (css.includes('table') && css.includes('layout')) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Extract brand-specific CSS rules
   */
  private extractBrandCSS(css: string, designIntelligence: SimplifiedDesignIntelligence): string {
    const brandRules: string[] = [];

    // Extract CSS rules for brand fonts
    designIntelligence.brandFonts.forEach(font => {
      const fontRules = this.extractCSSRulesForFont(css, font);
      brandRules.push(...fontRules);
    });

    // Extract CSS rules for brand colors
    designIntelligence.brandColors.forEach(color => {
      const colorRules = this.extractCSSRulesForColor(css, color);
      brandRules.push(...colorRules);
    });

    // Extract logo-related CSS
    designIntelligence.logoSelectors.forEach(selector => {
      const logoRules = this.extractCSSRulesForSelector(css, selector);
      brandRules.push(...logoRules);
    });

    return brandRules.join('\n');
  }

  /**
   * Extract CSS rules that use a specific font family
   */
  private extractCSSRulesForFont(css: string, fontFamily: string): string[] {
    const rules: string[] = [];
    const fontRegex = new RegExp(`font-family[^;]*${fontFamily.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^;]*;`, 'gi');
    
    // Find rules containing the font family
    const lines = css.split('\n');
    let currentRule = '';
    let inRule = false;
    
    for (const line of lines) {
      if (line.includes('{')) {
        inRule = true;
        currentRule = line;
      } else if (line.includes('}')) {
        currentRule += '\n' + line;
        if (fontRegex.test(currentRule)) {
          rules.push(currentRule);
        }
        currentRule = '';
        inRule = false;
      } else if (inRule) {
        currentRule += '\n' + line;
      }
    }
    
    return rules;
  }

  /**
   * Extract CSS rules that use a specific color
   */
  private extractCSSRulesForColor(css: string, color: string): string[] {
    const rules: string[] = [];
    const colorRegex = new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    
    // Find rules containing the color
    const lines = css.split('\n');
    let currentRule = '';
    let inRule = false;
    
    for (const line of lines) {
      if (line.includes('{')) {
        inRule = true;
        currentRule = line;
      } else if (line.includes('}')) {
        currentRule += '\n' + line;
        if (colorRegex.test(currentRule)) {
          rules.push(currentRule);
        }
        currentRule = '';
        inRule = false;
      } else if (inRule) {
        currentRule += '\n' + line;
      }
    }
    
    return rules;
  }

  /**
   * Extract CSS rules for a specific selector
   */
  private extractCSSRulesForSelector(css: string, selector: string): string[] {
    const rules: string[] = [];
    const selectorRegex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^{]*{[^}]*}`, 'gi');
    const matches = css.match(selectorRegex) || [];
    rules.push(...matches);
    return rules;
  }

  /**
   * Optimize CSS specifically for thumbnail rendering
   */
  private optimizeCSSForThumbnails(css: string): string {
    return css
      // Remove animations for static thumbnails
      .replace(/@keyframes[^{]*{[^}]*(?:{[^}]*}[^}]*)*}/g, '')
      .replace(/animation[^;]*;/g, '')
      .replace(/transition[^;]*;/g, '')
      // Remove print media queries
      .replace(/@media\s+print[^{]*{[^}]*(?:{[^}]*}[^}]*)*}/g, '')
      // Remove hover states for static thumbnails
      .replace(/[^{]*:hover[^{]*{[^}]*}/g, '')
      // Remove focus states
      .replace(/[^{]*:focus[^{]*{[^}]*}/g, '')
      // Optimize for thumbnail dimensions
      .replace(/font-size:\s*(\d+)px/g, (match, size) => {
        const newSize = Math.max(12, Math.min(parseInt(size), 24));
        return `font-size: ${newSize}px`;
      })
      // Ensure minimum contrast for thumbnails
      .replace(/color:\s*#([a-f0-9]{6})/gi, (match, hex) => {
        // Simple contrast adjustment - in production, use proper color contrast algorithms
        return match;
      });
  }

  /**
   * Generate cache key for CSS processing
   */
  private generateCacheKey(cssData: CSSExtractionResult, options: CSSIntegrationOptions): string {
    const cssHash = this.hashString(JSON.stringify(cssData));
    const optionsHash = this.hashString(JSON.stringify(options));
    return `${cssHash}-${optionsHash}`;
  }

  /**
   * Simple string hashing function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clear cache (useful for memory management)
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('CSS processing cache cleared');
  }
}

export default CSSIntegrationService;
