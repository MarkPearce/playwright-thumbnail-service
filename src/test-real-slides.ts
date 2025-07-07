import fetch from 'node-fetch';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = 'http://localhost:3001';

// Your actual slide component structure
const slideComponent = `
import React from 'react';

// Slide container component
function SlideContainer({ children }) {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      {children}
    </div>
  );
}

// Slide header component
function SlideHeader({ title, subtitle }) {
  return (
    <div className="px-12 pt-12 pb-8">
      {title && (
        <h1 className="text-5xl font-bold text-blue-600 mb-4 leading-tight" style={{ fontFamily: 'Lora, serif' }}>
          {title}
        </h1>
      )}
      {subtitle && (
        <h2 className="text-3xl text-gray-600">
          {subtitle}
        </h2>
      )}
    </div>
  );
}

// Grid container
function GridContainer({ columns, children }) {
  const gridClass = columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-1';
  return (
    <div className={\`flex-1 px-12 pb-12 grid \${gridClass} gap-8\`}>
      {children}
    </div>
  );
}

// Content renderer
function ContentRenderer({ resolvedContent }) {
  if (!resolvedContent || !resolvedContent.content) return null;
  
  return (
    <div className="space-y-4">
      {resolvedContent.content.map((item, index) => {
        if (item.type === 'keypoint') {
          return (
            <div key={index} className="flex items-start space-x-3">
              <span className="text-2xl font-bold text-cyan-600 flex-shrink-0">•</span>
              <span className="text-xl text-gray-800 leading-relaxed">{item.content}</span>
            </div>
          );
        }
        if (item.type === 'detail') {
          return (
            <p key={index} className="text-xl text-gray-800 leading-relaxed">
              {item.content}
            </p>
          );
        }
        if (item.type === 'media' && item.content.props) {
          return (
            <div key={index} className="my-6">
              <img 
                src={item.content.props.url} 
                alt={item.content.props.caption || 'Medical image'}
                className="w-full rounded-lg shadow-md"
              />
              {item.content.props.caption && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  {item.content.props.caption}
                </p>
              )}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// Two column template
export default function TwoColumnSlide({ title, subtitle, column1, column2 }) {
  return (
    <SlideContainer>
      <SlideHeader title={title} subtitle={subtitle} />
      <GridContainer columns={2}>
        <ContentRenderer resolvedContent={column1} />
        <ContentRenderer resolvedContent={column2} />
      </GridContainer>
    </SlideContainer>
  );
}
`;

// Convert article data to resolved content format
function convertToResolvedContent(slideData: any) {
  const { content } = slideData;
  
  // Create resolved content for columns
  const resolvedContent: any = {
    content: []
  };
  
  // Add key points
  if (content.keyPoints && content.keyPoints.length > 0) {
    content.keyPoints.forEach((point: string) => {
      resolvedContent.content.push({
        type: 'keypoint',
        content: point
      });
    });
  }
  
  // Add details
  if (content.details) {
    resolvedContent.content.push({
      type: 'detail',
      content: content.details
    });
  }
  
  // Add media
  if (content.media && content.media.length > 0) {
    content.media.forEach((media: any) => {
      resolvedContent.content.push({
        type: 'media',
        content: media
      });
    });
  }
  
  return resolvedContent;
}

async function testRealSlides() {
  console.log('🧪 Testing Playwright Thumbnail Service with Real Slides...\n');

  // Load article data
  const articlePath = join(__dirname, '../../amboss-presenter/public/articles/U80bN3-automated-pipeline.json');
  const articleData = JSON.parse(readFileSync(articlePath, 'utf-8'));
  const slides = articleData.ArticleData.articleSlideArray;

  // Test specific slides
  const testSlides = [
    {
      name: 'First Content Slide',
      slideData: slides[0], // Understanding Acanthosis Nigricans
      layout: 'two-column'
    },
    {
      name: 'Slide with Media',
      slideData: slides[3], // Clinical Features with images
      layout: 'two-column'
    }
  ];

  for (const test of testSlides) {
    console.log(`📸 Testing: ${test.name}`);
    
    try {
      const { content } = test.slideData;
      
      // Split content for two columns
      const leftContent = convertToResolvedContent({
        content: {
          keyPoints: content.keyPoints || []
        }
      });
      
      const rightContent = convertToResolvedContent({
        content: {
          details: content.details,
          media: content.media
        }
      });
      
      const props = {
        title: content.title,
        subtitle: content.subtitle,
        column1: leftContent,
        column2: rightContent
      };
      
      console.log('Sending props:', JSON.stringify(props, null, 2));
      
      const response = await fetch(`${API_URL}/thumbnail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component: slideComponent,
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
      const filename = `real-${test.name.toLowerCase().replace(/\s+/g, '-')}.png`;
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
testRealSlides().catch(console.error);
