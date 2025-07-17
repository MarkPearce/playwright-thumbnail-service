/**
 * CSS Parser Service
 * 
 * Handles CSS parsing, rule extraction, and analysis.
 */

import { CSSRule, QualityMetrics } from '../types/css-types.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('CSSParser');

export class CSSParser {
  /**
   * Extract CSS rules from CSS content
   */
  static extractCSSRules(css: string): CSSRule[] {
    const rules: CSSRule[] = [];
    
    // Simple CSS rule extraction with better error handling
    const ruleRegex = /([^{]+)\s*\{([^}]*)\}/g;
    let match;
    
    try {
      while ((match = ruleRegex.exec(css)) !== null) {
        const selector = match[1]?.trim();
        const declarations = match[2]?.trim();
        
        if (selector && declarations) {
          rules.push({
            selector,
            rule: `${selector} {\n  ${declarations}\n}`
          });
        }
      }
    } catch (error) {
      logger.warn('Error extracting CSS rules', { data: { error } });
    }
    
    return rules;
  }

  /**
   * Extract font families from CSS
   */
  static extractFontFamilies(css: string): string[] {
    const fonts = new Set<string>();
    
    try {
      const fontFamilyRegex = /font-family\s*:\s*([^;]+);/gi;
      let match;
      
      while ((match = fontFamilyRegex.exec(css)) !== null) {
        const fontFamily = match[1]?.trim().replace(/['"]/g, '');
        
        if (fontFamily && this.isCustomFont(fontFamily)) {
          fonts.add(fontFamily.split(',')[0].trim());
        }
      }
    } catch (error) {
      logger.warn('Error extracting font families', { data: { error } });
    }
    
    return Array.from(fonts).slice(0, 3); // Top 3 brand fonts
  }

  /**
   * Extract colors from CSS
   */
  static extractColors(css: string): string[] {
    const colors = new Set<string>();
    
    try {
      // Extract color values (hex, rgb, hsl)
      const colorRegex = /(#[a-f0-9]{6}|#[a-f0-9]{3}|rgb\([^)]+\)|hsl\([^)]+\))/gi;
      let match;
      
      while ((match = colorRegex.exec(css)) !== null) {
        const color = match[1]?.toLowerCase();
        
        if (color && this.isCustomColor(color)) {
          colors.add(color);
        }
      }
    } catch (error) {
      logger.warn('Error extracting colors', { data: { error } });
    }
    
    return Array.from(colors).slice(0, 5); // Top 5 brand colors
  }

  /**
   * Extract logo selectors from HTML
   */
  static extractLogoSelectors(html: string): string[] {
    const logoSelectors: string[] = [];
    
    try {
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
    } catch (error) {
      logger.warn('Error extracting logo selectors', { data: { error } });
    }

    return [...new Set(logoSelectors)]; // Remove duplicates
  }

  /**
   * Calculate design quality metrics
   */
  static calculateQualityMetrics(css: string, html: string): QualityMetrics {
    const metrics: QualityMetrics = {
      hasModernFeatures: false,
      hasAccessibilityFeatures: false,
      hasOutdatedPractices: false,
      score: 50 // Base score
    };

    try {
      // Check for modern CSS features
      const modernFeatures = [
        /display:\s*flex/i,
        /display:\s*grid/i,
        /var\(--/i,
        /@media/i
      ];

      metrics.hasModernFeatures = modernFeatures.some(pattern => pattern.test(css));
      if (metrics.hasModernFeatures) {
        metrics.score += 20;
      }

      // Check for accessibility features
      const accessibilityFeatures = [
        /:focus/i,
        /aria-/i,
        /role=/i
      ];

      metrics.hasAccessibilityFeatures = accessibilityFeatures.some(pattern => 
        pattern.test(css) || pattern.test(html)
      );
      if (metrics.hasAccessibilityFeatures) {
        metrics.score += 10;
      }

      // Check for outdated practices
      const outdatedPractices = [
        /float:\s*left|float:\s*right/i,
        /table.*layout/i
      ];

      metrics.hasOutdatedPractices = outdatedPractices.some(pattern => pattern.test(css));
      if (metrics.hasOutdatedPractices) {
        metrics.score -= 15;
      }

      // Ensure score is within bounds
      metrics.score = Math.max(0, Math.min(100, metrics.score));

    } catch (error) {
      logger.warn('Error calculating quality metrics', { data: { error } });
    }

    return metrics;
  }

  /**
   * Extract CSS rules that use a specific font family
   */
  static extractCSSRulesForFont(css: string, fontFamily: string): string[] {
    const rules: string[] = [];
    
    try {
      const escapedFont = fontFamily.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const fontRegex = new RegExp(`font-family[^;]*${escapedFont}[^;]*;`, 'gi');
      
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
    } catch (error) {
      logger.warn('Error extracting CSS rules for font', { data: { error, fontFamily } });
    }
    
    return rules;
  }

  /**
   * Extract CSS rules that use a specific color
   */
  static extractCSSRulesForColor(css: string, color: string): string[] {
    const rules: string[] = [];
    
    try {
      const escapedColor = color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const colorRegex = new RegExp(escapedColor, 'gi');
      
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
    } catch (error) {
      logger.warn('Error extracting CSS rules for color', { data: { error, color } });
    }
    
    return rules;
  }

  /**
   * Extract CSS rules for a specific selector
   */
  static extractCSSRulesForSelector(css: string, selector: string): string[] {
    const rules: string[] = [];
    
    try {
      const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const selectorRegex = new RegExp(`${escapedSelector}[^{]*{[^}]*}`, 'gi');
      const matches = css.match(selectorRegex) || [];
      rules.push(...matches);
    } catch (error) {
      logger.warn('Error extracting CSS rules for selector', { data: { error, selector } });
    }
    
    return rules;
  }

  /**
   * Check if a font is a custom (non-generic) font
   */
  private static isCustomFont(fontFamily: string): boolean {
    const genericFonts = ['serif', 'sans-serif', 'monospace', 'system-ui', 'cursive', 'fantasy'];
    return !genericFonts.some(generic => fontFamily.toLowerCase().includes(generic));
  }

  /**
   * Check if a color is a custom (non-common) color
   */
  private static isCustomColor(color: string): boolean {
    const commonColors = ['#fff', '#ffffff', '#000', '#000000', 'rgb(255', 'rgb(0'];
    return !commonColors.some(common => color.includes(common));
  }
}
