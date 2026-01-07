# Backend API Dockerfile
FROM node:18-bookworm-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy TypeScript config and source code
COPY tsconfig.json ./
COPY src ./src/

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start the server from compiled JS
CMD ["node", "dist/index.js"]
