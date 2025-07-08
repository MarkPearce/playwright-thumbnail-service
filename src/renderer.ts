import { chromium, Browser } from 'playwright';
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

// Load template components as JavaScript code
async function loadTemplateComponents(): Promise<string> {
  try {
    // Load the actual template components with proper Tailwind styling
    return `
      console.log('🔧 Loading real template components...');
      
      // Slide container component with proper Tailwind classes
      const SlideContainer = ({ children, className = '' }) => {
        return React.createElement('div', {
          className: 'w-full bg-white min-h-full md:h-full flex flex-col overflow-hidden lg:h-auto lg:aspect-video p-6 gap-3 md:px-8 md:pt-6 md:pb-8 md:gap-4 lg:px-12 lg:pt-9 lg:pb-12 xl:px-16 xl:pt-12 xl:pb-16 2xl:gap-6 ' + className,
          'data-slide-container': true
        }, children);
      };
      
      // Slide header component
      const SlideHeader = ({ title, subtitle, showLogo = false, className = '' }) => {
        return React.createElement('div', {
          className: 'flex flex-col justify-start items-start ' + className,
          'data-slide-header': true
        }, [
          showLogo && React.createElement('div', {
            key: 'logo',
            className: 'mb-2 md:mb-4 lg:mb-6',
            'data-logo-container': true
          }, React.createElement('div', {
            className: 'bg-blue-100 rounded-lg flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20',
            'data-logo-placeholder': true
          }, React.createElement('span', {
            className: 'text-blue-600 font-bold text-xs md:text-sm lg:text-base',
            'data-logo-text': true
          }, 'LOGO'))),
          
          React.createElement('div', {
            key: 'title',
            className: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-cyan-600 leading-tight py-2',
            'data-slide-title': true
          }, title),
          
          subtitle && React.createElement('div', {
            key: 'subtitle',
            className: 'text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-3xl font-medium text-slate-500 mb-4',
            'data-slide-subtitle': true
          }, subtitle)
        ].filter(Boolean));
      };
      
      // Grid container component
      const GridContainer = ({ children, columns, className = '' }) => {
        const gridClasses = {
          1: 'grid grid-cols-1 gap-3 md:gap-4 lg:gap-4',
          2: 'grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-4',
          3: 'grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-4',
          4: 'grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-4'
        };
        
        return React.createElement('div', {
          className: 'flex-1 ' + (gridClasses[columns] || gridClasses[2]) + ' ' + className,
          'data-grid-container': true
        }, children);
      };
      
      // Content renderer for resolved content
      const ContentRenderer = ({ resolvedContent, slideContent, columnId }) => {
        if (!resolvedContent || !resolvedContent.content || !Array.isArray(resolvedContent.content)) {
          return null;
        }
        
        const contentElements = [];
        
        // Group content by type
        const keyPoints = resolvedContent.content.filter(item => item.type === 'keypoint');
        const details = resolvedContent.content.filter(item => item.type === 'detail');
        const media = resolvedContent.content.filter(item => item.type === 'media');
        
        // Render key points as bullet list
        if (keyPoints.length > 0) {
          contentElements.push(
            React.createElement('ul', {
              key: 'keypoints',
              className: 'space-y-2',
              'data-bullet-list-container': true
            }, keyPoints.map((item, index) => 
              React.createElement('li', {
                key: 'keypoint-' + index,
                className: 'flex items-start space-x-3',
                'data-bullet-list-item': true
              }, [
                React.createElement('p', {
                  key: 'bullet',
                  className: 'flex-shrink-0 text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-cyan-600'
                }, '•'),
                React.createElement('span', {
                  key: 'text',
                  className: 'flex-1 text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-800 leading-relaxed lg:leading-tight'
                }, item.content)
              ])
            ))
          );
        }
        
        // Render details as paragraphs
        if (details.length > 0) {
          details.forEach((item, index) => {
            contentElements.push(
              React.createElement('div', {
                key: 'detail-' + index,
                className: 'text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-medium text-gray-800 leading-relaxed lg:leading-tight',
                'data-detail': true,
                dangerouslySetInnerHTML: { __html: item.content.replace(/\\n/g, '<br>') }
              })
            );
          });
        }
        
        return React.createElement('div', {}, contentElements);
      };
      
      // Resolved content column component
      const ResolvedContentColumn = ({ resolvedContent, className = '', columnId }) => {
        return React.createElement('div', {
          className: 'flex flex-col space-y-4 ' + className,
          'data-content-column': true
        }, React.createElement(ContentRenderer, {
          resolvedContent: resolvedContent,
          slideContent: null,
          columnId: columnId
        }));
      };
      
      // Two column template component
      const TwoColumn = ({ title, subtitle, column1, column2 }) => {
        console.log('🎯 TwoColumn rendering with:', { title, subtitle, column1, column2 });
        
        return React.createElement(SlideContainer, {}, [
          React.createElement(SlideHeader, {
            key: 'header',
            title: title,
            subtitle: subtitle
          }),
          React.createElement(GridContainer, {
            key: 'grid',
            columns: 2
          }, [
            React.createElement(ResolvedContentColumn, {
              key: 'col1',
              resolvedContent: column1,
              columnId: 'column1'
            }),
            React.createElement(ResolvedContentColumn, {
              key: 'col2',
              resolvedContent: column2,
              columnId: 'column2'
            })
          ])
        ]);
      };
      
      // Title slide template
      const TitleSlide = ({ title, subtitle }) => {
        return React.createElement('div', {
          className: 'w-full h-full bg-white flex flex-col justify-center items-center p-16 text-center'
        }, [
          title && React.createElement('h1', {
            key: 'title',
            className: 'text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-cyan-600 leading-tight text-balance mb-6'
          }, title),
          subtitle && React.createElement('h2', {
            key: 'subtitle',
            className: 'text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-medium text-slate-500 text-balance'
          }, subtitle)
        ].filter(Boolean));
      };
      
      // Make components available globally
      window.TemplateComponents = {
        TwoColumn: TwoColumn,
        OneColumn: TwoColumn, // Use TwoColumn as fallback for now
        ThreeColumn: TwoColumn,
        FourColumn: TwoColumn,
        TitleSlide: TitleSlide,
        LogoCard: TitleSlide
      };
      
      console.log('✅ Real template components loaded with Tailwind styling');
    `;
  } catch (error) {
    console.error('Error loading template components:', error);
    return '// Template components failed to load';
  }
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
    format = 'png',
    quality = 90
  } = options;
  
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // Set viewport
    await page.setViewportSize({ width, height });
    
    // Add debugging to check for JavaScript errors BEFORE loading content
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
      console.log(`Browser console [${msg.type()}]:`, msg.text());
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.error('Page error:', error.message);
    });
    
    // Load template components
    const templateComponents = await loadTemplateComponents();
    
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
      // Template components loaded from the service
      ${templateComponents}
      
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
          .map(img => new Promise((resolve) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve); // Resolve even on error
            // Set timeout to prevent hanging
            setTimeout(resolve, 5000);
          }))
      );
    });
    
    // Add slight delay for layout stabilization
    await page.waitForTimeout(500);
    
    // Check if there were any errors
    if (errors.length > 0) {
      console.error('JavaScript errors detected:', errors);
    }
    
    // Check if content was actually rendered
    const bodyContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        hasRoot: !!root,
        rootContent: root ? root.innerHTML.substring(0, 200) : 'No root element',
        bodyText: document.body.innerText.substring(0, 200)
      };
    });
    console.log('Page content check:', bodyContent);
    
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
