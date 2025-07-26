# Playwright Thumbnail Service

High-performance thumbnail generation service for AMBOSS Presenter slides using Playwright and React Server-Side Rendering.

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://hub.docker.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.45-green?logo=playwright)](https://playwright.dev/)

## 🚀 Features

- **🎭 Playwright-based rendering** - High-quality browser automation for pixel-perfect thumbnails
- **⚛️ React SSR support** - Server-side rendering for fast, consistent output
- **🎨 Multiple slide templates** - Pre-built templates for medical education content
- **🏥 AMBOSS Integration** - Purpose-built for AMBOSS Presenter slide thumbnails
- **🐳 Docker ready** - Production-ready containerization
- **📊 Multiple formats** - PNG, JPEG, WebP output support
- **🔧 TypeScript** - Full type safety and developer experience

## 📋 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/MarkPearce/playwright-thumbnail-service.git
cd playwright-thumbnail-service

# Install dependencies
npm install

# Start development server
npm run dev
```

The service will be available at `http://localhost:3001`

### Health Check

```bash
curl http://localhost:3001/health
```

## 🎯 Usage

### Basic Template Rendering

```bash
curl -X POST http://localhost:3001/thumbnail/template \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "two_column",
    "props": {
      "title": "Understanding Acanthosis Nigricans",
      "subtitle": "Key Features and Clinical Significance",
      "column1": {
        "content": [
          {
            "type": "keypoint",
            "content": "Characterized by velvety, hyperpigmented plaques"
          }
        ]
      },
      "column2": {
        "content": [
          {
            "type": "detail",
            "content": "Acanthosis nigricans is a dermatological sign..."
          }
        ]
      }
    },
    "options": {
      "width": 1280,
      "height": 720,
      "format": "png"
    }
  }' \
  --output slide.png
```

### JavaScript/TypeScript Integration

```typescript
async function generateThumbnail(templateId: string, props: any) {
  const response = await fetch('http://localhost:3001/thumbnail/template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateId,
      props,
      options: {
        width: 1280,
        height: 720,
        format: 'webp'
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Thumbnail generation failed: ${response.statusText}`);
  }

  return response.arrayBuffer();
}
```

## 📚 API Documentation

For complete API documentation including all endpoints, template types, and examples, see:

**[📖 API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

### Available Templates

| Template ID | Description | Use Case |
|-------------|-------------|----------|
| `title_slide` | Title slide with background image | Presentation covers, section dividers |
| `two_column` | Two-column layout | Content with keypoints and details |
| `one_column` | Single column layout | Simple content, lists |
| `three_column` | Three-column layout | Comparative content |
| `four_column` | Four-column layout | Dense information display |
| `logo_card` | Logo with text overlay | Branding, company slides |

### Key Endpoints

- `GET /health` - Service health check
- `POST /thumbnail/template` - Template-based rendering (recommended)
- `POST /thumbnail` - Direct component rendering
- `POST /render-variation` - CRO variation rendering
- `POST /render-comparison` - Side-by-side comparisons

## 🐳 Deployment

### Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t playwright-thumbnail-service .
docker run -p 3001:3001 playwright-thumbnail-service
```

### Production Deployment

The service is deployed and ready for production use. See deployment guides:

- **[🚀 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - General deployment instructions
- **[☁️ docker-render.md](./docker-render.md)** - Render.com specific deployment

### Environment Variables

```bash
NODE_ENV=production
PORT=3001
```

## 🏗️ Architecture

```
src/
├── server.ts                    # Main Express server
├── renderer.ts                  # Core Playwright rendering
├── ssr/
│   ├── entry.tsx               # SSR entry point
│   └── html-renderer.ts        # HTML to image conversion
├── templates/                   # React slide templates
│   ├── TitleSlide.tsx
│   ├── TwoColumn.tsx
│   └── ...
├── types/                      # TypeScript definitions
└── services/                   # Additional services
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

### Adding New Templates

1. Create a new React component in `src/templates/`
2. Export it from `src/templates/index.ts`
3. Add template ID mapping in `src/server.ts`
4. Update API documentation

## 🏥 AMBOSS Integration

This service is specifically designed for AMBOSS Presenter and handles:

- **Medical education content** with keypoints, clinical details, and medical imagery
- **AMBOSS slide data format** with pre-resolved content structure
- **Brand-consistent styling** matching AMBOSS design system
- **High-quality thumbnails** for presentation previews

### AMBOSS Slide Types

- `'amboss'` - AMBOSS medical education content
- `'custom'` - User-generated custom slides

## 📊 Performance

- **Concurrent requests** supported
- **Browser instance reuse** for efficiency
- **Memory optimization** for high-throughput scenarios
- **Caching headers** included (1 hour cache)
- **30-second timeout** protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub Repository**: https://github.com/MarkPearce/playwright-thumbnail-service
- **Issues**: https://github.com/MarkPearce/playwright-thumbnail-service/issues
- **AMBOSS**: https://www.amboss.com/

## 📞 Support

For questions or support:

1. Check the [API Documentation](./API_DOCUMENTATION.md)
2. Review [Deployment Guide](./DEPLOYMENT_GUIDE.md)
3. Open an issue on GitHub

---

**Built with ❤️ for medical education at AMBOSS**
