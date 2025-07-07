import fetch from 'node-fetch';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = 'http://localhost:3001';

async function testWithTemplates() {
  console.log('🧪 Testing Playwright Thumbnail Service with Real Templates...\n');

  // Load article data
  const articlePath = join(__dirname, '../../amboss-presenter/public/articles/U80bN3-automated-pipeline.json');
  const articleData = JSON.parse(readFileSync(articlePath, 'utf-8'));
  const slides = articleData.ArticleData.articleSlideArray;

  // Test specific slides
  const testCases = [
    {
      name: 'Two Column Slide',
      templateId: 'two_column',
      slideData: slides[0], // Understanding Acanthosis Nigricans
    },
    {
      name: 'Title Slide',
      templateId: 'title_slide',
      props: {
        title: 'Medical Presentation',
        subtitle: 'AMBOSS Education Platform'
      }
    }
  ];

  for (const test of testCases) {
    console.log(`📸 Testing: ${test.name} (${test.templateId})`);
    
    try {
      let props = {};
      
      if (test.slideData) {
        // Convert slide data to template props
        const { content } = test.slideData;
        
        // Create resolved content format
        const createResolvedContent = (items: any[]) => ({
          content: items
        });
        
        // Build keypoints
        const keypoints = content.keyPoints?.map((point: string) => ({
          type: 'keypoint',
          content: point
        })) || [];
        
        // Build details
        const details = content.details ? [{
          type: 'detail',
          content: content.details
        }] : [];
        
        // Build media
        const media = content.media?.map((m: any) => ({
          type: 'media',
          content: m
        })) || [];
        
        // Assign to columns based on template
        if (test.templateId === 'two_column') {
          props = {
            title: content.title,
            subtitle: content.subtitle,
            column1: createResolvedContent(keypoints),
            column2: createResolvedContent([...details, ...media])
          };
        }
      } else {
        props = test.props || {};
      }
      
      console.log('Sending request with props:', JSON.stringify(props, null, 2));
      
      const response = await fetch(`${API_URL}/thumbnail/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: test.templateId,
          props,
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
      const filename = `template-${test.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      const filepath = join(process.cwd(), filename);
      
      writeFileSync(filepath, buffer);
      console.log(`✅ Success! Saved to: ${filename}`);
      console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB\n`);
      
    } catch (error) {
      console.error(`❌ Failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }
}

// Run tests
testWithTemplates().catch(console.error);
