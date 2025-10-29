# Frontend Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Build stage
FROM base AS builder
WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ARG VITE_GEMINI_API_KEY

# Set as environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS runner

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
