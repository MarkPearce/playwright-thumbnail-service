/**
 * CSS Optimizer Service
 * 
 * Handles CSS optimization, minification, and thumbnail-specific processing.
 */

import { CSSExtractionResult } from '../types/css-types.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('CSSOptimizer');

export class CSSOptimizer {
  private static readonly CRITICAL_SELECTORS = [
    'body', 'html', 'head',
    'header', 'nav', 'main',
    'h1', 'h2', 'h3',
    '.hero', '.banner', '.header',
    '.navbar', '.nav', '.menu',
    '.logo', '.brand',
    '.container', '.wrapper'
  ];

  /**
   * Combine all CSS content from extraction result
   */
  static combineAllCSS(cssData: CSSExtractionResult): string {
    const cssContent: string[] = [];
    
    try {
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
    } catch (error) {
      logger.warn('Error combining CSS', { data: { error } });
    }

    return cssContent.join('\n\n');
  }

  /**
   * Extract critical CSS (above-fold styles)
   */
  static extractCriticalCSS(allCSS: string, html?: string): string {
    const criticalSelectors = new Set(this.CRITICAL_SELECTORS);
    
    try {
      // If HTML is provided, extract additional selectors
      if (html) {
        const additionalSelectors = this.extractSelectorsFromHTML(html);
        additionalSelectors.forEach(selector => criticalSelectors.add(selector));
      }

      // Extract CSS rules that match critical selectors
      const criticalCSS: string[] = [];
      const lines = allCSS.split('\n');
      let currentRule = '';
      let inRule = false;
      
      for (const line of lines) {
        if (line.includes('{')) {
          inRule = true;
          currentRule = line;
        } else if (line.includes('}')) {
          currentRule += '\n' + line;
          
          // Check if this rule matches any critical selector
          const selector = currentRule.split('{')[0]?.trim();
          if (selector && this.matchesCriticalSelector(selector, criticalSelectors)) {
            criticalCSS.push(currentRule);
          }
          
          currentRule = '';
          inRule = false;
        } else if (inRule) {
          currentRule += '\n' + line;
        }
      }
      
      return criticalCSS.join('\n');
    } catch (error) {
      logger.warn('Error extracting critical CSS', { data: { error } });
      return allCSS; // Fallback to all CSS
    }
  }

  /**
   * Optimize CSS specifically for thumbnail rendering
   */
  static optimizeForThumbnails(css: string): string {
    try {
      return css
        // Remove animations for static thumbnails
        .replace(/@keyframes[^{]*{[^}]*(?:{[^}]*}[^}]*)*}/g, '')
        .replace(/animation[^;]*;/g, '')
        .replace(/transition[^;]*;/g, '')
        
        // Remove print media queries
        .replace(/@media\s+print[^{]*{[^}]*(?:{[^}]*}[^}]*)*}/g, '')
        
        // Remove hover and focus states for static thumbnails
        .replace(/[^{]*:hover[^{]*{[^}]*}/g, '')
        .replace(/[^{]*:focus[^{]*{[^}]*}/g, '')
        
        // Optimize font sizes for thumbnail dimensions
        .replace(/font-size:\s*(\d+)px/g, (match, size) => {
          const newSize = Math.max(12, Math.min(parseInt(size), 24));
          return `font-size: ${newSize}px`;
        })
        
        // Remove unnecessary vendor prefixes for thumbnails
        .replace(/-webkit-transform[^;]*;/g, '')
        .replace(/-moz-transform[^;]*;/g, '')
        .replace(/-ms-transform[^;]*;/g, '')
        
        // Simplify box-shadows for better performance
        .replace(/box-shadow:\s*[^;]*;/g, 'box-shadow: 0 2px 4px rgba(0,0,0,0.1);')
        
        // Remove complex gradients that don't render well in thumbnails
        .replace(/background:\s*linear-gradient\([^;]*\);/g, '')
        .replace(/background-image:\s*linear-gradient\([^;]*\);/g, '');
        
    } catch (error) {
      logger.warn('Error optimizing CSS for thumbnails', { data: { error } });
      return css; // Return original CSS if optimization fails
    }
  }

  /**
   * Minify CSS content
   */
  static minifyCSS(css: string): string {
    try {
      return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        // Remove whitespace around specific characters
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Remove trailing semicolons before closing braces
        .replace(/;}/g, '}')
        // Remove empty rules
        .replace(/[^{}]+{\s*}/g, '')
        .trim();
    } catch (error) {
      logger.warn('Error minifying CSS', { data: { error } });
      return css;
    }
  }

  /**
   * Validate CSS syntax (basic validation)
   */
  static validateCSS(css: string): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for basic syntax issues
      const openBraces = (css.match(/{/g) || []).length;
      const closeBraces = (css.match(/}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        errors.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`);
      }

      // Check for unclosed strings
      const singleQuotes = (css.match(/'/g) || []).length;
      const doubleQuotes = (css.match(/"/g) || []).length;
      
      if (singleQuotes % 2 !== 0) {
        warnings.push('Potentially unclosed single quotes');
      }
      
      if (doubleQuotes % 2 !== 0) {
        warnings.push('Potentially unclosed double quotes');
      }

      // Check for empty selectors
      if (css.match(/\s*{\s*}/g)) {
        warnings.push('Empty CSS rules found');
      }
    } catch (error) {
      errors.push(`CSS validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Extract selectors from HTML for critical CSS detection
   */
  private static extractSelectorsFromHTML(html: string): string[] {
    const selectors: string[] = [];
    
    try {
      // Extract class names
      const classMatches = html.match(/class="([^"]*)"/g);
      if (classMatches) {
        classMatches.forEach(match => {
          const classes = match.replace(/class="([^"]*)"/, '$1').split(' ');
          classes.forEach(className => {
            if (className.trim()) {
              selectors.push(`.${className.trim()}`);
            }
          });
        });
      }

      // Extract IDs
      const idMatches = html.match(/id="([^"]*)"/g);
      if (idMatches) {
        idMatches.forEach(match => {
          const id = match.replace(/id="([^"]*)"/, '$1');
          if (id.trim()) {
            selectors.push(`#${id.trim()}`);
          }
        });
      }

      // Extract tag names from the first few elements (likely above-fold)
      const tagMatches = html.match(/<(\w+)[^>]*>/g);
      if (tagMatches) {
        tagMatches.slice(0, 20).forEach(match => { // Only first 20 tags
          const tag = match.replace(/<(\w+)[^>]*>/, '$1').toLowerCase();
          if (tag && !selectors.includes(tag)) {
            selectors.push(tag);
          }
        });
      }
    } catch (error) {
      logger.warn('Error extracting selectors from HTML', { data: { error } });
    }

    return selectors;
  }

  /**
   * Check if a selector matches any critical selector
   */
  private static matchesCriticalSelector(selector: string, criticalSelectors: Set<string>): boolean {
    const normalizedSelector = selector.toLowerCase();
    
    for (const criticalSelector of criticalSelectors) {
      if (normalizedSelector.includes(criticalSelector.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Calculate CSS complexity metrics
   */
  static analyzeCSSComplexity(css: string): {
    totalRules: number;
    totalDeclarations: number;
    uniqueSelectors: number;
    mediaQueries: number;
    keyframes: number;
    cssVariables: number;
  } {
    try {
      const rules = css.match(/[^{]+{[^}]*}/g) || [];
      const declarations = css.match(/[^{};]+:[^{};]+;/g) || [];
      const uniqueSelectors = new Set(
        rules.map(rule => rule.split('{')[0]?.trim()).filter(Boolean)
      );
      const mediaQueries = css.match(/@media[^{]*{[^{}]*({[^}]*}[^{}]*)*}/g) || [];
      const keyframes = css.match(/@keyframes[^{]*{[^{}]*({[^}]*}[^{}]*)*}/g) || [];
      const cssVariables = css.match(/--[\w-]+\s*:/g) || [];

      return {
        totalRules: rules.length,
        totalDeclarations: declarations.length,
        uniqueSelectors: uniqueSelectors.size,
        mediaQueries: mediaQueries.length,
        keyframes: keyframes.length,
        cssVariables: cssVariables.length
      };
    } catch (error) {
      logger.warn('Error analyzing CSS complexity', { data: { error } });
      return {
        totalRules: 0,
        totalDeclarations: 0,
        uniqueSelectors: 0,
        mediaQueries: 0,
        keyframes: 0,
        cssVariables: 0
      };
    }
  }
}
