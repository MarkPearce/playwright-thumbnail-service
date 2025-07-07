import { Express } from 'express';
import { getTemplateComponent } from './template-adapter.js';
import { ThumbnailOptions } from './types.js';
import { renderThumbnail } from './renderer.js';

// Template-based thumbnail generation endpoint
export const setupTemplateEndpoint = (app: Express) => {
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
    
    console.log('Template thumbnail request:', { 
      templateId,
      propsKeys: Object.keys(props),
      options 
    });
    
    // Get the template component
    let Component;
    try {
      Component = getTemplateComponent(templateId);
    } catch (error) {
      res.status(400).json({ 
        error: 'Invalid template',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
    
    // Create the component code that will be rendered
    const componentCode = `
      ${Component.toString()}
      
      // Export the component
      const TemplateComponent = ${Component.name || 'Component'};
    `;
    
    // Default options
    const defaultOptions: ThumbnailOptions = {
      width: 1280,
      height: 720,
      deviceScaleFactor: 0.5,
      format: 'png'
    };
    
    const renderOptions = { ...defaultOptions, ...options };
    
    // Generate thumbnail using the existing renderer
    const imageBuffer = await renderThumbnail(componentCode, props, renderOptions);
    
    // Set response headers
    res.set({
      'Content-Type': `image/${renderOptions.format}`,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Error generating template thumbnail:', error);
    res.status(500).json({ 
      error: 'Failed to generate thumbnail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  });
};
