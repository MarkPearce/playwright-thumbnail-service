import { chromium, Browser, Page } from 'playwright';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ThumbnailOptions } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let browser: Browser | null = null;

// Get or create browser instance
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--deterministic-fetch',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials',
      ]
    });
  }
  return browser;
}

// Load Tailwind CSS
let tailwindCSS = '';
try {
  tailwindCSS = readFileSync(join(__dirname, '..', 'public', 'styles.css'), 'utf8');
} catch (error) {
  console.warn('Tailwind CSS not found. Run "npm run build:css" to generate styles.');
}

/**
 * Renders a TSX component to an image buffer using Playwright
 * @param componentCode - TSX component code as string
 * @param props - Props to pass to the component
 * @param options - Rendering options (width, height, etc.)
 * @returns Image buffer
 */
export async function renderThumbnail(
  componentCode: string,
  props: Record<string, any>,
  options: ThumbnailOptions
): Promise<Buffer> {
  const {
    width = 1280,
    height = 720,
    deviceScaleFactor = 0.5,
    format = 'png',
    quality = 90
  } = options;
  
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // Set viewport
    await page.setViewportSize({ width, height });
    
    // Create HTML with inline React and component
    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      ${tailwindCSS}
      
      /* Additional base styles */
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
    <div id="root"></div>
    <script type="text/babel">
      // Component code
      ${componentCode}
      
      // Get the default export or the first exported component
      const Component = typeof ExampleSlide !== 'undefined' ? ExampleSlide : 
                       typeof SlideComponent !== 'undefined' ? SlideComponent :
                       typeof Slide !== 'undefined' ? Slide :
                       (() => <div>No component found</div>);
      
      // Props passed from server
      const props = ${JSON.stringify(props)};
      
      // Render the component
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(Component, props));
    </script>
  </body>
</html>
    `;
    
    // Set content and wait for rendering
    await page.setContent(html, { 
      waitUntil: 'networkidle'
    });
    
    // Wait for fonts to load
    await page.evaluate(() => {
      return document.fonts.ready;
    });
    
    // Wait for all images to load
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise((resolve, reject) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve); // Resolve even on error
            // Set timeout to prevent hanging
            setTimeout(resolve, 5000);
          }))
      );
    });
    
    // Add slight delay for layout stabilization
    await page.waitForTimeout(500);
    
    // Take screenshot
    const screenshotOptions: any = {
      type: format,
      clip: {
        x: 0,
        y: 0,
        width,
        height
      }
    };
    
    if (format === 'jpeg') {
      screenshotOptions.quality = quality;
    }
    
    const imageBuffer = await page.screenshot(screenshotOptions);
    
    return imageBuffer;
    
  } finally {
    await page.close();
  }
}

// Cleanup function
export async function cleanup() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
