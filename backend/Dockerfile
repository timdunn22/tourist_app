# Backend API Dockerfile
FROM node:18-bookworm-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Expose port
EXPOSE 4000

# Start the server - run migrations then start
CMD npx prisma db push --accept-data-loss && node src/index.js
