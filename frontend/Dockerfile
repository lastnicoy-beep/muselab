FROM node:20-alpine AS deps
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL:-http://localhost:4000}
COPY --from=deps /app/node_modules ./node_modules
COPY frontend ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]


