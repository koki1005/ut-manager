# syntax=docker/dockerfile:1

# --- 依存インストール ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- ビルド ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- 実行（standalone） ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Cloud Run は PORT を注入する（既定 8080）
ENV PORT=8080
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 8080
CMD ["node", "server.js"]
