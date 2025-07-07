import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a bundled version of templates that can be used in the browser
function createTemplateBundle() {
  const templates = ['TwoColumn', 'TitleSlide', 'OneColumn', 'ThreeColumn', 'FourColumn'];
  
  let bundle = `
// Auto-generated template bundle for browser rendering
const React = window.React;

// Shared components
`;

  // Read shared components
  const sharedFiles = [
    'SlideContainer',
    'SlideHeader', 
    'SlideTitle',
    'SlideSubtitle',
    'GridContainer',
    'ResolvedContentColumn',
    'ContentRenderer',
    'slideStyles'
  ];

  sharedFiles.forEach(file => {
    try {
      let content = readFileSync(join(__dirname, `templates/shared/${file}.tsx`), 'utf-8');
      
      // Remove imports and exports
      content = content.replace(/import.*from.*;?\n/g, '');
      content = content.replace(/export\s+(default\s+)?/g, '');
      content = content.replace(/export\s*{[^}]*};?\n/g, '');
      
      bundle += `\n// ${file}\n${content}\n`;
    } catch (e) {
      console.log(`Skipping ${file}: ${e}`);
    }
  });

  // Add template components
  bundle += `\n// Template Components\n`;
  
  templates.forEach(template => {
    try {
      let content = readFileSync(join(__dirname, `templates/${template}.tsx`), 'utf-8');
      
      // Extract just the component function
      const componentMatch = content.match(/component:\s*\(([^)]*)\)\s*=>\s*{([^}]+(?:{[^}]*}[^}]*)*)}/s);
      
      if (componentMatch) {
        const params = componentMatch[1];
        const body = componentMatch[2];
        
        bundle += `
const ${template} = (${params}) => {
  ${body}
};
`;
      }
    } catch (e) {
      console.log(`Error processing ${template}: ${e}`);
    }
  });

  // Add template map
  bundle += `
// Template map
const templateMap = {
  'two_column': TwoColumn,
  'title_slide': TitleSlide,
  'one_column': OneColumn,
  'three_column': ThreeColumn,
  'four_column': FourColumn
};

// Get template by ID
function getTemplate(templateId) {
  return templateMap[templateId];
}
`;

  // Write bundle
  const outputPath = join(__dirname, 'template-bundle.js');
  writeFileSync(outputPath, bundle);
  console.log(`✅ Template bundle created at: ${outputPath}`);
}

createTemplateBundle();
