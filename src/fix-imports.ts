import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to fix imports in a file
function fixImports(filePath: string) {
  let content = readFileSync(filePath, 'utf-8');
  
  // Fix imports from domains
  content = content.replace(/from '\.\.\/types'/g, "from './types'");
  content = content.replace(/from '\.\.\/shared'/g, "from './shared'");
  content = content.replace(/from '@\/domains\/content\/services\/template\/templates\/types'/g, "from './types'");
  content = content.replace(/from '@\/domains\/content\/services\/template\/templates\/shared'/g, "from './shared'");
  
  // Remove any editor-specific imports
  content = content.replace(/import.*useTemplateEditor.*\n/g, '');
  content = content.replace(/import.*TemplateProvider.*\n/g, '');
  
  // Remove comments about editor functionality
  content = content.replace(/\/\/ Templates now get editor functionality.*\n/g, '');
  content = content.replace(/\/\/ No need to pass editor props.*\n/g, '');
  
  writeFileSync(filePath, content);
  console.log(`Fixed imports in: ${filePath}`);
}

// Fix all template files
const templatesDir = join(__dirname, 'templates');
const files = readdirSync(templatesDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  fixImports(join(templatesDir, file));
});

// Fix shared files
const sharedDir = join(templatesDir, 'shared');
const sharedFiles = readdirSync(sharedDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

sharedFiles.forEach(file => {
  fixImports(join(sharedDir, file));
});

console.log('✅ All imports fixed!');
