# Deployment Guide for Playwright Thumbnail Service

## Local Setup Instructions

### 1. Install Dependencies
```bash
cd /Users/mpe/repos/playwright-thumbnail-service
npm install
npx playwright install chromium
```

### 2. Build CSS
```bash
npm run build:css
```

### 3. Start the Service
```bash
# Development mode with hot reload
npm run dev

# Or use Docker
docker-compose up
```

### 4. Test the Service
```bash
# In another terminal
npm run test
```

## Integration with Your Main App

### 1. Create Symbolic Link (Optional)
If you want to replace your existing thumbnail service:
```bash
cd /Users/mpe/repos/amboss-presenter/external_services
rm -rf thumbnail_service
ln -s ../../playwright-thumbnail-service thumbnail_service
```

### 2. Update Your Thumbnail Generation Code
Instead of using the old service, send TSX components directly:

```typescript
// In your microservice-thumbnail.service.ts
const response = await fetch('http://localhost:3001/thumbnail', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    component: tsxComponentCode, // Your actual TSX code as string
    props: {
      title: slide.title,
      subtitle: slide.subtitle,
      leftContent: slide.leftContent,
      rightContent: slide.rightContent
    },
    options: {
      width: 1280,
      height: 720,
      format: 'webp'
    }
  })
});
```

## Deployment to Render.com

### 1. Prepare Your Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub account if not already connected
4. Select your `playwright-thumbnail-service` repository

### 3. Configure Service Settings

**Basic Settings:**
- **Name**: `playwright-thumbnail-service`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Runtime**: `Docker`

**Advanced Settings:**
- **Port**: Leave empty (uses PORT env var)
- **Health Check Path**: `/health`
- **Auto-Deploy**: Yes (for automatic updates)

**Environment Variables:**
```
NODE_ENV=production
PORT=3001
```

### 4. Deploy
Click "Create Web Service" and wait for deployment to complete.

### 5. Update Your Main App
Update your environment variables to point to the Render service:
```
THUMBNAIL_SERVICE_URL=https://playwright-thumbnail-service.onrender.com
```

## Docker Deployment (Alternative)

### Build for Production
```bash
docker build -t playwright-thumbnail-service:latest .
```

### Run in Production
```bash
docker run -d \
  --name thumbnail-service \
  -p 3001:3001 \
  -e NODE_ENV=production \
  playwright-thumbnail-service:latest
```

## Monitoring & Maintenance

### Health Checks
Monitor the service health:
```bash
curl https://your-service-url.onrender.com/health
```

### Logs
- **Render**: View logs in the Render dashboard
- **Docker**: `docker logs thumbnail-service`

### Performance Tips
1. The service reuses browser instances for better performance
2. Consider adding Redis for caching frequently requested thumbnails
3. Monitor memory usage - Playwright can be memory intensive

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Run `npm install` again
   - Make sure all dependencies are in package.json

2. **Playwright browser not found**
   - Run `npx playwright install chromium`
   - In Docker, make sure you're using the official Playwright image

3. **Fonts not rendering**
   - Check that Google Fonts URLs are accessible
   - Verify font names in your components

4. **Memory issues on Render**
   - Upgrade to a larger instance if needed
   - Implement browser instance pooling with limits

### Debug Mode
Set environment variable for more logging:
```
DEBUG=playwright:*
```

## Next Steps

1. **Add Caching**: Implement Redis caching for generated thumbnails
2. **Add Authentication**: Secure the endpoint if needed
3. **Monitor Performance**: Set up monitoring with tools like Datadog or New Relic
4. **Optimize**: Profile and optimize rendering performance

## Support

For issues specific to:
- **Playwright**: Check [Playwright docs](https://playwright.dev/)
- **Render deployment**: Check [Render docs](https://render.com/docs)
- **Your implementation**: Check the test files and examples in this repo
