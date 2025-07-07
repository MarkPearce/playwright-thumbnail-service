# Docker and Render.com Deployment Instructions

## Docker Deployment

### Local Development with Docker

1. **Build and run with docker-compose**:
   ```bash
   docker-compose up
   ```

2. **Or build and run manually**:
   ```bash
   docker build -t playwright-thumbnail-service .
   docker run -p 3001:3001 playwright-thumbnail-service
   ```

### Production Docker Deployment

```bash
docker build -t playwright-thumbnail-service:latest .
docker run -d \
  --name thumbnail-service \
  -p 3001:3001 \
  -e NODE_ENV=production \
  playwright-thumbnail-service:latest
```

## Render.com Deployment

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

## Monitoring on Render

- View logs in the Render dashboard
- Monitor health at: `https://your-service-url.onrender.com/health`
- Set up alerts for downtime

## Scaling on Render

If you need more performance:
1. Go to your service settings
2. Upgrade to a larger instance type
3. Consider adding multiple instances with load balancing
