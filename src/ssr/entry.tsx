import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import templates
import { TwoColumn } from '../templates/TwoColumn.js';
import { TitleSlide } from '../templates/TitleSlide.js';
import { OneColumn } from '../templates/OneColumn.js';
import { ThreeColumn } from '../templates/ThreeColumn.js';
import { FourColumn } from '../templates/FourColumn.js';
import { LogoCard } from '../templates/LogoCard.js';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the compiled CSS file
let compiledCSS = '';
try {
  const cssPath = path.join(__dirname, '../../public/styles.css');
  compiledCSS = fs.readFileSync(cssPath, 'utf8');
  console.log(`✅ Loaded CSS file from: ${cssPath}`);
  console.log(`📏 CSS file size: ${compiledCSS.length} bytes`);
  
  // Check if key classes are present
  const hasLargeText = compiledCSS.includes('text-9xl') || compiledCSS.includes('text-8xl');
  console.log(`🔍 Contains large text classes: ${hasLargeText}`);
} catch (error) {
  console.error('❌ Failed to load compiled CSS:', error);
  console.error(`Attempted path: ${path.join(__dirname, '../../public/styles.css')}`);
  // Fallback to empty CSS if file not found
  compiledCSS = '';
}

// Template map
const templateMap: Record<string, any> = {
  'two_column': TwoColumn,
  'title_slide': TitleSlide,
  'one_column': OneColumn,
  'three_column': ThreeColumn,
  'four_column': FourColumn,
  'logo_card': LogoCard
};

export interface SSRRenderOptions {
  templateId: string;
  props: any;
  width?: number;
  height?: number;
}

export function renderTemplate(options: SSRRenderOptions): string {
  const { templateId, props, width = 1280, height = 720 } = options;
  
  const template = templateMap[templateId];
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }
  
  // Get the component function from the template definition
  const Component = template.component;
  
  // Create the React element
  const element = React.createElement(Component, props);
  
  // Render to HTML string
  const html = renderToString(element);
  
  // Return complete HTML document with compiled styles
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      /* Compiled Tailwind CSS */
      ${compiledCSS}
      
      /* Additional styles for proper rendering */
      body {
        width: ${width}px;
        height: ${height}px;
        overflow: hidden;
        margin: 0;
        padding: 0;
        font-family: 'Lato', sans-serif;
      }
      
      #root {
        width: 100%;
        height: 100%;
      }
      
      /* Ensure proper font rendering */
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
    </style>
  </head>
  <body>
    <div id="root">${html}</div>
  </body>
</html>
  `;
}
