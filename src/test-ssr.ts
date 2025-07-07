import fetch from 'node-fetch';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = 'http://localhost:3001';

async function testSSRTemplates() {
  console.log('🧪 Testing SSR Template Rendering...\n');

  // Load article data
  const articlePath = join(__dirname, '../../amboss-presenter/public/articles/U80bN3-automated-pipeline.json');
  const articleData = JSON.parse(readFileSync(articlePath, 'utf-8'));
  const slides = articleData.ArticleData.articleSlideArray;

  // Test cases
  const testCases = [
    {
      name: 'Title Slide',
      templateId: 'title_slide',
      props: {
        title: 'Acanthosis Nigricans',
        subtitle: 'Medical Education Presentation'
      }
    },
    {
      name: 'Two Column Slide',
      templateId: 'two_column',
      props: {
        title: slides[0].content.title,
        subtitle: slides[0].content.subtitle,
        column1: {
          content: slides[0].content.keyPoints?.map((point: string) => ({
            type: 'keypoint',
            content: point
          })) || []
        },
        column2: {
          content: slides[0].content.details ? [{
            type: 'detail',
            content: slides[0].content.details
          }] : []
        }
      }
    }
  ];

  for (const test of testCases) {
    console.log(`📸 Testing: ${test.name} (${test.templateId})`);
    
    try {
      console.log('Sending props:', JSON.stringify(test.props, null, 2));
      
      const response = await fetch(`${API_URL}/thumbnail/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: test.templateId,
          props: test.props,
          options: {
            width: 1280,
            height: 720,
            format: 'png'
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const buffer = await response.buffer();
      const filename = `ssr-${test.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      const filepath = join(process.cwd(), filename);
      
      writeFileSync(filepath, buffer);
      console.log(`✅ Success! Saved to: ${filename}`);
      console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB\n`);
      
    } catch (error) {
      console.error(`❌ Failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }

  // Test health endpoint
  try {
    const healthResponse = await fetch(`${API_URL}/health`);
    const health = await healthResponse.json();
    console.log('🏥 Health Check:', health);
  } catch (error) {
    console.error('❌ Health check failed:', error instanceof Error ? error.message : String(error));
  }
}

// Run tests
testSSRTemplates().catch(console.error);
