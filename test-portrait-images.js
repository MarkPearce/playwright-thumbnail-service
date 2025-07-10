const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const PLAYWRIGHT_SERVICE_URL = 'http://localhost:3001';
const OUTPUT_DIR = './test-thumbnails';

// Test data with portrait image
const testSlides = [
  {
    name: 'portrait-image-test',
    templateId: 'two_column',
    props: {
      title: 'Portrait Image Test',
      subtitle: 'Testing how portrait images render in thumbnails',
      column1: {
        type: 'resolved',
        content: [
          {
            type: 'media',
            media: {
              component: 'ImageFigure',
              props: {
                url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200', // Portrait mountain image
                alt: 'Portrait mountain landscape',
                caption: 'A tall mountain view'
              }
            }
          }
        ]
      },
      column2: {
        type: 'resolved',
        content: [
          {
            type: 'text',
            text: '<p>This column contains text content while the left column has a portrait image. The image should fill the available space without being clipped at the bottom.</p>'
          }
        ]
      }
    }
  },
  {
    name: 'landscape-image-comparison',
    templateId: 'two_column',
    props: {
      title: 'Landscape Image Comparison',
      subtitle: 'Comparing with a landscape image',
      column1: {
        type: 'resolved',
        content: [
          {
            type: 'media',
            media: {
              component: 'ImageFigure',
              props: {
                url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800', // Landscape version
                alt: 'Landscape mountain view',
                caption: 'A wide mountain view'
              }
            }
          }
        ]
      },
      column2: {
        type: 'resolved',
        content: [
          {
            type: 'text',
            text: '<p>This shows how a landscape image renders for comparison. Both images should look good in their containers.</p>'
          }
        ]
      }
    }
  },
  {
    name: 'title-slide-portrait-bg',
    templateId: 'title_slide',
    props: {
      title: 'Portrait Background Test',
      subtitle: 'Testing portrait images as backgrounds',
      author: 'Test Author',
      organization: 'Test Organization',
      background_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=1200' // Portrait coding image
    }
  }
];

async function generateThumbnail(slide) {
  console.log(`\n📸 Generating thumbnail for: ${slide.name}`);
  
  const requestBody = {
    templateId: slide.templateId,
    props: slide.props,
    options: {
      width: 1920,
      height: 1080,
      format: 'png'
    }
  };

  try {
    const response = await fetch(`${PLAYWRIGHT_SERVICE_URL}/thumbnail/template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const imageBuffer = await response.buffer();
    
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    // Save the image
    const outputPath = path.join(OUTPUT_DIR, `${slide.name}.png`);
    await fs.writeFile(outputPath, imageBuffer);
    
    console.log(`✅ Saved to: ${outputPath}`);
    console.log(`   Size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    
    return { success: true, path: outputPath, size: imageBuffer.length };
  } catch (error) {
    console.error(`❌ Error generating thumbnail for ${slide.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Portrait Image Handling in Thumbnails');
  console.log('================================================');
  
  // Check if service is running
  try {
    const healthResponse = await fetch(`${PLAYWRIGHT_SERVICE_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error('Service health check failed');
    }
    console.log('✅ Playwright service is running');
  } catch (error) {
    console.error('❌ Playwright service is not running at', PLAYWRIGHT_SERVICE_URL);
    console.error('   Please start it with: cd external_services/playwright-thumbnail-service && npm start');
    process.exit(1);
  }

  // Generate thumbnails
  const results = [];
  for (const slide of testSlides) {
    const result = await generateThumbnail(slide);
    results.push({ ...result, name: slide.name });
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  const successful = results.filter(r => r.success).length;
  console.log(`Total tests: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${results.length - successful}`);

  if (successful === results.length) {
    console.log('\n✅ All tests passed! Check the generated thumbnails in:', OUTPUT_DIR);
    console.log('\nThe portrait images should now fill their containers properly without being clipped at the bottom.');
  } else {
    console.log('\n❌ Some tests failed. See errors above.');
  }
}

// Run the tests
runTests().catch(console.error);
