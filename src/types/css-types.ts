/**
 * CSS Integration Types
 * 
 * Centralized type definitions for CSS integration functionality.
 */

export interface CSSExtractionResult {
  css_external: ExternalCSSFile[];
  css_inline: string;
  css_variables: Record<string, string>;
  font_urls: string[];
  asset_urls: string[];
  css_processing_errors: CSSProcessingError[];
}

export interface ExternalCSSFile {
  url: string;
  content: string;
  media?: string;
  error?: string;
}

export interface CSSProcessingError {
  url: string;
  error: string;
  timestamp: string;
}

export interface SimplifiedDesignIntelligence {
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

export interface ProcessedCSSData {
  combinedCSS: string;
  criticalCSS: string;
  brandCSS: string;
  optimizedCSS: string;
  designIntelligence?: SimplifiedDesignIntelligence;
}

export interface CSSRule {
  selector: string;
  rule: string;
}

export interface QualityMetrics {
  hasModernFeatures: boolean;
  hasAccessibilityFeatures: boolean;
  hasOutdatedPractices: boolean;
  score: number;
}
