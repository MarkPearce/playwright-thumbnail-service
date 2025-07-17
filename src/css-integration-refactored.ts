/**
 * Refactored CSS Integration Service
 * 
 * Clean, modular implementation with proper separation of concerns.
 */

import { 
  CSSExtractionResult, 
  CSSIntegrationOptions, 
  ProcessedCSSData,
  SimplifiedDesignIntelligence 
} from './types/css-types.js';
import { CSSOptimizer } from './services/css-optimizer.js';
import { DesignIntelligenceService } from './services/design-intelligence.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('CSSIntegration');

export interface EnhancedRenderOptions {
  cssData?: CSSExtractionResult;
  designIntelligence?: SimplifiedDesignIntelligence;
  brandPreservation?: boolean;
  cssIntegration?: CSSIntegrationOptions;
}

/**
 * Configuration for the CSS Integration Service
 */
export interface CSSIntegrationConfig {
  supabaseUrl?: string;
  supabaseServiceKey?: string;
  cacheMaxSize?: number;
  cacheMaxAge?: number; // in milliseconds
}

/**
 * Cache entry with timestamp for TTL
 */
interface CacheEntry {
  data: ProcessedCSSData;
  timestamp: number;
}

/**
 * Refactored CSS Integration Service with improved architecture
 */
export class CSSIntegrationService {
  private static instance: CSSIntegrationService;
  private cache = new Map<string, CacheEntry>();
  private config: Required<CSSIntegrationConfig>;

  private constructor(config: CSSIntegrationConfig = {}) {
    this.config = {
      supabaseUrl: config.supabaseUrl || process.env.SUPABASE_URL || '',
      supabaseServiceKey: config.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      cacheMaxSize: config.cacheMaxSize || 100,
      cacheMaxAge: config.cacheMaxAge || 30 * 60 * 1000 // 30 minutes
    };

    this.validateConfig();
  }

  static getInstance(config?: CSSIntegrationConfig): CSSIntegrationService {
    if (!this.instance) {
      this.instance = new CSSIntegrationService(config);
    }
    return this.instance;
  }

  /**
   * Fetch CSS data from reference pages service
   */
  async fetchCSSData(referencePageId: string): Promise<CSSExtractionResult | null> {
    const startTime = Date.now();
    
    try {
      logger.info('Fetching CSS data for reference page', { data: { referencePageId } });

      if (!this.config.supabaseUrl || !this.config.supabaseServiceKey) {
        throw new Error('Supabase configuration is missing');
      }

      const response = await this.makeSupabaseRequest(referencePageId);
      const cssData = this.parseCSSDataResponse(response);

      const fetchTime = Date.now() - startTime;
      logger.info('CSS data fetched successfully', {
        data: {
          externalFiles: cssData.css_external.length,
          inlineLength: cssData.css_inline.length,
          variablesCount: Object.keys(cssData.css_variables).length,
          fontUrls: cssData.font_urls.length,
          fetchTime
        }
      });

      return cssData;

    } catch (error) {
      const fetchTime = Date.now() - startTime;
      logger.error('Error fetching CSS data', { 
        data: { error: error instanceof Error ? error.message : 'Unknown error', referencePageId, fetchTime } 
      });
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

    try {
      // Check cache first
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        logger.info('Using cached CSS processing result');
        return cachedResult;
      }

      logger.info('Processing CSS data for thumbnail generation');

      // Validate inputs
      this.validateProcessingInputs(cssData, html, options);

      // Process CSS through pipeline
      const result = await this.processCSSPipeline(cssData, html, options);

      // Cache the result
      this.setCachedResult(cacheKey, result);

      const processingTime = Date.now() - startTime;
      logger.info('CSS processing completed', {
        data: {
          combinedCSSLength: result.combinedCSS.length,
          criticalCSSLength: result.criticalCSS.length,
          brandCSSLength: result.brandCSS.length,
          optimizedCSSLength: result.optimizedCSS.length,
          processingTime
        }
      });

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Error processing CSS for thumbnail', { 
        data: { error: error instanceof Error ? error.message : 'Unknown error', processingTime } 
      });
      throw new Error(`CSS processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear cache entries (with optional selective clearing)
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      // Clear entries matching pattern
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
      keysToDelete.forEach(key => this.cache.delete(key));
      logger.info('Selective cache cleared', { data: { pattern, clearedEntries: keysToDelete.length } });
    } else {
      // Clear all entries
      const totalEntries = this.cache.size;
      this.cache.clear();
      logger.info('Complete cache cleared', { data: { clearedEntries: totalEntries } });
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(entry => entry.timestamp);
    
    return {
      size: this.cache.size,
      maxSize: this.config.cacheMaxSize,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };
  }

  /**
   * Process CSS through the complete pipeline
   */
  private async processCSSPipeline(
    cssData: CSSExtractionResult,
    html: string,
    options: CSSIntegrationOptions
  ): Promise<ProcessedCSSData> {
    // Step 1: Combine all CSS
    const combinedCSS = CSSOptimizer.combineAllCSS(cssData);

    // Step 2: Extract critical CSS if requested
    const criticalCSS = options.useCriticalCSSOnly 
      ? CSSOptimizer.extractCriticalCSS(combinedCSS, html)
      : combinedCSS;

    // Step 3: Generate design intelligence if enabled
    let designIntelligence: SimplifiedDesignIntelligence | undefined;
    if (options.enableDesignIntelligence) {
      try {
        designIntelligence = DesignIntelligenceService.generateDesignIntelligence(combinedCSS, html);
      } catch (error) {
        logger.warn('Design intelligence generation failed, continuing without it', { data: { error } });
      }
    }

    // Step 4: Extract brand-specific CSS if brand preservation is enabled
    let brandCSS = '';
    if (options.preserveBrandElements && designIntelligence) {
      brandCSS = DesignIntelligenceService.extractBrandCSS(combinedCSS, designIntelligence);
    }

    // Step 5: Optimize CSS for thumbnail rendering
    const optimizedCSS = options.optimizeForThumbnails 
      ? CSSOptimizer.optimizeForThumbnails(criticalCSS)
      : criticalCSS;

    return {
      combinedCSS,
      criticalCSS,
      brandCSS,
      optimizedCSS,
      designIntelligence
    };
  }

  /**
   * Make request to Supabase reference pages service
   */
  private async makeSupabaseRequest(referencePageId: string): Promise<any> {
    const response = await fetch(`${this.config.supabaseUrl}/functions/v1/reference-pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.supabaseServiceKey}`
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

    return result.data;
  }

  /**
   * Parse CSS data from Supabase response
   */
  private parseCSSDataResponse(referencePage: any): CSSExtractionResult {
    return {
      css_external: referencePage.css_external || [],
      css_inline: referencePage.css_inline || '',
      css_variables: referencePage.css_variables || {},
      font_urls: referencePage.font_urls || [],
      asset_urls: referencePage.asset_urls || [],
      css_processing_errors: referencePage.css_processing_errors || []
    };
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.supabaseUrl) {
      logger.warn('Supabase URL not configured - CSS fetching will fail');
    }
    if (!this.config.supabaseServiceKey) {
      logger.warn('Supabase service key not configured - CSS fetching will fail');
    }
  }

  /**
   * Validate processing inputs
   */
  private validateProcessingInputs(
    cssData: CSSExtractionResult,
    html: string,
    options: CSSIntegrationOptions
  ): void {
    if (!cssData) {
      throw new Error('CSS data is required');
    }
    if (!html) {
      throw new Error('HTML content is required');
    }
    if (typeof options !== 'object') {
      throw new Error('Options must be an object');
    }
  }

  /**
   * Get cached result if valid
   */
  private getCachedResult(cacheKey: string): ProcessedCSSData | null {
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    const isExpired = Date.now() - entry.timestamp > this.config.cacheMaxAge;
    if (isExpired) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached result with cache management
   */
  private setCachedResult(cacheKey: string, data: ProcessedCSSData): void {
    // Manage cache size
    if (this.cache.size >= this.config.cacheMaxSize) {
      this.evictOldestCacheEntry();
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldestCacheEntry(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('Evicted oldest cache entry', { data: { key: oldestKey } });
    }
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
}

export default CSSIntegrationService;
