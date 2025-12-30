# Backend API Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start the server
CMD ["node", "src/index.js"]
