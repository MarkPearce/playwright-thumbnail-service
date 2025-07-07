import fetch from 'node-fetch';
import { writeFileSync } from 'fs';
import { join } from 'path';

const API_URL = 'http://localhost:3001';

// Test component that matches your slide structure
const testComponent = `
import React from 'react';

interface SlideProps {
  title?: string;
  subtitle?: string;
  leftContent?: any;
  rightContent?: any;
}

function ContentRenderer({ resolvedContent }: { resolvedContent: any }) {
  if (!resolvedContent || !resolvedContent.content) return null;
  
  return (
    <div>
      {resolvedContent.content.map((item: any, index: number) => {
        if (item.type === 'keypoint') {
          return (
            <div key={index} className="flex items-start space-x-3 mb-4">
              <span className="text-2xl font-bold text-cyan-600">•</span>
              <span className="text-xl text-gray-800">{item.content}</span>
            </div>
          );
        }
        if (item.type === 'detail') {
          return (
            <p key={index} className="text-xl text-gray-800 mb-4">
              {item.content}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function SlideComponent({ title, subtitle, leftContent, rightContent }: SlideProps) {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="px-12 pt-12 pb-8">
        {title && (
          <h1 className="text-5xl font-bold text-blue-600 mb-4" style={{ fontFamily: 'Lora, serif' }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <h2 className="text-3xl text-gray-600">{subtitle}</h2>
        )}
      </div>
      
      <div className="flex-1 px-12 pb-12 grid grid-cols-2 gap-8">
        <div>
          <ContentRenderer resolvedContent={leftContent} />
        </div>
        <div>
          <ContentRenderer resolvedContent={rightContent} />
        </div>
      </div>
    </div>
  );
}
`;

async function testThumbnailGeneration() {
  console.log('🧪 Testing Playwright Thumbnail Service...\n');

  const testCases = [
    {
      name: 'Two Column Slide',
      props: {
        title: 'Understanding Acanthosis Nigricans',
        subtitle: 'Key Features and Clinical Significance',
        leftContent: {
          content: [
            { type: 'keypoint', content: 'Characterized by velvety, hyperpigmented plaques' },
            { type: 'keypoint', content: 'Commonly found in intertriginous areas' },
            { type: 'keypoint', content: 'Can indicate serious underlying conditions' },
          ]
        },
        rightContent: {
          content: [
            { 
              type: 'detail', 
              content: 'Acanthosis nigricans is a dermatological sign that may reflect metabolic disorders. Early recognition is essential for appropriate management.'
            }
          ]
        }
      }
    },
    {
      name: 'Title Slide',
      props: {
        title: 'Medical Presentation',
        subtitle: 'AMBOSS Education Platform'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📸 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${API_URL}/thumbnail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component: testComponent,
          props: testCase.props,
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
      const filename = `test-${testCase.name.toLowerCase().replace(/\s+/g, '-')}.png`;
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
testThumbnailGeneration().catch(console.error);
