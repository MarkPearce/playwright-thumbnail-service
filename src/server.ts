import express from 'express';
import cors from 'cors';
import { renderThumbnail } from './renderer.js';
import { renderTemplate } from './ssr/entry.js';
import { renderHTMLToImage } from './ssr/html-renderer.js';
import { renderVariation, renderComparison, renderBatch } from './variation-renderer.js';
import { 
  renderEnhancedVariation, 
  renderEnhancedComparison, 
  renderEnhancedBatch 
} from './enhanced-variation-renderer.js';
import { extractComputedStyles } from './computed-styles-extractor-simple.js';
import type { ThumbnailOptions } from './types.js';

const app = express();
const PORT = process.env.PORT || 3001; // Using 3001 to avoid conflict with existing service

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for TSX components

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'playwright-thumbnail-service'
  });
});

// Simple thumbnail generation endpoint - uses actual slide templates
app.post('/thumbnail', async (req, res): Promise<void> => {
  try {
    const { slideData, options = {} } = req.body;
    
    if (!slideData) {
      res.status(400).json({ 
        error: 'Missing slideData',
        message: 'slideData is required'
      });
      return;
    }
    
    console.log('Thumbnail request with real templates:', { 
      layout: slideData.layout_id,
      hasRenderData: !!slideData.renderData
    });
    
    // Map layout_id to template component names
    const templateMap = {
      'title_slide': 'TitleSlide',
      'one_column': 'OneColumn', 
      'two_column': 'TwoColumn',
      'three_column': 'ThreeColumn',
      'four_column': 'FourColumn',
      'logo_card': 'LogoCard'
    };
    
    const templateName = templateMap[slideData.layout_id as keyof typeof templateMap] || 'TwoColumn';
    
    // Create component code that uses the actual templates
    const componentCode = `
      function SlideComponent() {
        const slideData = ${JSON.stringify(slideData)};
        
        // Get the template component from window.TemplateComponents
        const TemplateComponent = window.TemplateComponents.${templateName};
        
        // Use renderData directly - it's already pre-resolved
        const renderData = slideData.renderData || {};
        
        // Render using the actual template component
        return React.createElement(TemplateComponent, renderData);
      }
    `;
    
    // Default options
    const defaultOptions: ThumbnailOptions = {
      width: 1280,
      height: 720,
      deviceScaleFactor: 0.5,
      format: 'png'
    };
    
    const renderOptions = { ...defaultOptions, ...options };
    
    // Generate thumbnail using real templates
    const imageBuffer = await renderThumbnail(componentCode, {}, renderOptions);
    
    // Return image
    res.set({
      'Content-Type': `image/${renderOptions.format}`,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).json({ 
      error: 'Failed to generate thumbnail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// SSR Template-based thumbnail generation endpoint
app.post('/thumbnail/template', async (req, res): Promise<void> => {
  try {
    const { templateId, props = {}, options = {} }: { templateId: string; props: any; options: ThumbnailOptions } = req.body;
    
    if (!templateId) {
      res.status(400).json({ 
        error: 'Missing required field: templateId',
        message: 'Template ID is required'
      });
      return;
    }
    
    console.log('SSR Template thumbnail request:', { 
      templateId,
      propsKeys: Object.keys(props),
      options 
    });
    
    // Default options
    const defaultOptions: ThumbnailOptions = {
      width: 1280,
      height: 720,
      deviceScaleFactor: 0.5,
      format: 'png'
    };
    
    const renderOptions = { ...defaultOptions, ...options };
    
    // Props should already be in the correct format (renderData)
    // No content resolution needed - just pass through
    console.log('✅ Using pre-resolved renderData directly');
    console.log('📊 RenderData structure:', {
      hasTitle: !!props.title,
      hasSubtitle: !!props.subtitle,
      columns: Object.keys(props).filter(key => key.startsWith('column'))
    });
    
    // Render template with pre-resolved renderData
    const html = renderTemplate({
      templateId,
      props: props, // Pass renderData directly to templates
      width: renderOptions.width,
      height: renderOptions.height
    });
    
    // Generate thumbnail from HTML
    const imageBuffer = await renderHTMLToImage(html, renderOptions);
    
    // Set response headers
    res.set({
      'Content-Type': `image/${renderOptions.format}`,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Error generating SSR template thumbnail:', error);
    res.status(500).json({ 
      error: 'Failed to generate thumbnail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// New endpoint for rendering HTML variations
app.post('/render-variation', async (req, res): Promise<void> => {
  try {
    const { modifiedHtml, designSystem, changes, options = {} } = req.body;
    
    if (!modifiedHtml) {
      res.status(400).json({ 
        error: 'Missing required field: modifiedHtml',
        message: 'Modified HTML content is required'
      });
      return;
    }
    
    console.log('Variation render request received:', { 
      hasDesignSystem: !!designSystem,
      changesCount: changes?.length || 0,
      options 
    });
    
    // Generate variation preview
    const imageBuffer = await renderVariation({
      modifiedHtml,
      designSystem,
      changes,
      options
    });
    
    // Set response headers
    res.set({
      'Content-Type': `image/${options.format || 'png'}`,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Error rendering variation:', error);
    res.status(500).json({ 
      error: 'Failed to render variation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// New endpoint for side-by-side comparison
app.post('/render-comparison', async (req, res): Promise<void> => {
  try {
    const { originalHtml, modifiedHtml, designSystem, changes, options = {} } = req.body;
    
    if (!originalHtml || !modifiedHtml) {
      res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Both originalHtml and modifiedHtml are required for comparison'
      });
      return;
    }
    
    console.log('Comparison render request received:', { 
      hasDesignSystem: !!designSystem,
      changesCount: changes?.length || 0,
      options 
    });
    
    // Generate comparison preview
    const imageBuffer = await renderComparison({
      originalHtml,
      modifiedHtml,
      designSystem,
      changes,
      options
    });
    
    // Set response headers
    res.set({
      'Content-Type': `image/${options.format || 'png'}`,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Error rendering comparison:', error);
    res.status(500).json({ 
      error: 'Failed to render comparison',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// New endpoint for batch rendering
app.post('/render-batch', async (req, res): Promise<void> => {
  try {
    const { variations, options = {} } = req.body;
    
    if (!variations || !Array.isArray(variations) || variations.length === 0) {
      res.status(400).json({ 
        error: 'Missing or invalid variations',
        message: 'An array of variations is required'
      });
      return;
    }
    
    console.log('Batch render request received:', { 
      variationCount: variations.length,
      options 
    });
    
    // Generate batch previews
    const results = await renderBatch(variations);
    
    // Convert buffers to base64 for JSON response
    const response = results.map(result => ({
      id: result.id,
      success: result.success,
      image: result.success && result.buffer ? result.buffer.toString('base64') : null,
      error: result.error || null
    }));
    
    res.json({
      success: true,
      results: response,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
    
  } catch (error) {
    console.error('Error in batch rendering:', error);
    res.status(500).json({ 
      error: 'Failed to render batch',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced endpoint for rendering variations with CSS integration
app.post('/render-enhanced-variation', async (req, res): Promise<void> => {
  try {
    const { modifiedHtml, referencePageId, options = {} } = req.body;
    
    if (!modifiedHtml) {
      res.status(400).json({ 
        error: 'Missing required field: modifiedHtml',
        message: 'Modified HTML content is required'
      });
      return;
    }
    
    console.log('Enhanced variation render request received:', { 
      hasReferencePageId: !!referencePageId,
      options 
    });
    
    // Generate enhanced variation preview with CSS integration
    const imageBuffer = await renderEnhancedVariation({
      modifiedHtml,
      referencePageId,
      options
    });
    
    // Set response headers
    res.set({
      'Content-Type': `image/${options.format || 'png'}`,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Error rendering enhanced variation:', error);
    res.status(500).json({ 
      error: 'Failed to render enhanced variation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced endpoint for side-by-side comparison with CSS integration
app.post('/render-enhanced-comparison', async (req, res): Promise<void> => {
  try {
    const { originalHtml, modifiedHtml, referencePageId, options = {} } = req.body;
    
    if (!originalHtml || !modifiedHtml) {
      res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Both originalHtml and modifiedHtml are required for comparison'
      });
      return;
    }
    
    console.log('Enhanced comparison render request received:', { 
      hasReferencePageId: !!referencePageId,
      options 
    });
    
    // Generate enhanced comparison preview with CSS integration
    const imageBuffer = await renderEnhancedComparison({
      originalHtml,
      modifiedHtml,
      referencePageId,
      options
    });
    
    // Set response headers
    res.set({
      'Content-Type': `image/${options.format || 'png'}`,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Error rendering enhanced comparison:', error);
    res.status(500).json({ 
      error: 'Failed to render enhanced comparison',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced endpoint for batch rendering with CSS integration
app.post('/render-enhanced-batch', async (req, res): Promise<void> => {
  try {
    const { variations, options = {} } = req.body;
    
    if (!variations || !Array.isArray(variations) || variations.length === 0) {
      res.status(400).json({ 
        error: 'Missing or invalid variations',
        message: 'An array of variations is required'
      });
      return;
    }
    
    console.log('Enhanced batch render request received:', { 
      variationCount: variations.length,
      options 
    });
    
    // Generate enhanced batch previews with CSS integration
    const results = await renderEnhancedBatch(variations);
    
    // Convert buffers to base64 for JSON response
    const response = results.map(result => ({
      id: result.id,
      success: result.success,
      image: result.success && result.buffer ? result.buffer.toString('base64') : null,
      error: result.error || null
    }));
    
    res.json({
      success: true,
      results: response,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
    
  } catch (error) {
    console.error('Error in enhanced batch rendering:', error);
    res.status(500).json({ 
      error: 'Failed to render enhanced batch',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// NEW: Computed styles extraction endpoint
app.post('/extract-computed-styles', async (req, res): Promise<void> => {
  try {
    const { html, url, options = {} } = req.body;
    
    if (!html || !url) {
      res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Both html and url are required'
      });
      return;
    }
    
    console.log('Computed styles extraction request received:', { 
      url,
      htmlLength: html.length,
      options 
    });
    
    // Extract computed styles
    const result = await extractComputedStyles({
      html,
      url,
      options
    });
    
    if (!result.success) {
      res.status(500).json({ 
        error: 'Failed to extract computed styles',
        message: result.error || 'Unknown error'
      });
      return;
    }
    
    // Return the computed styles data
    res.json(result);
    
  } catch (error) {
    console.error('Error extracting computed styles:', error);
    res.status(500).json({ 
      error: 'Failed to extract computed styles',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Example endpoint to show usage
app.get('/example', (_req, res) => {
  const exampleRequest = {
    component: `
import React from 'react';

interface SlideProps {
  title: string;
  subtitle?: string;
  content?: string;
}

export default function ExampleSlide({ title, subtitle, content }: SlideProps) {
  return (
    <div className="w-full h-full bg-white flex flex-col justify-center items-center p-12">
      <h1 className="text-5xl font-bold text-blue-600 mb-4">{title}</h1>
      {subtitle && (
        <h2 className="text-3xl text-gray-600 mb-8">{subtitle}</h2>
      )}
      {content && (
        <p className="text-xl text-gray-800 max-w-3xl text-center">{content}</p>
      )}
    </div>
  );
}
    `,
    props: {
      title: "Hello from Playwright",
      subtitle: "Native TSX Support",
      content: "This component is written in TypeScript and rendered directly without transpilation!"
    },
    options: {
      width: 1280,
      height: 720,
      format: "png"
    }
  };
  
  const variationExample = {
    modifiedHtml: "<h1>Modified Page</h1><p>This is a variation</p>",
    designSystem: {
      css: "body { font-family: Arial; }",
      colorPalette: { primary: "#007bff", secondary: "#6c757d" }
    },
    changes: [
      { selector: "h1", changeType: "content", originalContent: "Original", newContent: "Modified" }
    ],
    options: {
      width: 1440,
      height: 900,
      highlightChanges: true
    }
  };

  const enhancedVariationExample = {
    modifiedHtml: "<h1>Enhanced Page</h1><p>This variation uses CSS data from reference page</p>",
    referencePageId: "uuid-of-reference-page",
    options: {
      width: 1440,
      height: 900,
      highlightChanges: true,
      cssIntegration: {
        enableDesignIntelligence: true,
        preserveBrandElements: true,
        optimizeForThumbnails: true
      }
    }
  };
  
  res.json({
    message: "Playwright Thumbnail Service - Enhanced with CSS Integration",
    version: "2.0.0",
    features: [
      "TSX component rendering",
      "HTML variation rendering", 
      "CSS data integration",
      "Brand preservation",
      "Design intelligence",
      "Side-by-side comparisons",
      "Batch processing"
    ],
    endpoints: {
      // Basic endpoints
      thumbnail: {
        path: "POST /thumbnail",
        description: "Render TSX components",
        example: exampleRequest
      },
      template: {
        path: "POST /thumbnail/template",
        description: "Render SSR templates",
        example: {
          templateId: "TwoColumn",
          props: { title: "Example", subtitle: "Template rendering" }
        }
      },
      
      // Standard variation endpoints
      variation: {
        path: "POST /render-variation",
        description: "Render CRO variations with design system",
        example: variationExample
      },
      comparison: {
        path: "POST /render-comparison",
        description: "Side-by-side comparison of control vs variation",
        example: {
          originalHtml: "<h1>Original Page</h1>",
          ...variationExample
        }
      },
      batch: {
        path: "POST /render-batch",
        description: "Batch render multiple variations",
        example: {
          variations: [
            { id: "var1", ...variationExample },
            { id: "var2", ...variationExample }
          ]
        }
      },

      // Enhanced endpoints with CSS integration
      enhancedVariation: {
        path: "POST /render-enhanced-variation",
        description: "Render variations with CSS data integration and brand preservation",
        example: enhancedVariationExample,
        features: [
          "CSS data fetching from reference pages",
          "Brand element preservation",
          "Design intelligence analysis",
          "Thumbnail optimization"
        ]
      },
      enhancedComparison: {
        path: "POST /render-enhanced-comparison",
        description: "Enhanced side-by-side comparison with CSS integration",
        example: {
          originalHtml: "<h1>Original Page</h1>",
          modifiedHtml: "<h1>Enhanced Page</h1>",
          referencePageId: "uuid-of-reference-page",
          options: {
            cssIntegration: {
              enableDesignIntelligence: true,
              preserveBrandElements: true
            }
          }
        }
      },
      enhancedBatch: {
        path: "POST /render-enhanced-batch",
        description: "Batch render with CSS integration",
        example: {
          variations: [
            { id: "enhanced1", ...enhancedVariationExample },
            { id: "enhanced2", ...enhancedVariationExample }
          ]
        }
      },
      
      // NEW: Computed styles extraction
      computedStyles: {
        path: "POST /extract-computed-styles",
        description: "Extract computed styles from HTML using Playwright to get actual rendered values",
        example: {
          html: "<html><body><h1 style='font-family: Arial'>Hello World</h1></body></html>",
          url: "https://example.com",
          options: {
            viewport: { width: 1920, height: 1080 },
            waitForFonts: true,
            includeAll: false,
            maxElements: 100
          }
        },
        response: {
          success: true,
          data: {
            elements: [
              {
                selector: "h1",
                tagName: "h1",
                fontFamily: "Arial, sans-serif",
                fontSize: "32px",
                color: "rgb(0, 0, 0)",
                // ... other computed properties
              }
            ],
            summary: {
              totalElements: 1,
              uniqueFonts: ["Arial, sans-serif"],
              uniqueColors: ["rgb(0, 0, 0)"],
              primaryFont: "Arial, sans-serif",
              primaryColor: "rgb(0, 0, 0)",
              backgroundColor: "rgba(0, 0, 0, 0)"
            },
            cssVariables: {},
            metadata: {
              url: "https://example.com",
              timestamp: "2025-07-18T19:00:00.000Z",
              processingTime: 250,
              viewport: { width: 1920, height: 1080 }
            }
          }
        }
      }
    },
    cssIntegrationOptions: {
      enableDesignIntelligence: "Analyze design quality and brand elements",
      useCriticalCSSOnly: "Extract only above-fold CSS for faster rendering",
      preserveBrandElements: "Maintain brand fonts, colors, and logos",
      optimizeForThumbnails: "Optimize CSS for thumbnail generation"
    },
    note: "Enhanced service with CSS data integration for brand-aware thumbnail generation!"
  });
});

// Error handling middleware
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🎭 Playwright Thumbnail Service running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 Example usage: http://localhost:${PORT}/example`);
  console.log(`✨ Service simplified: Now receives pre-resolved renderData directly`);
});

export default app;
