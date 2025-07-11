FROM mcr.microsoft.com/playwright:v1.53.2-jammy

WORKDIR /app

# Install all dependencies (including dev deps for building)
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript and CSS
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3001

# Run the service
CMD ["node", "dist/server.js"]
