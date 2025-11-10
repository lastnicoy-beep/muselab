FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy Prisma schema (root prisma/)
COPY prisma ./prisma

# Copy backend source
COPY backend/src ./src
COPY backend/package.json ./package.json

# Generate Prisma client
RUN npx prisma generate --schema ./prisma/schema.prisma

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy built deps and app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

# Ensure Prisma is available
RUN npx prisma generate --schema ./prisma/schema.prisma

# Create uploads directory
RUN mkdir -p uploads

# Copy and make entrypoint executable
COPY backend/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 4000

# Use entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]


