# Lightweight React Executor for CodeAct Learning Bot
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for headless browser and educational libraries
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
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
    libjpeg-turbo-dev

# Tell Puppeteer to skip installing Chromium. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Create directories for component generation
RUN mkdir -p /app/components/generated
RUN mkdir -p /app/public/screenshots
RUN mkdir -p /app/templates

# Create non-root user for security
RUN addgroup -g 1001 -S reactexec
RUN adduser -S reactexec -u 1001

# Change ownership of the app directory
RUN chown -R reactexec:reactexec /app
USER reactexec

# Expose port for React executor API
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the React executor server
CMD ["npm", "start"]
