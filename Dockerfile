# Root Dockerfile for backend API - Multi-stage build
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY backend/package*.json ./

# Install all dependencies
RUN npm ci

# Copy prisma schema and generate client
COPY backend/prisma ./prisma/
RUN npx prisma generate

# Copy source and build
COPY backend/tsconfig.json ./
COPY backend/src ./src/
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files and install production deps only
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy prisma schema and generated client
COPY backend/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built code
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
