import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to fix imports in a file
function fixImports(filePath: string) {
  let content = readFileSync(filePath, 'utf-8');
  let changed = false;
  
  // Fix all @/ imports
  const originalContent = content;
  
  // Fix imports from domains
  content = content.replace(/from '@\/domains\/[^']*'/g, "from './types'");
  content = content.replace(/from '@\/shared\/[^']*'/g, "from './slideStyles'");
  content = content.replace(/from '\.\.\/types'/g, "from './types'");
  content = content.replace(/from '\.\.\/shared'/g, "from './shared'");
  
  // Remove any editor-specific imports
  content = content.replace(/import.*useTemplateEditor.*\n/g, '');
  content = content.replace(/import.*TemplateProvider.*\n/g, '');
  content = content.replace(/import.*useTemplateContext.*\n/g, '');
  content = content.replace(/import.*TemplateContext.*\n/g, '');
  
  // Remove comments about editor functionality
  content = content.replace(/\/\/ Templates now get editor functionality.*\n/g, '');
  content = content.replace(/\/\/ No need to pass editor props.*\n/g, '');
  
  if (content !== originalContent) {
    writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
    changed = true;
  }
  
  return changed;
}

// Recursively fix all files
function fixAllFiles(dir: string) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      fixAllFiles(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixImports(filePath);
    }
  });
}

// Fix all template files
const templatesDir = join(__dirname, 'templates');
fixAllFiles(templatesDir);

console.log('✅ All imports fixed!');
