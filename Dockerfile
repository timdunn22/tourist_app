# Root Dockerfile for backend API
FROM node:20-bullseye

WORKDIR /app

# Set Prisma to use native binary target
ENV PRISMA_CLI_QUERY_ENGINE_TYPE="binary"
ENV PRISMA_CLIENT_ENGINE_TYPE="binary"

# Copy and install backend dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy prisma schema and generate client
COPY backend/prisma ./prisma/
RUN npx prisma generate

# Copy TypeScript config and source code
COPY backend/tsconfig.json ./
COPY backend/src ./src/

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start the server from compiled JS
CMD ["node", "dist/index.js"]
