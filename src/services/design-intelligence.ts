/**
 * Design Intelligence Service
 * 
 * Handles design analysis, brand detection, and quality assessment.
 */

import { SimplifiedDesignIntelligence, QualityMetrics } from '../types/css-types.js';
import { CSSParser } from './css-parser.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('DesignIntelligence');

export class DesignIntelligenceService {
  /**
   * Generate simplified design intelligence from CSS and HTML
   */
  static generateDesignIntelligence(css: string, html: string): SimplifiedDesignIntelligence {
    try {
      logger.debug('Generating design intelligence');

      const brandFonts = CSSParser.extractFontFamilies(css);
      const brandColors = CSSParser.extractColors(css);
      const logoSelectors = CSSParser.extractLogoSelectors(html);
      const qualityMetrics = CSSParser.calculateQualityMetrics(css, html);

      const intelligence: SimplifiedDesignIntelligence = {
        brandFonts,
        brandColors,
        logoSelectors,
        qualityScore: qualityMetrics.score
      };

      logger.info('Design intelligence generated', {
        data: {
          brandFonts: brandFonts.length,
          brandColors: brandColors.length,
          logoSelectors: logoSelectors.length,
          qualityScore: qualityMetrics.score
        }
      });

      return intelligence;
    } catch (error) {
      logger.error('Error generating design intelligence', { data: { error } });
      
      // Return fallback intelligence
      return {
        brandFonts: [],
        brandColors: [],
        logoSelectors: [],
        qualityScore: 50
      };
    }
  }

  /**
   * Extract brand-specific CSS rules
   */
  static extractBrandCSS(css: string, designIntelligence: SimplifiedDesignIntelligence): string {
    const brandRules: string[] = [];

    try {
      // Extract CSS rules for brand fonts
      designIntelligence.brandFonts.forEach(font => {
        const fontRules = CSSParser.extractCSSRulesForFont(css, font);
        brandRules.push(...fontRules);
      });

      // Extract CSS rules for brand colors
      designIntelligence.brandColors.forEach(color => {
        const colorRules = CSSParser.extractCSSRulesForColor(css, color);
        brandRules.push(...colorRules);
      });

      // Extract logo-related CSS
      designIntelligence.logoSelectors.forEach(selector => {
        const logoRules = CSSParser.extractCSSRulesForSelector(css, selector);
        brandRules.push(...logoRules);
      });

      logger.debug('Brand CSS extracted', {
        data: {
          rulesCount: brandRules.length,
          totalLength: brandRules.join('\n').length
        }
      });

    } catch (error) {
      logger.warn('Error extracting brand CSS', { data: { error } });
    }

    return brandRules.join('\n');
  }

  /**
   * Analyze design quality and provide recommendations
   */
  static analyzeDesignQuality(css: string, html: string): {
    metrics: QualityMetrics;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    try {
      const metrics = CSSParser.calculateQualityMetrics(css, html);

      // Generate recommendations based on metrics
      if (!metrics.hasModernFeatures) {
        recommendations.push('Consider using modern CSS features like Flexbox or Grid for better layouts');
        recommendations.push('Add CSS custom properties (variables) for better maintainability');
      }

      if (!metrics.hasAccessibilityFeatures) {
        recommendations.push('Add focus styles for better keyboard navigation');
        recommendations.push('Include ARIA attributes for screen reader compatibility');
      }

      if (metrics.hasOutdatedPractices) {
        recommendations.push('Replace float-based layouts with modern alternatives');
        recommendations.push('Avoid table-based layouts for non-tabular content');
      }

      if (metrics.score < 70) {
        recommendations.push('Overall design quality could be improved');
        recommendations.push('Consider a design system audit for consistency');
      }

      logger.debug('Design quality analyzed', {
        data: {
          score: metrics.score,
          recommendationsCount: recommendations.length
        }
      });

      return { metrics, recommendations };
    } catch (error) {
      logger.error('Error analyzing design quality', { data: { error } });
      
      return {
        metrics: {
          hasModernFeatures: false,
          hasAccessibilityFeatures: false,
          hasOutdatedPractices: false,
          score: 50
        },
        recommendations: ['Unable to analyze design quality due to processing error']
      };
    }
  }

  /**
   * Generate design enhancement suggestions
   */
  static generateEnhancementSuggestions(
    designIntelligence: SimplifiedDesignIntelligence,
    css: string
  ): string[] {
    const suggestions: string[] = [];

    try {
      // Font-related suggestions
      if (designIntelligence.brandFonts.length === 0) {
        suggestions.push('Consider adding custom brand fonts for better visual identity');
      } else if (designIntelligence.brandFonts.length > 3) {
        suggestions.push('Consider reducing the number of fonts for better performance and consistency');
      }

      // Color-related suggestions
      if (designIntelligence.brandColors.length === 0) {
        suggestions.push('Define a consistent brand color palette');
      } else if (designIntelligence.brandColors.length > 8) {
        suggestions.push('Consider simplifying the color palette for better brand consistency');
      }

      // Logo-related suggestions
      if (designIntelligence.logoSelectors.length === 0) {
        suggestions.push('Ensure logo elements have proper CSS classes for styling consistency');
      }

      // Quality-based suggestions
      if (designIntelligence.qualityScore < 60) {
        suggestions.push('Overall design quality is below average - consider a comprehensive review');
      } else if (designIntelligence.qualityScore > 85) {
        suggestions.push('Excellent design quality - maintain current standards');
      }

      // CSS-specific suggestions
      if (!css.includes('var(--')) {
        suggestions.push('Consider using CSS custom properties for better maintainability');
      }

      if (!css.includes('@media')) {
        suggestions.push('Add responsive design breakpoints for better mobile experience');
      }

      logger.debug('Enhancement suggestions generated', {
        data: { suggestionsCount: suggestions.length }
      });

    } catch (error) {
      logger.warn('Error generating enhancement suggestions', { data: { error } });
      suggestions.push('Unable to generate specific suggestions due to processing error');
    }

    return suggestions;
  }

  /**
   * Validate brand consistency across design elements
   */
  static validateBrandConsistency(designIntelligence: SimplifiedDesignIntelligence): {
    isConsistent: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let consistencyScore = 100;

    try {
      // Check font consistency
      if (designIntelligence.brandFonts.length > 4) {
        issues.push('Too many different fonts may reduce brand consistency');
        consistencyScore -= 15;
      }

      // Check color consistency
      if (designIntelligence.brandColors.length > 10) {
        issues.push('Large color palette may dilute brand identity');
        consistencyScore -= 10;
      }

      // Check logo presence
      if (designIntelligence.logoSelectors.length === 0) {
        issues.push('No logo elements detected - ensure proper branding');
        consistencyScore -= 20;
      }

      // Check overall quality impact on consistency
      if (designIntelligence.qualityScore < 50) {
        issues.push('Low design quality may impact brand perception');
        consistencyScore -= 25;
      }

      consistencyScore = Math.max(0, consistencyScore);

      logger.debug('Brand consistency validated', {
        data: {
          isConsistent: issues.length === 0,
          issuesCount: issues.length,
          score: consistencyScore
        }
      });

      return {
        isConsistent: issues.length === 0,
        issues,
        score: consistencyScore
      };
    } catch (error) {
      logger.error('Error validating brand consistency', { data: { error } });
      
      return {
        isConsistent: false,
        issues: ['Unable to validate brand consistency due to processing error'],
        score: 0
      };
    }
  }
}
