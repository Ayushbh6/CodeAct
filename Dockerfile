# React CodeAct Learning Bot - Lightweight Docker Setup
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for educational libraries
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY package*.json ./

# Install dependencies with optimized caching
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S reactuser -u 1001

# Change ownership of the app directory
RUN chown -R reactuser:nodejs /app
USER reactuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
