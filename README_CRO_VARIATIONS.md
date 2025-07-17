# CRO Variation Rendering Extensions for Playwright Thumbnail Service

This document describes the new endpoints added to the Playwright-based thumbnail service for rendering CRO (Conversion Rate Optimization) variations.

## New Endpoints

### 1. Render Variation Preview
**POST** `/render-variation`

Renders a single variation with the original design system applied.

**Request Body:**
```json
{
  "modifiedHtml": "<html>...</html>",  // Required: The variation HTML
  "designSystem": {                     // Optional: Design tokens from reference page
    "css": "/* Original CSS */",
    "fonts": [
      { "url": "https://fonts.googleapis.com/...", "family": "Arial" }
    ],
    "colorPalette": {
      "primary": "#007bff",
      "secondary": "#6c757d"
    },
    "typography": {
      "baseSize": "16px",
      "headingFont": "Arial"
    }
  },
  "changes": [                          // Optional: Array of changes for highlighting
    {
      "selector": "h1",
      "changeType": "content",
      "originalContent": "Old Text",
      "newContent": "New Text"
    }
  ],
  "options": {                          // Optional: Rendering options
    "width": 1440,
    "height": 900,
    "deviceScaleFactor": 1,
    "format": "png",                    // "png", "jpeg", or "webp"
    "quality": 90,                      // For JPEG only
    "fullPage": false,                  // Capture full page height
    "highlightChanges": true            // Highlight changed elements
  }
}
```

**Response:** Image buffer (PNG/JPEG/WebP)

### 2. Render Side-by-Side Comparison
**POST** `/render-comparison`

Renders a side-by-side comparison of the original page and variation.

**Request Body:**
```json
{
  "originalHtml": "<html>...</html>",   // Required: Original page HTML
  "modifiedHtml": "<html>...</html>",   // Required: Variation HTML
  "designSystem": { /* Same as above */ },
  "changes": [ /* Same as above */ ],
  "options": {
    "width": 2880,                      // Default: double width for side-by-side
    "height": 900,
    "deviceScaleFactor": 1,
    "format": "png",
    "quality": 90
  }
}
```

**Response:** Image buffer showing side-by-side comparison

### 3. Batch Render Variations
**POST** `/render-batch`

Renders multiple variations in a single request.

**Request Body:**
```json
{
  "variations": [
    {
      "id": "variation-1",
      "modifiedHtml": "<html>...</html>",
      "designSystem": { /* ... */ },
      "changes": [ /* ... */ ]
    },
    {
      "id": "variation-2",
      "modifiedHtml": "<html>...</html>",
      "designSystem": { /* ... */ },
      "changes": [ /* ... */ ]
    }
  ],
  "options": {
    "width": 1440,
    "height": 900,
    "format": "png"
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "variation-1",
      "success": true,
      "image": "base64-encoded-image-data",
      "error": null
    },
    {
      "id": "variation-2",
      "success": false,
      "image": null,
      "error": "Error message"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1
  }
}
```

## Viewport Presets

Common viewport sizes for responsive testing:

```javascript
const viewports = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 }
};
```

## Design System Integration

The `designSystem` object allows you to apply the original page's styling to variations:

- **css**: Complete CSS from the original page
- **fonts**: Array of font definitions with URLs and family names
- **colorPalette**: Color tokens (can be nested)
- **typography**: Typography settings

## Change Highlighting

When `highlightChanges` is enabled in options:
- Changed elements are outlined with a dashed blue border
- A small indicator shows the type of change
- Useful for reviewing what was modified in each variation

## Implementation Details

### Technology Stack
- **Playwright** for browser automation and screenshot generation
- **TypeScript** for type safety
- **Express** for HTTP server
- Uses the same browser instance management as the existing service

### Key Features
- Preserves original design system in variations
- Supports multiple image formats (PNG, JPEG, WebP)
- Efficient browser instance reuse
- Side-by-side comparison views
- Batch processing capabilities

## Recommended Dependencies for Better Design System Support

To improve the ability to generate plausible variations for different design systems, consider adding:

### CSS Processing
```json
{
  "postcss": "^8.4.33",
  "postcss-preset-env": "^9.3.0",
  "cssnano": "^6.0.3"
}
```
- Better CSS parsing and optimization
- Support for modern CSS features
- CSS minification for performance

### HTML Processing
```json
{
  "cheerio": "^1.0.0-rc.12",
  "jsdom": "^24.0.0"
}
```
- Server-side DOM manipulation
- Better HTML parsing and modification
- CSS selector support for change highlighting

### Design Token Management
```json
{
  "style-dictionary": "^3.9.1",
  "color": "^4.2.3"
}
```
- Design token transformation
- Color manipulation and contrast checking
- Design system standardization

### Font Management
```json
{
  "@fontsource/inter": "^5.0.16",
  "@fontsource/roboto": "^5.0.8",
  "webfontloader": "^1.6.28"
}
```
- Common web fonts for fallbacks
- Font loading optimization
- Better font rendering control

## Integration with CRO Service

The thumbnail service integrates with the CRO variation generator:

1. Variation generator creates HTML variations
2. Extracts design system from reference pages
3. Calls thumbnail service to generate previews
4. Stores preview images in Supabase Storage
5. Returns preview URLs to frontend

## Performance Considerations

- Browser instance is reused across requests
- Images are cached with appropriate headers
- Batch rendering processes variations sequentially to avoid memory issues
- Playwright is configured with performance-optimized flags

## Development

To add the CRO variation endpoints to your existing service:

1. Add the `variation-renderer.ts` file
2. Import and use the new functions in `server.ts`
3. The existing thumbnail endpoints remain unchanged
4. Service runs on the same port (3001 by default)

## Testing

Test the new endpoints:

```bash
# Test variation rendering
curl -X POST http://localhost:3001/render-variation \
  -H "Content-Type: application/json" \
  -d '{
    "modifiedHtml": "<h1>Test Variation</h1>",
    "options": { "width": 800, "height": 600 }
  }' \
  --output variation.png

# View examples
curl http://localhost:3001/example
```

## Deployment

The service is ready for deployment with the new endpoints. No changes needed to the existing deployment configuration - just rebuild and deploy as usual.
