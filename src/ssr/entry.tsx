import React from 'react';
import { renderToString } from 'react-dom/server';

// Import templates
import { TwoColumn } from '../templates/TwoColumn';
import { TitleSlide } from '../templates/TitleSlide';
import { OneColumn } from '../templates/OneColumn';
import { ThreeColumn } from '../templates/ThreeColumn';
import { FourColumn } from '../templates/FourColumn';
import { LogoCard } from '../templates/LogoCard';

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
  
  // Return complete HTML document with styles
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
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
      
      /* Slide-specific styles */
      .slide-title {
        font-family: 'Lora', serif;
      }
    </style>
  </head>
  <body>
    <div id="root">${html}</div>
  </body>
</html>
  `;
}
