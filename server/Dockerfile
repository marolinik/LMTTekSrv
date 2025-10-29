# Backend Dockerfile
FROM node:18-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production=false

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3001

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.prod.js || true && node dist/index.js"]
