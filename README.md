# Playwright Thumbnail Service

High-performance thumbnail generation service using Playwright and React Server-Side Rendering. Generate beautiful slide thumbnails from React templates with real content integration.

## 🎯 Features

- 🎭 **Playwright-based rendering** - More robust than Puppeteer
- ⚛️ **React SSR support** - Server-side rendering with `renderToString`
- 🎨 **Multiple slide templates** - Title, two-column, three-column, four-column layouts
- 🐳 **Docker ready** - Complete containerization with docker-compose
- 📊 **Real content integration** - Works with your actual slide data
- 🚀 **High performance** - Browser instance reuse and caching
- 📝 **TypeScript support** - Full type safety throughout

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/playwright-thumbnail-service.git
cd playwright-thumbnail-service

# Install dependencies
npm install

# Install Playwright browser
npx playwright install chromium

# Build CSS
npm run build:css

# Start development server
npm run dev
```

The service will be available at `http://localhost:3001`

### Test the Service

```bash
# Run SSR template tests
npm run test:ssr

# Check health
curl http://localhost:3001/health
```

## 📖 API Usage

### Generate a Two-Column Slide

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
          },
          {
            "type": "keypoint",
            "content": "Commonly found in intertriginous areas"
          }
        ]
      },
      "column2": {
        "content": [
          {
            "type": "detail",
            "content": "Acanthosis nigricans is a dermatological sign that may reflect metabolic disorders."
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

### Generate a Title Slide

```bash
curl -X POST http://localhost:3001/thumbnail/template \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "title_slide",
    "props": {
      "title": "Medical Education Presentation",
      "subtitle": "AMBOSS Learning Platform",
      "author": "Dr. Smith",
      "organization": "Medical University"
    }
  }' \
  --output title.png
```

## 🎨 Available Templates

| Template ID | Description | Use Case |
|-------------|-------------|----------|
| `title_slide` | Title slide with background image | Presentation covers, section dividers |
| `two_column` | Two-column layout | Content with keypoints and details |
| `one_column` | Single column layout | Simple content, lists |
| `three_column` | Three-column layout | Comparative content |
| `four_column` | Four-column layout | Dense information display |
| `logo_card` | Logo with text overlay | Branding, company slides |

## 🐳 Docker Deployment

### Local Development
```bash
docker-compose up
```

### Production Build
```bash
docker build -t playwright-thumbnail-service .
docker run -p 3001:3001 playwright-thumbnail-service
```

## ☁️ Cloud Deployment

### Render.com (Recommended)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Select Docker as the environment
4. Deploy automatically on git push

See [docker-render.md](./docker-render.md) for detailed deployment instructions.

### Other Platforms
- **Vercel**: Zero-config deployment
- **Railway**: One-click deployment
- **Google Cloud Run**: Serverless containers
- **AWS ECS**: Enterprise container orchestration

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[SSR Implementation](./SSR_SUCCESS_SUMMARY.md)** - Technical implementation details
- **[Deployment Guide](./docker-render.md)** - Production deployment instructions
- **[GitHub Setup](./GITHUB_SETUP.md)** - Repository setup guide

## 🏗️ Architecture

```
Request → SSR Server (React renderToString) → HTML → Playwright → PNG/JPEG/WebP
```

1. **Template Selection**: Choose template by ID
2. **SSR Rendering**: React renders component to HTML string
3. **HTML Enhancement**: Add fonts, styles, viewport settings
4. **Playwright Capture**: Screenshot the rendered HTML in Chromium
5. **Image Response**: Return optimized image with proper headers

## 🔧 Development

### Project Structure
```
src/
├── server.ts              # Main Express server
├── ssr/
│   ├── entry.tsx          # SSR rendering logic
│   └── html-renderer.ts   # Playwright HTML capture
├── templates/             # React slide templates
│   ├── TitleSlide.tsx
│   ├── TwoColumn.tsx
│   └── shared/            # Shared components
└── test-ssr.ts           # Test suite
```

### Available Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run build:css    # Build Tailwind CSS
npm run test         # Run basic tests
npm run test:ssr     # Run SSR template tests
```

### Adding New Templates
1. Create template component in `src/templates/`
2. Add to template map in `src/ssr/entry.tsx`
3. Update API documentation
4. Add tests

## 🚨 Troubleshooting

### Common Issues

**Service won't start**
```bash
# Check if port 3001 is available
lsof -i :3001

# Install Playwright browsers
npx playwright install
```

**Template not found**
- Verify `templateId` matches available templates
- Check template map in `src/ssr/entry.tsx`

**Image generation fails**
- Verify content structure matches expected format
- Check browser console for JavaScript errors
- Ensure media URLs are accessible

### Debug Mode
```bash
DEBUG=playwright:* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) for robust browser automation
- [React](https://reactjs.org/) for component rendering
- [Vite](https://vitejs.dev/) for SSR support
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Built with ❤️ for high-quality thumbnail generation**
