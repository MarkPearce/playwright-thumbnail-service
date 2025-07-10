# Portrait Image Handling Fix for Thumbnails and Live Presentations

## Overview

This update addresses the issue where portrait (tall) images were being clipped at the bottom in both thumbnail generation and live presentations. The fix ensures that both portrait and landscape images are properly displayed within their containers across the entire application.

## Problem

Previously, images in thumbnails used `object-contain` which:
- Preserved the aspect ratio but left empty space
- Made portrait images appear "clipped" because they didn't fill the container
- Created inconsistent visual appearance between landscape and portrait images

## Solution Implemented

### 1. **Updated ImageContainer Component**
- Added configurable `objectFit` and `objectPosition` props
- Changed default from `object-contain` to `object-cover`
- Allows fine-tuned control over image display

```tsx
// Before
className="w-full h-full object-contain lg:h-auto xl:h-auto 2xl:h-auto"

// After
objectFit="cover"  // Default, can be customized
objectPosition="center"  // Default, can be customized
```

### 2. **Updated MediaRenderer Component**
- Wrapped images in a container div with proper overflow handling
- Applied `object-cover` to images for better fill behavior
- Centered images to ensure important content remains visible

```tsx
// New structure
<div className="relative w-full h-full overflow-hidden rounded shadow">
  <img 
    className="w-full h-full object-cover"
    style={{ objectPosition: 'center' }}
  />
</div>
```

### 3. **Updated Slide Styles**
- Removed hardcoded `object-contain` from figure image styles
- Allows components to control their own object-fit behavior

### 4. **Updated TitleSlide Template**
- Uses the new ImageContainer props for background images
- Ensures portrait backgrounds fill the slide properly

## Benefits

1. **Better Visual Consistency**: Portrait and landscape images now fill their containers consistently
2. **No More Clipping**: Images use `object-cover` to fill the space without appearing cut off
3. **Flexible Control**: Components can override the default behavior when needed
4. **Centered Focus**: Images are centered to keep important content visible

## Testing

A test script has been created at `test-portrait-images.js` that:
- Tests portrait images in content columns
- Tests portrait images as slide backgrounds
- Compares portrait vs landscape rendering
- Generates test thumbnails for visual verification

### Running the Test

```bash
# Make sure the thumbnail service is running
cd external_services/playwright-thumbnail-service
npm start

# In another terminal, run the test
node test-portrait-images.js
```

The test will generate thumbnails in `./test-thumbnails/` directory for visual inspection.

## Systems Updated

### 1. **Thumbnail Service** (`external_services/playwright-thumbnail-service/`)
- `src/templates/shared/ImageContainer.tsx`
- `src/templates/shared/MediaRenderer.tsx`
- `src/templates/shared/slideStyles.ts`
- `src/templates/TitleSlide.tsx`

### 2. **Main Application** (`src/domains/content/services/template/`)
- `templates/shared/ImageContainer.tsx`
- `templates/shared/MediaRenderer.tsx`
- `templates/shared/slideStyles.ts`
- `templates/templates/TitleSlide.tsx`

Both systems now use identical image handling logic, ensuring perfect consistency between thumbnails and live presentations.

## Migration Notes

- Existing thumbnails will automatically use the new rendering when regenerated
- Live presentations will immediately use the new rendering
- No changes needed to existing slide data
- The change is backward compatible

## Regenerating Thumbnails

To apply the fix to existing thumbnails, run:
```bash
# Force regenerate all thumbnails
node scripts/pipeline/lib/generate-canonical.js --force

# Or for a specific article
node scripts/pipeline/lib/generate-canonical.js --article-id=YOUR_ARTICLE_ID --force
```

## Future Considerations

If specific slides need different image handling:
1. The `ImageContainer` component now accepts `objectFit` prop in both systems
2. Templates can specify custom object-fit values as needed
3. Consider adding image focal point detection for smart cropping
4. Both systems must be updated together to maintain consistency
