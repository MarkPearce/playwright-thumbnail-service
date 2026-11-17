FROM mcr.microsoft.com/playwright:v1.64.1-noble

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

# Run unprivileged; the image ships pwuser for this.
USER pwuser
CMD ["node", "dist/server.js"]
