# Playwright Thumbnail Service - API Documentation

## Overview

The Playwright Thumbnail Service generates high-quality PNG/JPEG/WebP thumbnails from React templates using server-side rendering and Playwright browser automation.

- **Base URL**: `http://localhost:3001` (development)
- **Production**: Deploy to Render.com or any Docker-compatible platform
- **Authentication**: None required
- **Content-Type**: `application/json` for requests, `image/*` for responses

---

## Endpoints

### 1. Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-07T09:16:11.090Z",
  "service": "playwright-thumbnail-service"
}
```

### 2. Template-Based Thumbnail Generation (Recommended)
```
POST /thumbnail/template
```

**Request Body:**
```json
{
  "templateId": "two_column",
  "props": {
    "title": "Slide Title",
    "subtitle": "Slide Subtitle",
    "column1": { "content": [...] },
    "column2": { "content": [...] }
  },
  "options": {
    "width": 1280,
    "height": 720,
    "format": "png"
  }
}
```

**Response:** Binary image data with appropriate `Content-Type` header

### 3. Direct Component Rendering (Legacy)
```
POST /thumbnail
```

**Request Body:**
```json
{
  "component": "// TSX component code as string",
  "props": { ... },
  "options": { ... }
}
```

---

## Template IDs

| Template ID | Description | Use Case |
|-------------|-------------|----------|
| `title_slide` | Title slide with background image | Presentation covers, section dividers |
| `two_column` | Two-column layout | Content with keypoints and details |
| `one_column` | Single column layout | Simple content, lists |
| `three_column` | Three-column layout | Comparative content |
| `four_column` | Four-column layout | Dense information display |
| `logo_card` | Logo with text overlay | Branding, company slides |

---

## Request Format

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `templateId` | string | Template identifier (see Template IDs above) |
| `props` | object | Template-specific properties |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `options` | object | `{}` | Rendering options |
| `options.width` | number | `1280` | Image width in pixels |
| `options.height` | number | `720` | Image height in pixels |
| `options.format` | string | `"png"` | Output format: `"png"`, `"jpeg"`, `"webp"` |
| `options.quality` | number | `90` | JPEG quality (1-100) |
| `options.deviceScaleFactor` | number | `0.5` | Device pixel ratio |

---

## Template Props

### Title Slide (`title_slide`)

```json
{
  "templateId": "title_slide",
  "props": {
    "title": "Presentation Title",
    "subtitle": "Subtitle or Topic",
    "author": "Author Name",
    "organization": "Organization Name",
    "background_image": "/path/to/image.jpg"
  }
}
```

**Props:**
- `title` (required): Main presentation title
- `subtitle` (optional): Subtitle or description
- `author` (optional): Author name
- `organization` (optional): Organization or company
- `background_image` (optional): Background image URL

### Two Column (`two_column`)

```json
{
  "templateId": "two_column",
  "props": {
    "title": "Slide Title",
    "subtitle": "Slide Subtitle",
    "column1": {
      "content": [
        {
          "type": "keypoint",
          "content": "Important point to highlight"
        },
        {
          "type": "keypoint", 
          "content": "Another key insight"
        }
      ]
    },
    "column2": {
      "content": [
        {
          "type": "detail",
          "content": "Detailed explanation or supporting information that provides context."
        },
        {
          "type": "media",
          "content": {
            "component": "ImageFigure",
            "props": {
              "url": "https://example.com/image.jpg",
              "caption": "Image description"
            }
          }
        }
      ]
    }
  }
}
```

**Props:**
- `title` (optional): Slide title
- `subtitle` (optional): Slide subtitle  
- `column1` (required): Left column content
- `column2` (required): Right column content

### One Column (`one_column`)

```json
{
  "templateId": "one_column",
  "props": {
    "title": "Slide Title",
    "subtitle": "Slide Subtitle",
    "column1": {
      "content": [
        {
          "type": "keypoint",
          "content": "Single column content"
        }
      ]
    }
  }
}
```

### Three Column (`three_column`)

```json
{
  "templateId": "three_column", 
  "props": {
    "title": "Slide Title",
    "subtitle": "Slide Subtitle",
    "column1": { "content": [...] },
    "column2": { "content": [...] },
    "column3": { "content": [...] }
  }
}
```

### Four Column (`four_column`)

```json
{
  "templateId": "four_column",
  "props": {
    "title": "Slide Title", 
    "subtitle": "Slide Subtitle",
    "column1": { "content": [...] },
    "column2": { "content": [...] },
    "column3": { "content": [...] },
    "column4": { "content": [...] }
  }
}
```

---

## Content Types

### Keypoint
Highlighted bullet points or important statements.

```json
{
  "type": "keypoint",
  "content": "Important point to emphasize"
}
```

### Detail
Explanatory text or supporting information.

```json
{
  "type": "detail", 
  "content": "Detailed explanation that provides context and additional information."
}
```

### Media
Images, figures, or other media content.

```json
{
  "type": "media",
  "content": {
    "component": "ImageFigure",
    "props": {
      "url": "https://example.com/image.jpg",
      "caption": "Descriptive caption for the image",
      "alt": "Alternative text for accessibility"
    }
  }
}
```

---

## Response Format

### Success Response

**Status:** `200 OK`

**Headers:**
```
Content-Type: image/png (or image/jpeg, image/webp)
Content-Length: [size in bytes]
Cache-Control: public, max-age=3600
```

**Body:** Binary image data

### Error Responses

**400 Bad Request**
```json
{
  "error": "Missing required field: templateId",
  "message": "Template ID is required"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to generate thumbnail",
  "message": "Template two_column not found"
}
```

---

## Complete Examples

### Example 1: Medical Education Slide

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
          },
          {
            "type": "keypoint",
            "content": "Can indicate serious underlying conditions"
          }
        ]
      },
      "column2": {
        "content": [
          {
            "type": "detail",
            "content": "Acanthosis nigricans is a dermatological sign that may reflect metabolic disorders. Early recognition is essential for appropriate management."
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

### Example 2: Title Slide

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
    },
    "options": {
      "width": 1920,
      "height": 1080,
      "format": "webp"
    }
  }' \
  --output title.webp
```

### Example 3: JavaScript/TypeScript Integration

```typescript
async function generateThumbnail(templateId: string, props: any) {
  const response = await fetch('http://localhost:3001/thumbnail/template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
    const error = await response.json();
    throw new Error(`Thumbnail generation failed: ${error.message}`);
  }

  return response.arrayBuffer();
}

// Usage
const thumbnailBuffer = await generateThumbnail('two_column', {
  title: 'My Slide',
  column1: { content: [...] },
  column2: { content: [...] }
});
```

---

## Performance Notes

- **Caching**: Responses include cache headers for 1 hour
- **Concurrent Requests**: Service handles multiple simultaneous requests
- **Memory Usage**: Browser instances are reused for efficiency
- **Timeout**: Requests timeout after 30 seconds

---

## Deployment

### Local Development
```bash
npm run dev
# Service available at http://localhost:3001
```

### Docker
```bash
docker-compose up
# Service available at http://localhost:3001
```

### Production (Render.com)
See `docker-render.md` for complete deployment instructions.

---

## Troubleshooting

### Common Issues

1. **Template not found**: Verify `templateId` matches available templates
2. **Invalid props**: Check template-specific prop requirements
3. **Image generation fails**: Verify content structure and media URLs
4. **Timeout errors**: Reduce image complexity or increase timeout

### Debug Mode
Set environment variable for detailed logging:
```bash
DEBUG=playwright:* npm run dev
```

### Health Check
Always verify service is running:
```bash
curl http://localhost:3001/health
