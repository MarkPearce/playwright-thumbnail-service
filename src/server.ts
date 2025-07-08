import express from 'express';
import cors from 'cors';
import { renderThumbnail } from './renderer.js';
import { renderTemplate } from './ssr/entry.js';
import { renderHTMLToImage } from './ssr/html-renderer.js';
import type { ThumbnailRequest, ThumbnailOptions } from './types.js';

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
      hasResolvedContent: !!slideData.resolved_content
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
        
        // Use resolved content directly
        const resolvedContent = slideData.resolved_content || {};
        
        // Render using the actual template component
        return React.createElement(TemplateComponent, resolvedContent);
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
    
    // Render template to HTML using SSR
    const html = renderTemplate({
      templateId,
      props,
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
  
  res.json({
    message: "Playwright Thumbnail Service - Example Usage",
    endpoint: "POST /thumbnail",
    example: exampleRequest,
    note: "Send TSX component code directly - no JavaScript conversion needed!"
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
});

export default app;
